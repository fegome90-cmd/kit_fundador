"""Integrity and TOCTOU tests for Kit Fundador's frozen registry transport."""
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

ROOT = pathlib.Path(__file__).parent
sys.path.insert(0, str(ROOT))
import lego_registry_snapshot as frozen

FAKE = ROOT / "fake_frozen_cli.mjs"
FAKE.write_text("""
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
const urls=process.argv.slice(2).filter(x=>x.startsWith('http:'));
const visited=new Set();
async function visit(uri) {
  if (visited.has(uri)) return;
  visited.add(uri);
  const rsp=await fetch(uri);
  if(!rsp.ok) throw new Error('snapshot item missing');
  const item=await rsp.json();
  for(const dep of item.registryDependencies||[]) await visit(dep);
  for(const f of item.files||[]) {
    const target=f.target.replace(/^~\\//,'');
    mkdirSync(dirname(target), {recursive:true});
    writeFileSync(target,f.content);
  }
}
for(const uri of urls) await visit(uri);
""")

class ChangingHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, directory, **kwargs):
        super().__init__(*args, directory=directory, **kwargs)
    def log_message(self,*args):
        return
    def do_GET(self):
        self.server.downloads.append(self.path)
        return super().do_GET()
    def copyfile(self, source, outputfile):
        super().copyfile(source, outputfile)
        if (self.server.poison_after_first and
                pathlib.Path(source.name).name == self.server.poison_after_first):
            # The registry origin changes after the initial validated read;
            # the frozen HTTP server must retain the vetted original bytes.
            path=pathlib.Path(source.name)
            item=json.loads(path.read_text())
            item['files'][0]['content']="export const tampered = true;\n"
            path.write_text(json.dumps(item))
            self.server.poison_after_first=None

class RegistryIntegrityTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory(prefix='lego-freeze-test-')
        self.root=pathlib.Path(self.tmp.name)
        self.registry=self.root/'registry'
        self.registry.mkdir()
        self.project=self.root/'consumer'
        self.project.mkdir()
        (self.project/'package.json').write_text('{"name":"freeze-test","version":"0.0.0","private":true}\n')
        self.server=http.server.ThreadingHTTPServer(
            ('127.0.0.1',0),
            lambda *args,**kwargs: ChangingHandler(*args,directory=str(self.registry),**kwargs))
        self.server.downloads=[]
        self.server.poison_after_first=None
        self.thread=threading.Thread(target=self.server.serve_forever,daemon=True)
        self.thread.start()
        self.origin=f'http://127.0.0.1:{self.server.server_port}'
        self.add('core-fastify','src/core.ts',"export const core=true;\n")
        self.add('api-docs','src/docs.ts',"export const frozen=true;\n",['core-fastify'])
    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.tmp.cleanup()

    def add(self,name,path,code,requires=()):
        body={'name':name,'type':'registry:item',
              'files':[{'path':path,'type':'registry:file','target':'~/'+path,'content':code}],
              'dependencies':[],
              'registryDependencies':[f'{self.origin}/{x}.json' for x in requires]}
        (self.registry/(name+'.json')).write_text(json.dumps(body))
        return body

    def create_lock(self, *, mutate=None):
        entries={}
        for name in ('core-fastify','api-docs'):
            data=(self.registry/(name+'.json')).read_bytes()
            entries[name]=hashlib.sha256(data).hexdigest()
        if mutate:
            entries[mutate]='0'*64
        lock=self.root/'registry.lock.json'
        lock.write_text(json.dumps({'version':1,'origin':self.origin,'items':entries}))
        return lock

    def command(self, mode='--install',lock=None):
        args=[sys.executable,str(ROOT/'lego_safe.py'),
              '--registry',self.origin,'--project',str(self.project),
              '--items','api-docs',mode,'--allow-http-localhost']
        if lock:
            args+=['--registry-lock',str(lock)]
        if mode in ('--install','--diff'):
            args+=['--shadcn-cli',str(FAKE)]
        return subprocess.run(args,capture_output=True,text=True,timeout=30)

    def test_remote_origin_requires_a_lock(self):
        with self.assertRaisesRegex(frozen.RegistryIntegrityError,"requires"):
            frozen.load_lock(None,"https://example.invalid",{"api-docs":'0'*64},local_lab_mode=False)

    def test_pinned_local_manifest_accepted(self):
        lock=self.create_lock()
        result=self.command(lock=lock)
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual((self.project/'src/docs.ts').read_text(),"export const frozen=true;\n")

    def test_hash_change_is_rejected_before_any_write(self):
        lock=self.create_lock(mutate='api-docs')
        old=(self.project/'package.json').read_bytes()
        result=self.command(lock=lock)
        self.assertEqual(result.returncode,2)
        self.assertIn('checksum mismatch',result.stderr)
        self.assertFalse((self.project/'src').exists())
        self.assertEqual((self.project/'package.json').read_bytes(),old)

    def test_missing_lock_entry_rejected(self):
        lock=self.create_lock()
        record=json.loads(lock.read_text())
        del record['items']['core-fastify']
        lock.write_text(json.dumps(record))
        result=self.command(lock=lock)
        self.assertEqual(result.returncode,2)
        self.assertIn('checksum mismatch',result.stderr)

    def test_origin_change_between_check_and_install_cannot_change_payload(self):
        self.server.poison_after_first='api-docs.json'
        result=self.command()
        self.assertEqual(result.returncode,0,result.stderr)
        self.assertEqual((self.project/'src/docs.ts').read_text(),"export const frozen=true;\n")
        self.assertIn('tampered',(self.registry/'api-docs.json').read_text())
        self.assertEqual(self.server.downloads.count('/api-docs.json'),1)
        self.assertEqual(self.server.downloads.count('/core-fastify.json'),1)

    def test_unknown_item_not_exposed_by_snapshot_server(self):
        items=[{'name':'only','type':'registry:item','files':[],
                'dependencies':[],'registryDependencies':[]}]
        from urllib.request import urlopen
        from urllib.error import HTTPError
        with frozen.frozen_registry(items,self.origin) as local:
            with urlopen(local+'/only.json',timeout=3) as response:
                self.assertEqual(response.status,200)
            with self.assertRaises(HTTPError) as caught:
                urlopen(local+'/not-in-closure.json',timeout=3)
            self.assertEqual(caught.exception.code,404)

    def test_forbidden_shadcn_extra_keys_rejected(self):
        document=self.add('side-effect','src/ok.ts','safe')
        document['envVars']={'MALICIOUS':'value'}
        (self.registry/'side-effect.json').write_text(json.dumps(document))
        call=[sys.executable,str(ROOT/'lego_safe.py'),
              '--registry',self.origin,'--project',str(self.project),
              '--items','side-effect','--preview','--allow-http-localhost']
        result=subprocess.run(call,capture_output=True,text=True,timeout=15)
        self.assertEqual(result.returncode,2)
        self.assertIn('Unsupported registry item fields',result.stderr)

    def test_registry_url_with_untrusted_file_source_rejected(self):
        doc=self.add('remote-file','https://untrusted.invalid/script.ts','payload')
        (self.registry/'remote-file.json').write_text(json.dumps(doc))
        result=subprocess.run([sys.executable,str(ROOT/'lego_safe.py'),
              '--registry',self.origin,'--project',str(self.project),
              '--items','remote-file','--preview','--allow-http-localhost'],
              capture_output=True,text=True,timeout=15)
        self.assertEqual(result.returncode,2)
        self.assertIn('Unsupported file entry',result.stderr)

if __name__ == '__main__':
    unittest.main(verbosity=2)
