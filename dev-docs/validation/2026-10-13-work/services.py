import pathlib,subprocess,time,socket,sys,os
root=pathlib.Path(__file__).resolve().parent
mode=sys.argv[1]
def run(label,cwd,*cmd):
    env=os.environ.copy()
    if label.startswith('registry-') and cmd[0]=='node':
        # shadcn ignores NO_PROXY for its globally selected Socks agent. Local
        # fixtures use direct loopback; pnpm retains npm_config proxy settings.
        for k in ['ALL_PROXY','all_proxy']:env.pop(k,None)
        env['NO_PROXY']='127.0.0.1,localhost';env['no_proxy']=env['NO_PROXY']
    return subprocess.run([sys.executable,str(root/'run.py'),label,str(cwd),*cmd],env=env).returncode
def wait(port):
    for _ in range(100):
        try:
            with socket.create_connection(('127.0.0.1',port),.1):return
        except OSError:time.sleep(.05)
    raise RuntimeError('service timeout')
if mode in ['jobs','persistence','smoke']:
    log=(root/'evidence'/'valkey-suite-server.log').open('w')
    server=subprocess.Popen([str(root/'valkey/src/valkey-server'),'--bind','127.0.0.1','--port','56379','--dir',str(root/'valkey-data'),'--appendonly','yes','--appendfsync','always','--maxmemory-policy','noeviction'],stdout=log,stderr=log)
    try:
        wait(56379)
        os.environ['LAB_VALKEY_PID']=str(server.pid)
        code=0
        if mode=='smoke':code=run('registry-smoke-b-jobs-on',root,'node',str(root/'smoke.mjs'),str(root/'consumer-fixed-b'),'on','on')
        if mode=='jobs':code=run('valkey-jobs-tests-live',root/'prototype','node','--test','tests/jobs.test.mjs')
        if mode=='jobs' and (root/'prototype/tests/benchmark.mjs').exists():code|=run('valkey-benchmark',root/'prototype','node','tests/benchmark.mjs')
        if mode!='smoke' and (root/'prototype/tests/persistence.mjs').exists():code|=run('valkey-persistence',root/'prototype','node','tests/persistence.mjs')
    finally:
        if server.poll() is None:server.terminate();server.wait(timeout=5)
    sys.exit(code)
if mode=='registry':
    import hashlib,json,tempfile
    runs=root/'registry-runs';runs.mkdir(exist_ok=True)
    run_dir=pathlib.Path(tempfile.mkdtemp(prefix='run-',dir=runs))
    fixed=len(sys.argv)>2
    for name in ['a','b','conflict']:
        p=run_dir/name;p.mkdir()
        (p/'package.json').write_text(json.dumps({'name':'consumer-'+name,'version':'0.0.0','private':True,'type':'module','packageManager':'pnpm@11.25.0'},indent=2)+'\n')
        if fixed:(p/'pnpm-workspace.yaml').write_text((root/'prototype/pnpm-workspace.yaml').read_text())
    steps=[];required=[]
    def step(label,cwd,*cmd,required_pass=False):
        code=run(label,cwd,*cmd)
        steps.append({'label':label,'cwd':str(cwd),'exitCode':code,'requiredPass':required_pass})
        if required_pass:required.append(code==0)
        return code
    def output(label):
        rows=[json.loads(s) for s in (root/'evidence/commands.jsonl').read_text().splitlines()]
        last=next(q for q in reversed(rows) if q['label']==label)
        return (root/'evidence'/last['log']).read_text()
    log=(root/'evidence'/'registry-server.log').open('w')
    server=subprocess.Popen([sys.executable,'-m','http.server','4380','--bind','127.0.0.1','--directory',str(root/'registry')],stdout=log,stderr=log)
    cli=str(root/'prototype/node_modules/shadcn/dist/index.js')
    try:
        wait(4380)
        def snap(p):return {str(f.relative_to(p)):hashlib.sha256(f.read_bytes()).hexdigest() for f in p.rglob('*') if f.is_file() and 'node_modules' not in f.parts}
        a=run_dir/'a';before=snap(a)
        preview_code=step('registry-dry-run',a,'node',cli,'add','http://127.0.0.1:4380/lego-full-a.json','--yes','--dry-run')
        preview=preview_code==0 and before==snap(a) and 'components.json file' not in output('registry-dry-run')
        step('registry-install-a',a,'node',cli,'add','http://127.0.0.1:4380/lego-full-a.json','--yes',required_pass=True)
        b=run_dir/'b'
        step('registry-install-b-reverse',b,'node',cli,'add','http://127.0.0.1:4380/jobs-valkey.json','http://127.0.0.1:4380/auth-better-auth.json','http://127.0.0.1:4380/api-docs.json','http://127.0.0.1:4380/lego-full-b.json','--yes',required_pass=True)
        for name,p in [('a',a),('b',b)]:
            if (p/'tsconfig.json').exists():
                step('registry-frozen-'+name,p,'pnpm','install','--frozen-lockfile','--strict-peer-dependencies',required_pass=True)
                step('registry-types-'+name,p,'pnpm','exec','tsc','--noEmit','--skipLibCheck',required_pass=True)
                step('registry-build-'+name,p,'pnpm','exec','tsc','--skipLibCheck',required_pass=True)
            else:required.append(False)
        before=snap(a)
        repeat_code=step('registry-repeat',a,'node',cli,'add','http://127.0.0.1:4380/lego-full-a.json','--yes',required_pass=True)
        repeat=repeat_code==0 and before==snap(a)
        c=run_dir/'conflict';before=snap(c)
        conflict_code=step('registry-conflict',c,'node',cli,'add','http://127.0.0.1:4380/jobs-postgres.json','http://127.0.0.1:4380/jobs-valkey.json','--yes')
        exclusivity=conflict_code!=0 and before==snap(c)
        before=snap(b);missing_code=step('registry-missing',b,'node',cli,'add','http://127.0.0.1:4380/missing.json','--yes')
        missing=missing_code!=0 and before==snap(b)
        result={'runDirectory':str(run_dir),'freshConsumers':True,'requiredPassGatesGreen':all(required),'previewPassed':preview,'backendExclusivityPassed':exclusivity,'repeatUnchanged':repeat,'missingItemSafelyRejected':missing,'steps':steps}
        (run_dir/'gates.json').write_text(json.dumps(result,indent=2))
        (root/'evidence/registry-gates-latest.json').write_text(json.dumps(result,indent=2))
        print(json.dumps(result),flush=True)
    finally:server.terminate();server.wait(timeout=5)
    sys.exit(0 if all(required) and preview and exclusivity and repeat and missing else 1)
