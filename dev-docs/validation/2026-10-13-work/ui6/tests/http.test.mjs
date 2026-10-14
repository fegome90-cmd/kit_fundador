import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import SwaggerParser from '@apidevtools/swagger-parser';
const start = async (env={}) => {
  const child=spawn(process.execPath,['dist/server.js'],{env:{...process.env,PORT:'0',...env},stdio:['ignore','pipe','pipe']});
  let output=''; child.stderr.on('data',d=>output+=d);
  const url=await new Promise((resolve,reject)=>{
    child.stdout.on('data',d=>{output+=d; const m=output.match(/LAB_LISTEN (http:\/\/[^\s]+)/); if(m)resolve(m[1]);});
    child.on('exit',c=>reject(new Error(`server exit ${c}: ${output}`)));
    setTimeout(()=>reject(new Error(`server timeout: ${output}`)),5000).unref();
  });
  return {url, child, stop:()=>new Promise(r=>{child.once('exit',r);child.kill('SIGTERM');})};
};
test('compiled core HTTP, errors and docs opt-out',async()=>{
  const s=await start(); try {
    assert.equal((await fetch(s.url+'/health')).status,200);
    assert.equal((await fetch(s.url+'/ready')).status,200);
    for(const path of ['/docs','/docs/json','/api/auth/get-session','/missing'])assert.equal((await fetch(s.url+path)).status,404);
    assert.equal((await fetch(s.url+'/echo',{method:'POST',headers:{'content-type':'application/json'},body:'{'})).status,400);
    assert.equal((await fetch(s.url+'/echo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({text:'x'.repeat(4096)})})).status,413);
    const error=await fetch(s.url+'/boom'); assert.equal(error.status,500); assert.ok(!(await error.text()).includes('LAB_INTERNAL_SECRET'));
  } finally {await s.stop();}
});
test('OpenAPI contains own paths, UI opt-in and Better Auth operations separate',async()=>{
  const s=await start({DOCS:'on',AUTH:'schema'});try {
    assert.equal((await fetch(s.url+'/docs/')).status,200);
    const spec=await(await fetch(s.url+'/docs/json')).json();await SwaggerParser.validate(spec);
    for(const path of ['/health','/ready','/echo'])assert.ok(spec.paths[path]);
    assert.ok(!spec.paths['/api/auth/sign-up/email']);
    const authSpec=await(await fetch(s.url+'/api/auth/open-api/generate-schema')).json();
    assert.ok(authSpec.paths['/sign-up/email']);assert.ok(authSpec.paths['/sign-in/email']);
    console.log(JSON.stringify({ownPaths:Object.keys(spec.paths),authPaths:Object.keys(authSpec.paths).length}));
    const origin=await fetch(s.url+'/api/auth/sign-up/email',{method:'POST',headers:{'content-type':'application/json',origin:'https://evil.invalid'},body:JSON.stringify({email:'lab@example.com',password:'sample-password',name:'lab'})});
    assert.equal(origin.status,403);
    const allowed=await fetch(s.url+'/health',{headers:{origin:'http://localhost:3000'}});assert.equal(allowed.headers.get('access-control-allow-origin'),'http://localhost:3000');
    const denied=await fetch(s.url+'/health',{headers:{origin:'https://evil.invalid'}});assert.equal(denied.headers.get('access-control-allow-origin'),null);
    assert.equal((await fetch(s.url+'/private')).status,401);
  } finally {await s.stop();}
});
test('enabled DB without DATABASE_URL stops before listen',async()=>{
  const child=spawn(process.execPath,['dist/server.js'],{env:{...process.env,DB:'on',DATABASE_URL:''},stdio:['ignore','pipe','pipe']});let output='';child.stderr.on('data',d=>output+=d);
  const code=await new Promise(r=>child.on('exit',r));assert.notEqual(code,0);assert.match(output,/DATABASE_URL is required/);
});
