import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { Pool } from 'pg';
import { buildApp } from '../dist/app.js';

const conf = {
  databaseUrl: process.env.FULLB_DB_URL, authUrl: process.env.FULLB_AUTH_URL,
  secret: process.env.FULLB_AUTH_SECRET, valkeyUrl: process.env.VALKEY_URL,
  baseURL: 'http://127.0.0.1:4310', queueName: 'lego-fullb-v1',
};
assert.ok(Object.values(conf).every(Boolean));
async function call(base, path, { method = 'GET', cookie, body, origin } = {}) {
  const response = await fetch(base + path, { method,
    headers: { ...(cookie ? {cookie} : {}), ...(body ? {'content-type':'application/json'} : {}), ...(origin ? {origin} : {}) },
    ...(body ? {body:JSON.stringify(body)} : {})
  });
  const raw = await response.text();
  let json;
  try { json = JSON.parse(raw); } catch { json = null; }
  return { status:response.status, json, cookies:response.headers.getSetCookie().map(x=>x.split(';')[0]).join('; '), hint:raw.slice(0,180) };
}
async function register(base,email,extra={}) {
  const r = await call(base,'/api/auth/sign-up/email',{method:'POST',origin:conf.baseURL,body:{
    name:email.split('@')[0],email,password:'Synthetic-lab-passphrase-2026!',...extra
  }});
  assert.ok([200,201].includes(r.status), 'signup '+r.status+': '+r.hint);
  assert.match(r.cookies,/session_token=/);
  return r.cookies;
}
async function startWorker() {
  const child = spawn(process.execPath,['worker.mjs'],{cwd:process.cwd(),env:{...process.env,JOBS_QUEUE_NAME:conf.queueName},stdio:['ignore','pipe','pipe']});
  return new Promise((resolve,reject)=>{
    let buffer='';
    const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('worker readiness timeout'));},10000);
    child.stdout.on('data',d=>{buffer+=String(d);if(buffer.includes('LEGO_WORKER_READY')){clearTimeout(timer);resolve(child);}});
    child.once('exit',n=>{clearTimeout(timer);reject(new Error('worker exited early '+n));});
    child.once('error',e=>{clearTimeout(timer);reject(e);});
  });
}
async function stopWorker(child) {
  if(!child || child.exitCode !== null || child.signalCode !== null) return;
  const exit = new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('worker shutdown timeout'));},10000);
    child.once('exit',code=>{clearTimeout(timer);code===0?resolve():reject(new Error('worker exited '+code));});
  });
  child.kill('SIGTERM'); await exit;
}
async function result(base,id,job,cookie) {
  const deadline=Date.now()+12000;
  while(Date.now()<deadline){
    const r=await call(base,'/fullb/notes/'+id+'/jobs/'+job,{cookie});
    assert.equal(r.status,200,r.hint);
    if(r.json?.state==='completed' && r.json?.result) return r.json.result;
    assert.notEqual(r.json?.state,'failed');
    await new Promise(ok=>setTimeout(ok,150));
  }
  throw new Error('job result timeout');
}
async function recipe(){return import('../dist/full-b.js');}

test('Core boots without auth, DB, jobs and docs',async()=>{
  const app=buildApp();
  try{
    await app.ready();
    assert.equal((await app.inject('/health')).statusCode,200);
    for(const path of ['/api/auth/get-session','/fullb/notes','/docs/json']){
      assert.equal((await app.inject(path)).statusCode,404);
    }
  }finally{await app.close();}
});

