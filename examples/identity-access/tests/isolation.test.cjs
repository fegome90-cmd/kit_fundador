'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const {once} = require('node:events');
const {spawn} = require('node:child_process');
const {readFileSync} = require('node:fs');
const {join} = require('node:path');
process.env.NODE_ENV = 'test';
process.env.PASSWORD_SALT_ROUNDS = '4';

const {HttpServer} = require('../dist/infrastructure/http/server.js');
const {Password} = require('../dist/domain/value-objects/Password.js');
const {buildRegisterUserAccountCommand} = require('../dist/application/use-cases/register-user-account/RegisterUserAccountCommand.js');
const {RegisterUserAccountHandler} = require('../dist/application/use-cases/register-user-account/RegisterUserAccountHandler.js');
const {InMemoryUserAccountRepository} = require('../dist/infrastructure/_stubs/InMemoryUserAccountRepository.js');

async function withServer(fn) {
  const listener = http.createServer(new HttpServer({port:0, environment:'test'}).getApp());
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  try { return await fn('http://127.0.0.1:' + listener.address().port); }
  finally { await new Promise((resolve,reject) => listener.close(err => err ? reject(err) : resolve())); }
}
function register(base,body) {
  return fetch(base+'/api/users/register',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
}
const user={email:'local@example.com',name:'Local User',password:'CorrectPassword123!'};

test('demo registration is explicitly opt-in, health works, docs remain offline', async()=>{
 await withServer(async base=>{
   assert.equal((await fetch(base+'/health')).status,200);
   const response=await register(base,user);
   assert.equal(response.status,201);
   const body=await response.json();
   assert.equal(body.data.role,'user');
   assert.equal(body.data.email,user.email);
   assert.ok(!JSON.stringify(body).includes(user.password));
   assert.equal((await fetch(base+'/api-docs')).status,404);
 });
});
test('no public registration can choose privileged properties',async()=>{
 await withServer(async base=>{
  for(const forbidden of [{role:'admin'},{role:'user'},{isAdmin:true},{permissions:['*']},{emailVerified:true}]){
   assert.equal((await register(base,{...user,...forbidden})).status,400,JSON.stringify(forbidden));
  }
 });
});
test('duplicate registration returns 409 in the same in-memory instance',async()=>{
 await withServer(async base=>{
  assert.equal((await register(base,user)).status,201);
  const second=await register(base,user);
  assert.equal(second.status,409);
  assert.ok((await second.text()).includes('already exists'));
 });
});
test('invalid email, short password and unsafe bcrypt byte length return 400',async()=>{
 await withServer(async base=>{
  for(const candidate of [{...user,email:'invalid'},{...user,password:'Eight123'},{...user,password:'é'.repeat(40)}]){
    assert.equal((await register(base,candidate)).status,400);
  }
 });
});
test('malformed request JSON yields sanitized HTTP 400 JSON, not HTML', async()=>{
 await withServer(async base=>{
  const response=await fetch(base+'/api/users/register',{
    method:'POST',headers:{'content-type':'application/json'},body:'{"email":'
  });
  assert.equal(response.status,400);
  assert.ok(response.headers.get('content-type')?.startsWith('application/json'));
  const payload=await response.json();
  assert.equal(payload.success,false);
  assert.equal(payload.message,'Validation failed');
  assert.ok(payload.errors.includes('Malformed JSON'));
  assert.equal(JSON.stringify(payload).includes('SyntaxError'),false);
  assert.equal(JSON.stringify(payload).includes('Unexpected end of JSON'),false);
 });
});
test('application command refuses to promote even when forged at runtime',async()=>{
 const repo=new InMemoryUserAccountRepository();
 const handler=new RegisterUserAccountHandler({userAccountRepository:repo});
 const command=buildRegisterUserAccountCommand({...user,role:'admin'});
 const result=await handler.execute(command);
 assert.equal(result.userSnapshot.role,'user');
 assert.equal(repo.list()[0].role,'user');
});
test('bcrypt rejects truncated secrets on create and compare',async()=>{
 await assert.rejects(Password.create('é'.repeat(40)),/72 UTF-8 bytes/);
 const prefix='x'.repeat(72);
 const hash=await Password.create(prefix);
 assert.equal(await hash.matches(prefix+'more'),false);
 assert.equal(await hash.matches(prefix),true);
});
test('the OpenAPI document stays offline and forbids administrative input',()=>{
 const spec=readFileSync(join(process.cwd(),'src/infrastructure/docs/api/openapi.yaml'),'utf8');
 assert.ok(spec.includes('additionalProperties: false'));
 assert.ok(spec.includes('security: []'));
 assert.ok(!spec.includes('adminRegistration'));
});
test('compiled JS boots on loopback and stops cleanly on SIGTERM',{timeout:15000},async()=>{
 const child=spawn(process.execPath,['dist/index.js'],{
  cwd:process.cwd(),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']
 });
 let output='';
 try{
  const port=await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(new Error('Server timeout: '+output)),7000);
   child.stdout.on('data',chunk=>{
     output+=String(chunk);
     const match=output.match(/Server running on port (\d+)/);
     if(match){clearTimeout(timeout);resolve(Number(match[1]));}
   });
   child.stderr.on('data',chunk=>{output+=String(chunk)});
   child.once('exit',code=>{clearTimeout(timeout);reject(new Error('Early exit '+code+': '+output))});
  });
  assert.ok(port>0);
  assert.equal((await fetch('http://127.0.0.1:'+port+'/health')).status,200);
 }finally{
  if(child.exitCode===null){
    const ended=once(child,'exit');
    child.kill('SIGTERM');
    const [exitCode]=await Promise.race([
      ended,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Shutdown timeout')),5000))
    ]);
    assert.equal(exitCode,0);
  }
 }
});
