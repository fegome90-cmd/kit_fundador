import subprocess,pathlib,os,sys,socket,time,json,hashlib
root=pathlib.Path(__file__).resolve().parent
env=os.environ.copy()
for k in ['ALL_PROXY','all_proxy']:env.pop(k,None)
env['NO_PROXY']='127.0.0.1,localhost';env['no_proxy']=env['NO_PROXY']
cli=str(root/'prototype/node_modules/shadcn/dist/index.js')
def run(label,cwd,*cmd):return subprocess.run([sys.executable,str(root/'run.py'),label,str(cwd),*cmd],env=env).returncode
server=subprocess.Popen([sys.executable,'-m','http.server','4380','--bind','127.0.0.1','--directory',str(root/'registry')],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
try:
 time.sleep(.3)
 b=root/'consumer-fixed-b';f=b/'src/docs.ts';original=f.read_text();f.write_text(original+'\n// consumer-owned sentinel\n')
 run('registry-consumer-diff',b,'node',cli,'add','http://127.0.0.1:4380/api-docs.json','--yes','--diff','src/docs.ts')
 run('registry-consumer-preserve',b,'node',cli,'add','http://127.0.0.1:4380/api-docs.json','--yes')
 preserved='consumer-owned sentinel' in f.read_text();assert preserved
 invalid={'$schema':'https://ui.shadcn.com/schema/registry-item.json','name':'invalid-dependency','type':'registry:item','dependencies':['fastify@0.0.999999'],'files':[{'path':'src/invalid.ts','type':'registry:file','target':'~/src/invalid.ts','content':'export const invalid=true;'}]}
 (root/'registry/invalid-dependency.json').write_text(json.dumps(invalid))
 before=(b/'package.json').read_bytes();code=run('registry-invalid-dependency',b,'node',cli,'add','http://127.0.0.1:4380/invalid-dependency.json','--yes')
 result={'consumerModificationPreserved':preserved,'invalidDependencyExit':code,'invalidFileWritten':(b/'src/invalid.ts').exists(),'packagePreservedAfterInvalidDependency':before==(b/'package.json').read_bytes(),'componentsJsonExists':(b/'components.json').exists()}
 print(json.dumps(result));(root/'evidence/registry-extra-result.json').write_text(json.dumps(result,indent=2))
finally:server.terminate();server.wait()