test('Full B: real HTTP, ownership, shared hash, worker restart and pool isolation',async()=>{
  const {buildFullB}=await recipe();
  const noDocs=buildFullB({...conf,docsEnabled:false});
  try{
    await noDocs.ready();
    assert.equal((await noDocs.inject('/docs/json')).statusCode,404);
    assert.equal((await noDocs.inject('/docs/')).statusCode,404);
  }finally{await noDocs.close();}

  const app=buildFullB({...conf,docsEnabled:true});
  let child;
  try{
    await app.listen({host:'127.0.0.1',port:0});
    const address=app.server.address();
    assert.ok(address&&typeof address==='object');
    const base='http://127.0.0.1:'+address.port;
    assert.equal((await call(base,'/health')).status,200);
    const docs=await call(base,'/docs/json');
    assert.equal(docs.status,200,docs.hint);
    assert.ok(docs.json?.paths?.['/health']);
    assert.ok(docs.json?.paths?.['/fullb/notes'],'Swagger must include owned notes route');

    assert.equal((await call(base,'/fullb/notes')).status,401);
    const cookieA=await register(base,'fullb-a@example.test',{role:'admin'});
    const cookieB=await register(base,'fullb-b@example.test');
    const shared='synthetic shared text only';
    const a=await call(base,'/fullb/notes',{method:'POST',cookie:cookieA,body:{text:shared}});
    const b=await call(base,'/fullb/notes',{method:'POST',cookie:cookieB,body:{text:shared}});
    assert.equal(a.status,201,a.hint);assert.equal(b.status,201,b.hint);
    assert.notEqual(a.json?.id,b.json?.id);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id,{cookie:cookieB})).status,403);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id,{cookie:cookieA})).status,200);
    assert.equal((await call(base,'/fullb/notes',{method:'POST',cookie:cookieA,body:{text:''}})).status,400);
    child=await startWorker();
    const ja=await call(base,'/fullb/notes/'+a.json.id+'/digest',{method:'POST',cookie:cookieA});
    const jb=await call(base,'/fullb/notes/'+b.json.id+'/digest',{method:'POST',cookie:cookieB});
    assert.equal(ja.status,202,ja.hint); assert.equal(jb.status,202,jb.hint);
    assert.equal(ja.json?.jobId,jb.json?.jobId);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id+'/jobs/'+ja.json.jobId,{cookie:cookieB})).status,403);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id+'/jobs/digest-'+ 'a'.repeat(64),{cookie:cookieA})).status,404);
    const ra=await result(base,a.json.id,ja.json.jobId,cookieA);
    const rb=await result(base,b.json.id,jb.json.jobId,cookieB);
    assert.deepEqual(ra,rb);
    assert.equal(ra.sha256,createHash('sha256').update(shared).digest('hex'));
    assert.equal(ra.bytes,Buffer.byteLength(shared,'utf8'));
    await stopWorker(child);child=null;
    const pending=await call(base,'/fullb/notes',{method:'POST',cookie:cookieA,body:{text:'synthetic after worker stopped'}});
    assert.equal(pending.status,201);
    const queued=await call(base,'/fullb/notes/'+pending.json.id+'/digest',{method:'POST',cookie:cookieA});
    assert.equal(queued.status,202);
    child=await startWorker();
    assert.equal((await result(base,pending.json.id,queued.json.jobId,cookieA)).sha256,createHash('sha256').update('synthetic after worker stopped').digest('hex'));

    const admin=new Pool({connectionString:process.env.PG_ADMIN_URL});
    const appRole=new Pool({connectionString:process.env.FULLB_DB_URL});
    const authRole=new Pool({connectionString:process.env.FULLB_AUTH_URL});
    try{
      const roles=await admin.query("SELECT role FROM auth.\"user\" WHERE email IN ('fullb-a@example.test','fullb-b@example.test') ORDER BY email");
      assert.deepEqual(roles.rows.map(x=>x.role),['user','user']);
      assert.equal((await admin.query('SELECT COUNT(*)::integer AS n FROM lego_app.fullb_jobs')).rows[0].n,3);
      await assert.rejects(appRole.query('SELECT * FROM auth."user"'),{code:'42501'});
      await assert.rejects(authRole.query('SELECT * FROM lego_app.fullb_notes'),{code:'42501'});
      await assert.rejects(appRole.query('CREATE TABLE lego_app.exploit (n integer)'),{code:'42501'});
    }finally{await admin.end();await appRole.end();await authRole.end();}
    const hostile=await call(base,'/api/auth/sign-out',{method:'POST',cookie:cookieA,origin:'https://evil.example',body:{}});
    assert.equal(hostile.status,403);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id,{cookie:cookieA})).status,200);
    const logout=await call(base,'/api/auth/sign-out',{method:'POST',cookie:cookieA,origin:conf.baseURL,body:{}});
    assert.equal(logout.status,200);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id,{cookie:cookieA})).status,401);
    assert.equal((await call(base,'/fullb/notes/'+b.json.id,{cookie:cookieB})).status,200);
    const login=await call(base,'/api/auth/sign-in/email',{method:'POST',origin:conf.baseURL,body:{
      email:'fullb-a@example.test',password:'Synthetic-lab-passphrase-2026!'
    }});
    assert.equal(login.status,200,login.hint);
    assert.match(login.cookies,/session_token=/);
    assert.equal((await call(base,'/fullb/notes/'+a.json.id,{cookie:login.cookies})).status,200);
  }finally{
    await stopWorker(child);
    await app.close().catch(()=>{});
  }
  const admin=new Pool({connectionString:process.env.PG_ADMIN_URL});
  try{
    const active=await admin.query("SELECT COUNT(*)::integer AS n FROM pg_stat_activity WHERE application_name IN ('kit_lego_auth','kit_lego_postgres')");
    assert.equal(active.rows[0].n,0);
  }finally{await admin.end();}
});

test('Full B fails closed if enabled Valkey does not respond',async()=>{
  const {buildFullB}=await recipe();
  const app=buildFullB({...conf,docsEnabled:false,valkeyUrl:'redis://127.0.0.1:6397'});
  try{await assert.rejects(app.ready(),/Valkey|Jobs|unavailable|plugin/i);}
  finally{await app.close().catch(()=>{});}
});

test('compiled Full B API runs as a separate entrypoint and shuts down cleanly', async () => {
  const child = spawn(process.execPath,['dist/full-b-server.js'],{
    cwd:process.cwd(),env:{...process.env,HOST:'127.0.0.1',PORT:'0',FULLB_DOCS_ENABLED:'0'},
    stdio:['ignore','pipe','pipe']
  });
  let base;
  try {
    base = await new Promise((resolve,reject)=>{
      let buffer='';
      const timer=setTimeout(()=>{child.kill('SIGKILL');reject(new Error('API start timeout'));},10000);
      child.stdout.on('data',d=>{
        buffer+=String(d);
        const match=buffer.match(/KIT_LISTEN (http:\/\/127\.0\.0\.1:[0-9]+)/);
        if(match){clearTimeout(timer);resolve(match[1]);}
      });
      child.once('exit',code=>{clearTimeout(timer);reject(new Error('API exited before listening: '+code));});
      child.once('error',err=>{clearTimeout(timer);reject(err);});
    });
    assert.equal((await call(base,'/health')).status,200);
    assert.equal((await call(base,'/docs/json')).status,404);
    assert.equal((await call(base,'/fullb/notes')).status,401);
  } finally {
    await stopWorker(child);
  }
});
