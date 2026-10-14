import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const [consumerPath, backend] = process.argv.slice(2);
if (!consumerPath || !['a','b'].includes(backend)) throw new Error('Expected project path and a|b');
const cwd = resolve(consumerPath);
const origin = 'http://127.0.0.1:4310';
const sleep = ms => new Promise(r=>setTimeout(r,ms));

async function startNode(script, token, extra={}) {
  const proc = spawn(process.execPath,[script],{
    cwd, env:{...process.env,...extra}, stdio:['ignore','pipe','pipe']
  });
  let output='';
  try {
    await new Promise((ok,fail)=>{
      const timeout=setTimeout(()=>fail(new Error('Timeout '+script+' '+output.slice(-1000))),12000);
      proc.stdout.on('data',chunk=>{
        output+=chunk.toString();
        if(output.includes(token)){clearTimeout(timeout);ok();}
      });
      proc.stderr.on('data',chunk=>{output+=chunk.toString()});
      proc.on('error',error=>{clearTimeout(timeout);fail(error)});
      proc.on('exit',(code,signal)=>{
        clearTimeout(timeout);fail(new Error(script+' exited before ready '+code+'/'+signal+': '+output.slice(-1000)));
      });
    });
    return proc;
  } catch(e){proc.kill('SIGKILL');throw e}
}
async function close(proc){
  if(!proc||proc.exitCode!==null||proc.signalCode!==null)return;
  const exited=new Promise(r=>proc.once('exit',r));
  proc.kill('SIGTERM');
  await Promise.race([exited,sleep(8000).then(()=>{
    if(proc.exitCode===null)proc.kill('SIGKILL');
    throw new Error('Process did not stop gracefully');
  })]);
}
async function req(path,options={}) {
  return fetch(origin+path,{...options,headers:{origin, ...(options.headers??{})}});
}
async function waitJob(queue,id){
  const until=Date.now()+16000;
  while(Date.now()<until){
    const job=await queue.getJob(id);
    const state=job && await job.getState();
    if(state==='completed')return job;
    if(state==='failed')throw new Error(job.failedReason);
    await sleep(80);
  }
  throw new Error('Queue did not process job '+id);
}

async function verifyStartupDenied(extra, pattern) {
  const child=spawn(process.execPath,['dist/server.js'],{
    cwd,
    env:{...process.env,PORT:'0',DB:'on',AUTH:'on',...extra},
    stdio:['ignore','pipe','pipe']
  });
  let output='';
  child.stderr.on('data',d=>output+=d.toString());
  child.stdout.on('data',d=>output+=d.toString());
  const exited=await Promise.race([
    new Promise(r=>child.once('exit',r)),
    sleep(8000).then(()=>{child.kill('SIGKILL');throw new Error('Invalid auth config did not stop startup');})
  ]);
  assert.notEqual(exited,0,'Invalid config unexpectedly allowed startup');
  assert.match(output,pattern);
}
await verifyStartupDenied({LAB_AUTH_SECRET:'',BETTER_AUTH_SECRET:'',AUTH_URL:origin},/BETTER_AUTH_SECRET/);
await verifyStartupDenied({LAB_AUTH_SECRET:'',BETTER_AUTH_SECRET:'valid-lab-test-secret-only-1234567890',AUTH_URL:''},/AUTH_URL/);
console.log('ASSEMBLED_AUTH_FAIL_FAST_PASS');

let server,worker,queue;
try{
  server=await startNode('dist/server.js','LAB_LISTEN ',{
    PORT:'4310', DB:'on', AUTH:'on', DOCS:'on', JOBS:'on',
    AUTH_URL:origin,
    LAB_AUTH_SECRET:'isolated-lego-fixture-only-auth-secret-not-for-real-projects'
  });
  assert.equal((await req('/health')).status,200);
  assert.equal((await req('/ready')).status,200);
  const docs=await req('/docs/json');
  assert.equal(docs.status,200);
  assert.ok((await docs.json()).paths['/health']);
  const email='lego-assembled-'+backend+'-'+Date.now()+'@example.test';
  const response=await req('/api/auth/sign-up/email',{
    method:'POST',headers:{'content-type':'application/json'},
    body:JSON.stringify({name:'LEGO generated consumer',email,password:'OnlyValidForThisLab123456!'})
  });
  const body=await response.text();
  assert.ok([200,201].includes(response.status),'signup '+response.status+' '+body.slice(0,550));
  const cookie=(response.headers.getSetCookie?.()??[]).map(x=>x.split(';')[0]).join('; ');
  assert.ok(cookie,'missing signup cookie');
  assert.equal((await req('/private',{headers:{cookie}})).status,200);
  assert.equal((await req('/admin',{headers:{cookie}})).status,403);

  worker=await startNode('dist/worker.js','ASSEMBLED_WORKER_READY');
  const module=await import(pathToFileURL(join(cwd,'dist/backend.js')).href);
  queue=new module.Queue('registry-probe',{connection:module.connection});
  await queue.waitUntilReady();
  const job=await queue.add('double',{value:9});
  const result=await waitJob(queue,job.id);
  assert.equal(result.returnvalue,18);
  console.log('ASSEMBLED_FULL_RECIPE_PASS',JSON.stringify({
    variant:backend,docs:true,postgresAuth:true,privateAccess:true,
    adminBlocked:true,worker:'independent process',result:result.returnvalue
  }));
} finally {
  if(queue)await queue.close();
  await close(worker);
  await close(server);
}
