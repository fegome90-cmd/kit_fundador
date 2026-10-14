#!/usr/bin/env python3
"""Experimental guarded shadcn registry installer for Kit Fundador.

This tool is intentionally NOT a marketplace or runtime plugin manager.
No user files are mutated during preview or failed stage installation.
The commit rollback handles synchronous errors, not process/power termination.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import lego_transaction
from pathlib import Path, PurePosixPath
from urllib.parse import urlsplit
from urllib.request import urlopen

NAME = re.compile(r"^[a-z][a-z0-9-]{0,63}$")
PACKAGE = re.compile(r"^(?:@[a-z0-9][a-z0-9._-]*/)?[a-z0-9][a-z0-9._-]*$")
SKIP_DIRS = {'.git', 'node_modules', '.pnpm-store', 'dist', 'coverage', '__pycache__', '.venv', 'venv'}
MAX_ITEM_BYTES = 2_000_000
MAX_ITEMS = 40
ALLOW_CHANGE = {'package.json', 'pnpm-lock.yaml', 'pnpm-workspace.yaml'}
STAGE_INPUTS = ALLOW_CHANGE | {'tsconfig.json'}

class Rejected(ValueError):
    pass

def sha(content: bytes) -> str:
    return hashlib.sha256(content).hexdigest()

def trusted_base(raw: str, *, allow_local: bool) -> str:
    u = urlsplit(raw)
    if u.query or u.fragment or u.username or u.password or u.path.strip('/'):
        raise Rejected('Registry base must be an origin only')
    if u.scheme == 'https' and u.hostname and u.hostname not in ('localhost', '127.0.0.1'):
        return u.geturl().rstrip('/')
    if allow_local and u.scheme == 'http' and u.hostname in ('127.0.0.1', 'localhost'):
        return u.geturl().rstrip('/')
    raise Rejected('Untrusted registry URL: HTTPS required (or explicit loopback opt-in)')

def url_for(base: str, name: str) -> str:
    if not NAME.fullmatch(name):
        raise Rejected(f'Invalid item id: {name}')
    return f'{base}/{name}.json'

def safe_target(raw: str) -> str:
    if not isinstance(raw, str) or not raw.startswith('~/'):
        raise Rejected('Item has no explicit project-relative target')
    p = raw[2:]
    if '\\' in p or p.startswith('/') or p.endswith('/') or '\x00' in p or ':' in p:
        raise Rejected('Invalid target: ' + raw)
    parts = PurePosixPath(p).parts
    if not parts or any(x in ('..', '.', '') for x in p.split('/')):
        raise Rejected('Path traversal/empty segment: ' + raw)
    if parts[0] in SKIP_DIRS or any(x.startswith('.') for x in parts) or p in ('package.json','pnpm-lock.yaml'):
        raise Rejected('Protected target: ' + raw)
    return p

def snapshot(root: Path) -> dict[str, bytes]:
    result = {}
    for directory, dirs, files in os.walk(root, followlinks=False):
        dirs[:] = [x for x in dirs if x not in SKIP_DIRS]
        parent = Path(directory)
        for folder in dirs:
            if (parent / folder).is_symlink():
                raise Rejected('Symlink directory not permitted: ' + str(parent / folder))
        for file in files:
            f = parent / file
            if f.is_symlink():
                raise Rejected('Symlink file not permitted: ' + str(f))
            rel = f.relative_to(root).as_posix()
            if rel == '.env' or rel.startswith('.env.'):
                # Secrets are not copied into the staging tree or inspected.
                continue
            result[rel] = f.read_bytes()
    return result

def fetch_registry(base: str, requested: list[str]) -> tuple[list[dict], dict[str, str]]:
    selected = {}
    active = set()
    ordered = []
    targets: dict[str, str] = {}
    versions = {}

    def visit(name: str):
        if name in active:
            raise Rejected('Registry dependency cycle: ' + name)
        if name in selected:
            return
        if len(selected) + len(active) >= MAX_ITEMS:
            raise Rejected('Registry graph too large')
        active.add(name)
        url = url_for(base, name)
        with urlopen(url, timeout=8) as rsp:
            if rsp.geturl() != url:
                raise Rejected('Redirects forbidden for registry content')
            raw = rsp.read(MAX_ITEM_BYTES+1)
        if len(raw) > MAX_ITEM_BYTES:
            raise Rejected('Registry item too large')
        try:
            item = json.loads(raw)
        except json.JSONDecodeError as e:
            raise Rejected('Invalid registry JSON: ' + name) from e
        if item.get('name') != name or item.get('type') != 'registry:item':
            raise Rejected('Unexpected registry item id/type: ' + name)
        deps = item.get('registryDependencies', [])
        if not isinstance(deps,list) or len(deps) > MAX_ITEMS:
            raise Rejected('Invalid dependencies: ' + name)
        for d in deps:
            if not isinstance(d,str) or not d.startswith(base+'/') or not d.endswith('.json'):
                raise Rejected('Out-of-origin dependency: ' + repr(d))
            depname = d[len(base)+1:-5]
            if '/' in depname or not NAME.fullmatch(depname):
                raise Rejected('Unsafe dependency: ' + depname)
            visit(depname)
        for file in item.get('files', []):
            if file.get('type') != 'registry:file' or not isinstance(file.get('content'),str):
                raise Rejected('Unsupported file entry in '+name)
            target = safe_target(file.get('target'))
            digest = sha(file['content'].encode('utf-8'))
            if target in targets and targets[target] != digest:
                raise Rejected('Conflicting target: '+target)
            targets[target] = digest
        for dependency in (item.get('dependencies', []) + item.get('devDependencies', [])):
            if not isinstance(dependency,str) or '@' not in dependency[1:]:
                raise Rejected('Unpinned package: ' + str(dependency))
            package, version = dependency.rsplit('@',1)
            if not PACKAGE.fullmatch(package) or not version or re.search(r'[^0-9A-Za-z._^~+-]',version):
                raise Rejected('Unpinned/invalid version: ' + dependency)
            if package in versions and versions[package] != version:
                raise Rejected('Dependency version conflict: '+package)
            versions[package] = version
        active.remove(name)
        selected[name] = item
        ordered.append(item)

    for n in requested:
        visit(n)
    if {'jobs-postgres','jobs-valkey'} <= set(selected):
        raise Rejected('Mutually exclusive jobs backends: jobs-postgres vs jobs-valkey')
    if {'lego-full-a','lego-full-b'} <= set(selected):
        raise Rejected('Mutually exclusive full recipes')
    return ordered, targets

def manifest_versions(items: list[dict]) -> dict[str, str]:
    result = {}
    for item in items:
        for spec in item.get('dependencies', []) + item.get('devDependencies', []):
            key, version = spec.rsplit('@', 1)
            result[key] = version
    return result

def package_versions(data: bytes | None) -> dict[str, str]:
    if data is None:
        raise Rejected('Project requires package.json before registry installation')
    try:
        pkg = json.loads(data)
        deps = pkg.get('dependencies', {})
        dev = pkg.get('devDependencies', {})
        if not isinstance(deps,dict) or not isinstance(dev,dict):
            raise ValueError('dependency field is not object')
        if set(deps) & set(dev):
            raise ValueError('same package declared as dependency and devDependency')
        return {**deps, **dev}
    except (ValueError, TypeError) as err:
        raise Rejected('Invalid package.json: '+str(err)) from err

def preflight_versions(items, existing):
    wanted = manifest_versions(items)
    current = package_versions(existing.get('package.json'))
    for name, version in wanted.items():
        if name in current and current[name] != version:
            raise Rejected(f'Consumer dependency mismatch: {name} {current[name]} vs {version}')
    return current, wanted

def check_staged_versions(before_versions, wanted_versions, staged_bytes):
    actual = package_versions(staged_bytes)
    for name, version in wanted_versions.items():
        if actual.get(name) != version:
            raise Rejected(f'Installed version mismatch: {name} expected {version}, got {actual.get(name)}')
    new = set(actual) - set(before_versions)
    extra = new - set(wanted_versions)
    if extra:
        raise Rejected('Undeclared dependencies installed: '+', '.join(sorted(extra)))

def planned_changes(root: Path, items: list[dict], existing: dict[str,bytes]):
    result = []
    for item in items:
        for file in item.get('files', []):
            target = safe_target(file['target'])
            after = file['content'].encode()
            before = existing.get(target)
            if before is not None and before != after:
                raise Rejected('Existing consumer file would be overwritten: '+target)
            if before is not None and before == after:
                status = 'unchanged'
            else:
                status = 'create'
            result.append({'item':item['name'],'target':target,'status':status})
    return result

def execute(args):
    root=Path(args.project).resolve()
    if not root.is_dir():
        raise Rejected('Project directory does not exist')
    if args.recover:
        restored=lego_transaction.recover(root)
        print(json.dumps({'mode':'recovered','files':restored}))
        return 0
    if (root/lego_transaction.DIRNAME).exists():
        raise Rejected('Unfinished or concurrent LEGO install; run --recover')
    if not args.registry or not args.items:
        raise Rejected('--registry and --items are required except for --recover')
    base=trusted_base(args.registry, allow_local=args.allow_http_localhost)
    names=[]
    for name in args.items:
        for item in name.split(','):
            if item: names.append(item)
    if not names:
        raise Rejected('No items selected')
    items, targets=fetch_registry(base,names)
    before=snapshot(root)
    current_versions, wanted_versions=preflight_versions(items,before)
    entries=planned_changes(root,items,before)
    # shadcn receives only the package manager metadata and the precise files
    # declared by this registry composition, never unrelated consumer files.
    # This is data minimization, not a substitute for filesystem sandboxing.
    staged_before={p:body for p,body in before.items() if p in STAGE_INPUTS or p in targets}
    if args.preview:
        print(json.dumps({'mode':'preview','items':[i['name'] for i in items], 'files':entries,'dependencies':sorted(set(d for x in items for d in x.get('dependencies',[]))),'devDependencies':sorted(set(d for x in items for d in x.get('devDependencies',[]))),'writes':0},indent=2))
        return 0
    if not (args.install or args.diff):
        raise Rejected('Choose --preview, --diff or --install')
    if not args.shadcn_cli:
        raise Rejected('--shadcn-cli required for --diff or --install')
    cli=Path(args.shadcn_cli).resolve(strict=True)
    if args.install:
        lego_transaction.begin(root)
    try:
      with tempfile.TemporaryDirectory(prefix='lego-stage-') as tmp:
          stage=Path(tmp)/'consumer'
          stage.mkdir()
          for rel,body in staged_before.items():
              f=stage/rel
              f.parent.mkdir(parents=True, exist_ok=True)
              f.write_bytes(body)
          # Keep user/application secrets out of installation subprocesses. This is
          # environment hygiene, NOT a sandbox (the child still has user filesystem access).
          allowed_env = {'PATH','HOME','TMPDIR','TMP','TEMP','CI','PNPM_HOME',
                         'COREPACK_HOME','XDG_CACHE_HOME','HTTP_PROXY','HTTPS_PROXY',
                         'NO_PROXY','no_proxy','npm_config_registry','NPM_CONFIG_REGISTRY',
                         'SSL_CERT_FILE','NODE_EXTRA_CA_CERTS'}
          env={k:v for k,v in os.environ.items() if k in allowed_env}
          if args.allow_http_localhost:
              env.pop('ALL_PROXY',None);env.pop('all_proxy',None)
              env['NO_PROXY']='localhost,127.0.0.1';env['no_proxy']=env['NO_PROXY']
          cmd=['node',str(cli),'add',*[url_for(base,x) for x in names],'--yes']
          proc=subprocess.run(cmd,cwd=stage,env=env,capture_output=True,text=True,timeout=180)
          if proc.returncode != 0:
              raise Rejected('Installer staging failed with code '+str(proc.returncode)+': '+(proc.stdout+'\n'+proc.stderr)[-800:])
          after=snapshot(stage)
          check_staged_versions(current_versions,wanted_versions,after.get('package.json'))
          added = {p:v for p,v in after.items() if staged_before.get(p)!=v}
          unexpected=set(added)-set(targets)-ALLOW_CHANGE
          if unexpected:
              raise Rejected('Unexpected installed files: '+', '.join(sorted(unexpected)))
          for rel in targets:
              if rel not in after or sha(after[rel]) != targets[rel]:
                  raise Rejected('Manifest/installed file hash mismatch: '+rel)
          if 'components.json' in after:
              raise Rejected('Installer unexpectedly added components.json')
          if args.diff:
              patches = []
              for target, body in sorted(added.items()):
                  old = staged_before.get(target, b'')
                  try:
                      old_lines = old.decode('utf-8').splitlines(keepends=True)
                      new_lines = body.decode('utf-8').splitlines(keepends=True)
                      full = list(difflib.unified_diff(old_lines, new_lines, fromfile='a/'+target, tofile='b/'+target))
                  except UnicodeDecodeError:
                      full = ['[binary change omitted]']
                  patches.append({'path': target, 'oldSha256': sha(old) if target in staged_before else None,
                                  'newSha256': sha(body), 'diffLines': len(full),
                                  'unifiedDiffExcerpt': ''.join(full[:40]), 'truncated': len(full)>40})
              print(json.dumps({'mode':'diff','items':[i['name'] for i in items],
                                'patches':patches,'writes':0},indent=2))
              return 0
          changed=lego_transaction.commit(root,staged_before,after)
    finally:
        if args.install:
            # Stage failures remove their empty exclusive lock. Crashed commits
            # retain the durable manifest for explicit --recover.
            lego_transaction.discard_empty(root)
    print(json.dumps({'mode':'installed','items':[i['name'] for i in items],'changes':changed,'stageExit':0},indent=2))
    return 0

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument('--project',required=True)
    p.add_argument('--registry')
    p.add_argument('--items',nargs='+')
    mode=p.add_mutually_exclusive_group(required=True)
    mode.add_argument('--preview',action='store_true')
    mode.add_argument('--diff',action='store_true')
    mode.add_argument('--install',action='store_true')
    mode.add_argument('--recover',action='store_true')
    p.add_argument('--shadcn-cli')
    p.add_argument('--allow-http-localhost',action='store_true')
    args=p.parse_args()
    try: return execute(args)
    except (Rejected, lego_transaction.TransactionRejected, OSError, subprocess.TimeoutExpired, RuntimeError) as e:
        print('LEGO_REJECTED: '+str(e),file=sys.stderr)
        return 2

if __name__=='__main__': sys.exit(main())
