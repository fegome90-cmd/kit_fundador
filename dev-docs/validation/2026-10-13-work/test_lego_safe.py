import hashlib
import http.server
import json
import os
import pathlib
import subprocess
import sys
import tempfile
import threading
import unittest

sys.path.insert(0,str(pathlib.Path(__file__).parent))
import lego_safe

ROOT=pathlib.Path(__file__).parent
FAKE=ROOT/'fake_cli.mjs'
FAKE.write_text('''
import { writeFileSync,mkdirSync,readFileSync,existsSync } from 'node:fs';
import { dirname } from 'node:path';
if (process.env.LEGO_PRIVATE_CANARY) process.exit(47);
if (!process.env.HOME?.includes('lego-stage-')) process.exit(65);
if (existsSync('private/credentials.json')) process.exit(61);
if (existsSync('secrets.txt')) process.exit(62);
const urls=process.argv.slice(2).filter(x=>x.startsWith('http:'));
const done=new Set();
async function visit(url) {
  if(done.has(url))return;done.add(url);
  const d=await(await fetch(url)).json();
  for(const dep of d.registryDependencies||[])await visit(dep);
  for(const f of d.files||[]) {const path=f.target.replace(/^~\\//,'');mkdirSync(dirname(path),{recursive:true});writeFileSync(path,f.content);}
}
for(const url of urls) await visit(url);
const pkg=JSON.parse(readFileSync('package.json','utf8'));
pkg.dependencies={...pkg.dependencies,'fake-dep':'1.0.0'};
writeFileSync('package.json',JSON.stringify(pkg,null,2)+'\\n');
writeFileSync('pnpm-lock.yaml','lockfileVersion: fake\\n');
''')
(ROOT/'bad_cli.mjs').write_text('process.exit(9);\n')

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*args):pass
    def __init__(self,*args,directory,**kwargs):super().__init__(*args,directory=directory,**kwargs)

class LegoSafeTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='lego-test-')
        self.dir=pathlib.Path(self.tmp.name)
        self.reg=self.dir/'registry';self.reg.mkdir()
        self.consumer=self.dir/'consumer';self.consumer.mkdir()
        (self.consumer/'package.json').write_text('{"name":"consumer","version":"1.0.0","private":true,"packageManager":"pnpm@11.25.0"}\n')
        self.http=http.server.ThreadingHTTPServer(('127.0.0.1',0),lambda *a,**k:Handler(*a,directory=str(self.reg),**k))
        self.thread=threading.Thread(target=self.http.serve_forever,daemon=True);self.thread.start()
        self.items={}
        self.base=f'http://127.0.0.1:{self.http.server_port}'
        self.add('core-fastify',{'src/core.ts':'export const core=true;\n'})
        core=json.loads((self.reg/'core-fastify.json').read_text());core['dependencies']=['fake-dep@1.0.0'];(self.reg/'core-fastify.json').write_text(json.dumps(core))
        self.add('api-docs',{'src/docs.ts':'export const docs=true;\n'},requires=['core-fastify'])
        self.add('jobs-postgres',{'src/backend.ts':'export const jobs="pg";\n'},requires=['core-fastify'])
        self.add('jobs-valkey',{'src/backend.ts':'export const jobs="valkey";\n'},requires=['core-fastify'])
    def tearDown(self):
        self.http.shutdown();self.http.server_close();self.tmp.cleanup()
    def add(self,name,files,requires=()):
        item={'name':name,'type':'registry:item','files':[{'type':'registry:file','target':'~/'+k,'path':k,'content':v} for k,v in files.items()], 'registryDependencies':[f'{self.base}/{x}.json' for x in requires], 'dependencies':[]}
        (self.reg/(name+'.json')).write_text(json.dumps(item))
        return item
    def cmd(self,*items,action='--preview',env=None):
        args=[sys.executable,str(ROOT/'lego_safe.py'),'--registry',self.base,'--project',str(self.consumer),'--items',*items,action,'--allow-http-localhost']
        if action in ('--install','--diff'):args+=['--shadcn-cli',str(ROOT/'bad_cli.mjs' if (env or {}).get('FAKE_INSTALL_FAIL') else FAKE)]
        return subprocess.run(args,capture_output=True,text=True,env={**os.environ,**(env or {})})
    def recover(self):
        return subprocess.run([sys.executable,str(ROOT/'lego_safe.py'),'--project',str(self.consumer),'--recover'],capture_output=True,text=True)
    def checksum(self):
        return {x.relative_to(self.consumer).as_posix():hashlib.sha256(x.read_bytes()).hexdigest() for x in self.consumer.rglob('*') if x.is_file()}

    def test_preview_readonly_and_dependency_closure(self):
        before=self.checksum();r=self.cmd('api-docs');self.assertEqual(r.returncode,0,r.stderr)
        self.assertEqual(before,self.checksum())
        d=json.loads(r.stdout);self.assertEqual(d['writes'],0)
        self.assertEqual(d['items'],['core-fastify','api-docs'])
    def test_preflight_rejects_mutually_exclusive(self):
        before=self.checksum();r=self.cmd('jobs-postgres','jobs-valkey',action='--install')
        self.assertEqual(r.returncode,2);self.assertIn('Conflicting target',r.stderr);self.assertEqual(before,self.checksum())
    def test_preflight_rejects_conflicting_jobs_even_without_file_overlap(self):
        self.add('jobs-valkey',{'src/valkey-backend.ts':'other\n'},requires=['core-fastify'])
        r=self.cmd('jobs-postgres','jobs-valkey');self.assertEqual(r.returncode,2)
        self.assertIn('Mutually exclusive',r.stderr)
    def test_reject_path_traversal(self):
        self.add('attack',{'../victim':'hack'})
        r=self.cmd('attack');self.assertEqual(r.returncode,2);self.assertIn('Path traversal',r.stderr)
    def test_reject_untrusted_dependency_url(self):
        item=self.add('evil',{'src/evil.ts':'evil'})
        item['registryDependencies']=['http://10.0.0.1:8080/x.json'];(self.reg/'evil.json').write_text(json.dumps(item))
        r=self.cmd('evil');self.assertEqual(r.returncode,2);self.assertIn('Out-of-origin',r.stderr)
    def test_reject_existing_consumer_modified_file(self):
        d=self.consumer/'src';d.mkdir();(d/'docs.ts').write_text('consumer-owned\n')
        before=self.checksum();r=self.cmd('api-docs',action='--install')
        self.assertEqual(r.returncode,2);self.assertEqual(before,self.checksum())
    def test_install_from_stage(self):
        r=self.cmd('api-docs',action='--install');self.assertEqual(r.returncode,0,r.stderr)
        self.assertTrue((self.consumer/'src'/'docs.ts').is_file())
        self.assertIn('fake-dep',(self.consumer/'package.json').read_text())
        self.assertTrue((self.consumer/'pnpm-lock.yaml').is_file())
    def test_real_staged_diff_readonly(self):
        before=self.checksum();r=self.cmd('api-docs',action='--diff')
        self.assertEqual(r.returncode,0,r.stderr)
        d=json.loads(r.stdout)
        self.assertEqual(d['mode'],'diff');self.assertEqual(d['writes'],0)
        self.assertEqual(before,self.checksum())
        paths={p['path'] for p in d['patches']}
        self.assertIn('src/docs.ts',paths)
        self.assertIn('package.json',paths)
        self.assertIn('pnpm-lock.yaml',paths)
    def test_protected_manifest_target(self):
        self.add('poison',{'package.json':'{}'})
        r=self.cmd('poison');self.assertEqual(r.returncode,2)
        self.assertIn('Protected target',r.stderr)
    def test_mismatched_existing_package_rejected(self):
        package=json.loads((self.consumer/'package.json').read_text())
        package['dependencies']={'fake-dep':'0.9.0'}
        (self.consumer/'package.json').write_text(json.dumps(package))
        before=self.checksum()
        result=self.cmd('api-docs',action='--install')
        self.assertEqual(result.returncode,2)
        self.assertIn('Consumer dependency mismatch',result.stderr)
        self.assertEqual(before,self.checksum())
    def test_installer_undeclared_dependency_rejected(self):
        # Fake CLI always adds fake-dep, but these two items don't declare it.
        self.add('standalone',{'src/standalone.ts':'ok'})
        before=self.checksum()
        result=self.cmd('standalone',action='--install')
        self.assertEqual(result.returncode,2)
        self.assertIn('Undeclared dependencies installed',result.stderr)
        self.assertEqual(before,self.checksum())
    def test_invalid_package_name_rejected(self):
        d=self.add('badpackage',{'src/bad.ts':'ok'})
        d['dependencies']=['../evil@1.0.0']
        (self.reg/'badpackage.json').write_text(json.dumps(d))
        result=self.cmd('badpackage')
        self.assertEqual(result.returncode,2)
        self.assertIn('Unpinned/invalid version',result.stderr)
    def test_hidden_npmrc_rejected(self):
        self.add('npmrc',{'.npmrc':'ignore-scripts=false'})
        r=self.cmd('npmrc');self.assertEqual(r.returncode,2)
        self.assertIn('Protected target',r.stderr)
    def test_environment_secret_not_forwarded(self):
        r=self.cmd('api-docs',action='--install',env={'LEGO_PRIVATE_CANARY':'top-secret-test-canary'})
        self.assertEqual(r.returncode,0,r.stderr)
    def test_preflight_never_opens_unrelated_unreadable_file(self):
        directory=self.consumer/'private'
        directory.mkdir()
        secret=directory/'unreadable-secret.txt'
        secret.write_text('SENSITIVE_LOCAL_FIXTURE')
        secret.chmod(0)
        try:
            result=self.cmd('api-docs',action='--preview')
            self.assertEqual(result.returncode,0,result.stderr)
        finally:
            secret.chmod(0o600)
        self.assertEqual(secret.read_text(),'SENSITIVE_LOCAL_FIXTURE')

    def test_stage_excludes_unrelated_project_files(self):
        private=self.consumer/'private'
        private.mkdir()
        (private/'credentials.json').write_text('{"token":"sensitive-test-canary"}')
        (self.consumer/'secrets.txt').write_text('DO_NOT_STAGE')
        before=self.checksum()
        result=self.cmd('api-docs',action='--install')
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual((private/'credentials.json').read_text(),'{"token":"sensitive-test-canary"}')
        self.assertEqual((self.consumer/'secrets.txt').read_text(),'DO_NOT_STAGE')
        current=self.checksum()
        for path in ('private/credentials.json','secrets.txt'):
            self.assertEqual(current[path],before[path],path)
    def test_sigkill_durable_recovery_restores_baseline(self):
        baseline=self.checksum()
        killed=self.cmd('api-docs',action='--install',env={'LEGO_TEST_KILL_AFTER':'2'})
        self.assertEqual(killed.returncode,-9,killed.stderr)
        txn=self.consumer/'.lego-install-txn'
        self.assertTrue((txn/'manifest.json').is_file())
        self.assertNotEqual(baseline,self.checksum())
        denied=self.cmd('api-docs',action='--install')
        self.assertEqual(denied.returncode,2)
        self.assertIn('--recover',denied.stderr)
        recovered=self.recover()
        self.assertEqual(recovered.returncode,0,recovered.stderr)
        self.assertEqual(baseline,self.checksum())
        self.assertFalse(txn.exists())

    def test_recovery_will_not_overwrite_post_crash_consumer_edits(self):
        baseline=self.checksum()
        killed=self.cmd('api-docs',action='--install',env={'LEGO_TEST_KILL_AFTER':'1'})
        self.assertEqual(killed.returncode,-9)
        current=(self.consumer/'package.json').read_bytes()
        (self.consumer/'package.json').write_text('{"name":"edited-after-crash"}')
        denied=self.recover()
        self.assertEqual(denied.returncode,2)
        self.assertIn('Consumer changed since interruption',denied.stderr)
        self.assertIn('edited-after-crash',(self.consumer/'package.json').read_text())
        self.assertTrue((self.consumer/'.lego-install-txn'/'manifest.json').exists())
        (self.consumer/'package.json').write_bytes(current)
        recovered=self.recover()
        self.assertEqual(recovered.returncode,0,recovered.stderr)
        self.assertEqual(baseline,self.checksum())

    def test_stage_error_clears_exclusive_lock(self):
        baseline=self.checksum()
        failed=self.cmd('api-docs',action='--install',env={'FAKE_INSTALL_FAIL':'1'})
        self.assertEqual(failed.returncode,2)
        self.assertEqual(baseline,self.checksum())
        self.assertFalse((self.consumer/'.lego-install-txn').exists())

    def test_exclusive_lock_blocks_second_installer(self):
        txn=self.consumer/'.lego-install-txn'
        txn.mkdir()
        baseline=self.checksum()
        denied=self.cmd('api-docs',action='--install')
        self.assertEqual(denied.returncode,2)
        self.assertEqual(baseline,self.checksum())
        recover=self.recover()
        self.assertEqual(recover.returncode,0,recover.stderr)
        self.assertFalse(txn.exists())

    def test_corrupt_recovery_journal_rejected_without_writes(self):
        txn=self.consumer/'.lego-install-txn'
        txn.mkdir()
        (txn/'manifest.json').write_text('{"version":1,"files":[{"path":"src/unknown.ts"}]}')
        baseline=self.checksum()
        failure=self.recover()
        self.assertEqual(failure.returncode,2)
        self.assertEqual(self.checksum(),baseline)
        self.assertTrue((txn/'manifest.json').exists())

    def test_recovery_rejects_traversal_record(self):
        txn=self.consumer/'.lego-install-txn'
        txn.mkdir()
        (txn/'manifest.json').write_text('{"version":1,"files":[{"path":"../escape","oldSha256":null,"oldBase64":null,"newSha256":"'+'0'*64+'"}]}')
        baseline=self.checksum()
        failure=self.recover()
        self.assertEqual(failure.returncode,2)
        self.assertIn('Unsafe transaction path',failure.stderr)
        self.assertEqual(self.checksum(),baseline)

    def test_failure_in_stage_does_not_mutate(self):
        before=self.checksum();r=self.cmd('api-docs',action='--install',env={'FAKE_INSTALL_FAIL':'1'})
        self.assertEqual(r.returncode,2);self.assertEqual(before,self.checksum())
    def test_commit_failure_rolls_back(self):
        before=self.checksum();r=self.cmd('api-docs',action='--install',env={'LEGO_TEST_FAIL_AFTER':'2'})
        self.assertEqual(r.returncode,2);self.assertEqual(before,self.checksum(),r.stderr)
    def test_unknown_name_rejected(self):
        r=self.cmd('missing');self.assertEqual(r.returncode,2)
    def test_symlinks_rejected(self):
        (self.consumer/'evil').symlink_to(self.dir,target_is_directory=True)
        r=self.cmd('api-docs');self.assertEqual(r.returncode,2);self.assertIn('Symlink',r.stderr)
    def test_bad_dep_conflict_versions(self):
        a=self.add('p-one',{'src/one.ts':'one'});a['dependencies']=['pkg@1.0.0'];(self.reg/'p-one.json').write_text(json.dumps(a))
        b=self.add('p-two',{'src/two.ts':'two'});b['dependencies']=['pkg@2.0.0'];(self.reg/'p-two.json').write_text(json.dumps(b))
        r=self.cmd('p-one','p-two');self.assertEqual(r.returncode,2);self.assertIn('Dependency version conflict',r.stderr)

if __name__=='__main__':unittest.main(verbosity=2)
