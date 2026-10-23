import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { createServer } from 'node:http';
import { S3Client, HeadBucketCommand, CreateBucketCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createStorageS3Plugin, openStorageS3 } from '../dist/index.js';

// Ephemeral CI credentials only; all objects are synthetic.
for (const name of ['R3_S3_ENDPOINT','R3_S3_ACCESS_KEY','R3_S3_SECRET_KEY','R3_S3_BUCKET']) {
  assert.ok(process.env[name], 'Missing R3 synthetic variable: ' + name);
}
const bucket=process.env.R3_S3_BUCKET;
const endpoint=process.env.R3_S3_ENDPOINT;
const credentials={accessKeyId:process.env.R3_S3_ACCESS_KEY,secretAccessKey:process.env.R3_S3_SECRET_KEY};
const options=Object.freeze({...credentials,endpoint,region:'us-east-1',bucket,
  keyPrefix:'lab/',maxObjectBytes:256,operationTimeoutMs:2500});
const admin=new S3Client({endpoint,region:'us-east-1',forcePathStyle:true,credentials,maxAttempts:1});
before(async()=>{
  try { await admin.send(new HeadBucketCommand({Bucket:bucket})); }
  catch { await admin.send(new CreateBucketCommand({Bucket:bucket})); }
});
after(()=>admin.destroy());

test('Fastify Core has no S3 dependency, route or connection by default',async()=>{
  const app=Fastify({logger:false});
  app.get('/health',async()=>({ok:true}));
  try {
    await app.ready();
    assert.equal((await app.inject('/health')).statusCode,200);
    assert.equal((await app.inject('/private/a/key')).statusCode,404);
  } finally { await app.close(); }
});

test('S3 rejects unsafe options and keys, and enforces MIME and size limits',async()=>{
  const invalidOptions=[
    {...options,endpoint:'http://storage.example.com:9000'},
    {...options,endpoint:'https://test:pass@storage.example.com'},
    {...options,endpoint:'http://127.0.0.1:9000/unexpected'},
    {...options,keyPrefix:''},{...options,keyPrefix:'../escape/'},
    {...options,secretAccessKey:''},{...options,bucket:'Bad_Bucket'},
    {...options,maxObjectBytes:1048577},{...options,operationTimeoutMs:5},
  ];
  for(const opts of invalidOptions) await assert.rejects(()=>openStorageS3(opts),/Storage S3 (invalid|configuration)/);
  const store=await openStorageS3(options);
  try {
    for(const key of ['/absolute','../other','a/../b','a//b','a%2fb','a\\b','a.b','','a/']){
      await assert.rejects(()=>store.getObject(key),/Storage S3 invalid key/,key);
    }
    await assert.rejects(()=>store.putObject('file',Buffer.alloc(0),'text/plain'),/Storage S3 invalid size/);
    await assert.rejects(()=>store.putObject('file',Buffer.alloc(257),'text/plain'),/Storage S3 invalid size/);
    await assert.rejects(()=>store.putObject('file',Buffer.from('x'),'text/html'),/Storage S3 invalid content type/);
  } finally { store.close(); }
});

test('real S3 byte-perfect round trip and idempotent delete',async()=>{
  const store=await openStorageS3(options);
  try{
    assert.equal(await store.getObject('binary/never-existed'),null);
    const bytes=Buffer.from([0,1,2,3,240,255]);
    assert.deepEqual(await store.putObject('binary/round-trip',bytes,'application/octet-stream'),
      {key:'binary/round-trip',bytes:6});
    const got=await store.getObject('binary/round-trip');
    assert.deepEqual(got?.bytes,bytes);
    assert.equal(got?.contentType,'application/octet-stream');
    await store.deleteObject('binary/round-trip');
    assert.equal(await store.getObject('binary/round-trip'),null);
    await store.deleteObject('binary/round-trip');
    const boundary=Buffer.alloc(256,122);
    await store.putObject('binary/boundary',boundary,'application/octet-stream');
    assert.deepEqual((await store.getObject('binary/boundary'))?.bytes,boundary);
    await store.deleteObject('binary/boundary');
  }finally{store.close();}
});

