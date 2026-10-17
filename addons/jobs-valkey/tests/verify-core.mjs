import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createJobsPlugin, startDigestWorker, openDigestProducer } from '../dist/index.js';

const compiledCore = process.argv[2];
const valkeyUrl = process.env.VALKEY_URL;
if (!compiledCore || !valkeyUrl) throw new Error('Compiled core path and Valkey URL are required');
const { buildApp } = await import(pathToFileURL(resolve(compiledCore)).href);
const plain = buildApp();
try {
  await plain.ready();
  assert.equal((await plain.inject('/health')).statusCode, 200);
  assert.equal((await plain.inject('/api/jobs')).statusCode, 404);
} finally { await plain.close(); }
const queueName = 'lego-composition-test';
const worker = await startDigestWorker({valkeyUrl,queueName});
const composed = buildApp({
  beforeRoutes(core) {
    core.register(createJobsPlugin({
      valkeyUrl,queueName,
      registerRoutes(scope, producer) {
        // Private fixture only, not present in the distributable add-on.
        scope.post('/test-only/submit', async (req, reply) =>
          reply.code(202).send(await producer.enqueueDigest(req.body)));
      }
    }));
  },
});
let external;
try {
  await composed.ready();
  assert.equal((await composed.inject('/health')).statusCode,200);
  assert.equal((await composed.inject('/api/jobs')).statusCode,404);
  const result = await composed.inject({
    method:'POST', url:'/test-only/submit',payload:{version:1,text:'separate-core'},
  });
  assert.equal(result.statusCode,202,result.body);
  external = await openDigestProducer({valkeyUrl,queueName});
  const deadline = Date.now()+8500;
  let resultState;
  while(Date.now()<deadline){
    resultState=await external.getDigestStatus(result.json().jobId);
    if(resultState?.state==='completed')break;
    await new Promise(resolve=>setTimeout(resolve,150));
  }
  assert.equal(resultState?.state,'completed');
}finally{
  await composed.close();
  await external?.close();
  await worker.close();
}
console.log('LEGO_JOBS_CORE_OPT_IN_PASS');