test('large object stored outside the plugin cannot exhaust its read limit',async()=>{
  const store=await openStorageS3(options);
  await admin.send(new PutObjectCommand({Bucket:bucket,Key:'lab/binary/oversize',
    Body:Buffer.alloc(400,35),ContentType:'application/octet-stream'}));
  try {await assert.rejects(()=>store.getObject('binary/oversize'),/Storage S3 (size exceeded|operation failed)/);}
  finally {await store.deleteObject('binary/oversize');store.close();}
});

test('pre-aborted upload leaves no object; closed client rejects future operations',async()=>{
  const store=await openStorageS3(options);
  const controller=new AbortController();
  controller.abort();
  try{
    await assert.rejects(()=>store.putObject('cancelled/text',Buffer.from('synthetic'),'text/plain',controller.signal),/Storage S3 aborted/);
    assert.equal(await store.getObject('cancelled/text'),null);
  }finally{store.close();}
  await assert.rejects(()=>store.getObject('cancelled/text'),/Storage S3 closed/);
});

test('wrong credentials, missing bucket and disconnected endpoint fail without sensitive output',async()=>{
  for(const opt of [
    {...options,accessKeyId:'fake-access',secretAccessKey:'PRIVATE-S3-SECRET-NEVER-LOG'},
    {...options,bucket:'lego-r3-not-created'},
    {...options,endpoint:'http://127.0.0.1:19007',operationTimeoutMs:250},
  ]){
    const start=Date.now();
    await assert.rejects(()=>openStorageS3({...opt,verifyBucketOnOpen:true}),error=>{
      assert.match(error.message,/Storage S3 (initialization|operation) failed/);
      assert.ok(!error.message.includes('PRIVATE-S3-SECRET-NEVER-LOG'));
      assert.ok(!error.message.includes('127.0.0.1:19007'));
      return true;
    });
    assert.ok(Date.now()-start<10000,'S3 startup must fail promptly');
  }
});

// Synthetic bearer tokens only inside the test; NOT production authentication.
test('consumer enforces ownership before using S3, including equal keys for two users',async()=>{
  const app=Fastify({logger:false});
  let captured;
  app.register(createStorageS3Plugin({...options,keyPrefix:'owners/',registerRoutes(scope,storage){
    captured=storage;
    const getUser=req=>req.headers.authorization==='Bearer ci-a'?'a':
      req.headers.authorization==='Bearer ci-b'?'b':null;
    function check(req,reply){
      const user=getUser(req);
      if(!user){reply.code(401).send({error:'Unauthorized'});return null;}
      if(req.params.owner!==user){reply.code(403).send({error:'Forbidden'});return null;}
      return user;
    }
    scope.post('/private/:owner/:key',async(req,reply)=>{
      const user=check(req,reply);
      if(!user)return reply;
      if(typeof req.body?.text!=='string')return reply.code(400).send({error:'Bad input'});
      await storage.putObject(user+'/'+req.params.key,Buffer.from(req.body.text),'text/plain');
      return reply.code(201).send({ok:true});
    });
    scope.get('/private/:owner/:key',async(req,reply)=>{
      const user=check(req,reply);
      if(!user)return reply;
      const item=await storage.getObject(user+'/'+req.params.key);
      return item?{text:item.bytes.toString('utf8')}:reply.code(404).send({error:'Not found'});
    });
    scope.delete('/private/:owner/:key',async(req,reply)=>{
      const user=check(req,reply);
      if(!user)return reply;
      await storage.deleteObject(user+'/'+req.params.key);
      return reply.code(204).send();
    });
  }}));
  const call=(method,owner,key,token,payload)=>app.inject({
    method,url:'/private/'+owner+'/'+key,
    headers:token?{authorization:'Bearer '+token}:{},
    ...(payload?{payload}:{})
  });
  try{
    await app.ready();
    assert.equal((await call('GET','a','shared')).statusCode,401);
    assert.equal((await call('GET','a','shared','ci-b')).statusCode,403);
    for(const [user,token,value] of [['a','ci-a','alpha-synthetic'],['b','ci-b','beta-synthetic']]){
      const put=await call('POST',user,'shared',token,{text:value});
      assert.equal(put.statusCode,201,put.body);
      assert.equal((await call('GET',user,'shared',token)).json().text,value);
    }
    assert.equal((await call('DELETE','a','shared','ci-b')).statusCode,403);
    assert.equal((await call('GET','b','shared','ci-a')).statusCode,403);
    assert.equal((await call('DELETE','a','shared','ci-a')).statusCode,204);
    assert.equal((await call('GET','a','shared','ci-a')).statusCode,404);
    assert.equal((await call('GET','b','shared','ci-b')).statusCode,200);
    await call('DELETE','b','shared','ci-b');
  }finally{await app.close();}
  await assert.rejects(()=>captured.getObject('a/shared'),/Storage S3 closed/);
});

test('in-flight upload aborts and unknown-length response cannot bypass the streaming cap',async()=>{
  const server=createServer((req,res)=>{
    if(req.method==='HEAD'){
      res.writeHead(200);
      res.end();
      return;
    }
    if(req.method==='GET'){
      res.writeHead(200,{'content-type':'application/octet-stream'});
      res.end(Buffer.alloc(400,0x35)); // Intentionally no Content-Length header
      return;
    }
    // S3 upload accepted at TCP level, but response is deliberately delayed
    // beyond the caller's deadline to exercise a REAL in-flight abort.
    req.resume();
  });
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const address=server.address();
  assert.ok(address&&typeof address==='object');
  let store;
  try{
    store=await openStorageS3({
      ...options,
      endpoint:'http://127.0.0.1:'+address.port,
      operationTimeoutMs:250,
    });
    const start=Date.now();
    await assert.rejects(
      ()=>store.putObject('stream/interrupted',Buffer.from('synthetic'),'text/plain'),
      /Storage S3 aborted/
    );
    assert.ok(Date.now()-start<2500,'In-flight PUT did not observe abort deadline');
    await assert.rejects(
      ()=>store.getObject('stream/unknown-length'),
      /Storage S3 size exceeded/
    );
  }finally{
    store?.close();
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
  }
});

test('an aborted PUT can still be committed by the remote server before its reply',async()=>{
  const expected=Buffer.from('synthetic-committed-before-timeout');
  let persisted=null;
  let resolveReceived;
  const received=new Promise(resolve=>{resolveReceived=resolve;});
  const server=createServer((req,res)=>{
    if(req.method!=='PUT'){
      res.writeHead(200);
      res.end();
      return;
    }
    const parts=[];
    req.on('data',chunk=>parts.push(Buffer.from(chunk)));
    req.on('end',()=>{
      persisted=Buffer.concat(parts);
      resolveReceived();
      // The S3-compatible server has already accepted and stored the bytes,
      // but deliberately never acknowledges the request.
      // This models an ambiguous client-side timeout, not S3 rollback.
    });
  });
  await new Promise((resolve,reject)=>{
    server.once('error',reject);
    server.listen(0,'127.0.0.1',resolve);
  });
  const address=server.address();
  assert.ok(address&&typeof address==='object');
  let storage;
  try{
    storage=await openStorageS3({
      ...options,
      endpoint:'http://127.0.0.1:'+address.port,
      keyPrefix:'ambiguous/',
      operationTimeoutMs:350,
    });
    await Promise.all([
      new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Mock S3 did not receive PUT bytes')),2000);
        received.then(()=>{clearTimeout(timer);resolve();});
      }),
      assert.rejects(
        ()=>storage.putObject('example/record',expected,'text/plain'),
        /Storage S3 aborted/,
      ),
    ]);
    assert.deepEqual(persisted,expected,
      'Remote acceptance can precede the client timeout; no automatic rollback');
  }finally{
    storage?.close();
    server.closeAllConnections();
    await new Promise(resolve=>server.close(resolve));
  }
});
