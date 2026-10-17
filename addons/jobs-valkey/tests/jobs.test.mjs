import test from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID, createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { Redis } from 'ioredis';
import Fastify from 'fastify';
import { Worker } from 'bullmq';
import {
  createJobsPlugin, openDigestProducer, startDigestWorker,
  digestText, validateDigestInput
} from '../dist/index.js';

const url = process.env.VALKEY_URL;
if (!url) throw new Error('Synthetic VALKEY_URL is required for Valkey CI');
const name = () => 'lego-digest-' + randomUUID().replaceAll('-', '').slice(0, 12);
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const data = text => ({ version: 1, text });

async function waitDone(producer, jobId, timeout = 16000) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    const status = await producer.getDigestStatus(jobId);
    if (status?.state === 'completed') return status;
    if (status?.state === 'failed') throw new Error('Synthetic job failed');
    await sleep(160);
  }
  throw new Error('Job not completed by the deadline');
}

async function spawned(args, env, marker, timeout = 7000) {
  const child = spawn(process.execPath, args, {
    cwd: process.cwd(), env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  const timer = setTimeout(() => child.kill('SIGKILL'), timeout);
  try {
    await new Promise((resolve, reject) => {
      child.stdout.on('data', chunk => {
        output += String(chunk);
        if (output.includes(marker)) resolve();
      });
      child.stderr.on('data', chunk => { output += String(chunk); });
      child.once('exit', code => reject(new Error('Worker exited before ready: ' + code)));
    });
    return child;
  } finally {
    clearTimeout(timer);
    if (child.exitCode !== null) throw new Error('Worker process exited unexpectedly');
  }
}

test('imports are harmless, configuration and payloads fail closed', async () => {
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ ok: true }));
  try {
    await app.ready();
    assert.equal((await app.inject('/health')).statusCode, 200);
    assert.equal((await app.inject('/enqueue')).statusCode, 404);
  } finally { await app.close(); }
  for (const value of [undefined, null, '', {}, { version: 2, text: 'hello' },
    { version: 1, text: 'hello', role: 'admin' },
    { version: 1, text: 'x'.repeat(17000) }]) {
    assert.throws(() => validateDigestInput(value), /Invalid digest job input/);
  }
  for (const bad of ['redis://queue.example:6379', 'http://127.0.0.1:6379',
    'redis://127.0.0.1:6379/42', 'redis://127.0.0.1:6379?x=1']) {
    await assert.rejects(openDigestProducer({ valkeyUrl: bad }), /Valkey URL/);
  }
  await assert.rejects(openDigestProducer({
    valkeyUrl: 'redis://127.0.0.1:1',
  }), error => error.message === 'Valkey producer unavailable');
});

test('Valkey uses noeviction and AOF in ephemeral CI', async () => {
  const redis = new Redis(url, { maxRetriesPerRequest: 1 });
  try {
    const noeviction = await redis.config('GET', 'maxmemory-policy');
    const appendonly = await redis.config('GET', 'appendonly');
    assert.ok(noeviction.includes('noeviction'), JSON.stringify(noeviction));
    assert.ok(appendonly.includes('yes'), JSON.stringify(appendonly));
  } finally { redis.disconnect(); }
});

test('standalone worker executes versioned digest and retains deduplication', async () => {
  const queueName = name();
  const producer = await openDigestProducer({ valkeyUrl: url, queueName });
  const worker = await startDigestWorker({ valkeyUrl: url, queueName });
  try {
    const payload = data('synthetic event - no real personal data');
    const a = await producer.enqueueDigest(payload);
    const b = await producer.enqueueDigest(payload);
    assert.equal(a.jobId, b.jobId);
    const status = await waitDone(producer, a.jobId);
    assert.deepEqual(status.result, digestText(payload));
    assert.equal(status.result.bytes, Buffer.byteLength(payload.text, 'utf8'));
    assert.equal(status.result.sha256, createHash('sha256').update(payload.text).digest('hex'));
    assert.ok(!JSON.stringify(status).includes(payload.text));
  } finally {
    await worker.close();
    await producer.close();
  }
});

test('producer adds no public HTTP routes unless consumer registers one', async () => {
  const queueName = name();
  const app = Fastify({ logger: false });
  const worker = await startDigestWorker({ valkeyUrl: url, queueName });
  app.register(createJobsPlugin({
    valkeyUrl: url, queueName,
    registerRoutes(scope, producer) {
      // Test-only route, never shipped with the LEGO add-on itself.
      scope.post('/test-only/submit', async (req, reply) => {
        const job = await producer.enqueueDigest(req.body);
        return reply.code(202).send(job);
      });
    },
  }));
  try {
    await app.ready();
    assert.equal((await app.inject('/enqueue')).statusCode, 404);
    assert.equal((await app.inject('/api/jobs')).statusCode, 404);
    const response = await app.inject({
      method: 'POST', url: '/test-only/submit', payload: data('fixture'),
    });
    assert.equal(response.statusCode, 202, response.body);
    assert.match(response.json().jobId, /^digest-[a-f0-9]{64}$/);
  } finally {
    await app.close();
    await worker.close();
  }
});

test('retry after one deterministic failure applies bounded exponential backoff', async () => {
  const queueName = name();
  const producer = await openDigestProducer({ valkeyUrl: url, queueName });
  const redis = new Redis(url, { maxRetriesPerRequest: null });
  let processed = 0;
  const worker = new Worker(queueName, async job => {
    processed++;
    if (processed === 1) throw new Error('fixture synthetic failure');
    return digestText(job.data);
  }, { connection: redis, prefix: 'lego', concurrency: 1 });
  worker.on('error', () => {});
  try {
    await worker.waitUntilReady();
    const { jobId } = await producer.enqueueDigest(data('retry fixture ' + randomUUID()));
    const status = await waitDone(producer, jobId);
    assert.equal(processed, 2);
    assert.equal(status.state, 'completed');
  } finally {
    await worker.close();
    redis.disconnect();
    await producer.close();
  }
});

test('a killed process does not lose its active job; a new worker recovers it', { timeout: 30000 }, async () => {
  const queueName = name();
  const producer = await openDigestProducer({ valkeyUrl: url, queueName });
  let dying, replacement;
  try {
    dying = await spawned(['tests/crash-worker.mjs'], {
      VALKEY_URL: url, JOBS_QUEUE_NAME: queueName,
    }, 'LEGO_CRASH_WORKER_READY');
    const payload = data('recovery fixture ' + randomUUID());
    const { jobId } = await producer.enqueueDigest(payload);
    // Child acknowledges processing before being SIGKILLed, so the job was active.
    const started = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Child never processed job')), 5500);
      dying.stdout.on('data', bytes => {
        if (String(bytes).includes('LEGO_CRASH_WORKER_ACTIVE')) {
          clearTimeout(timer); resolve(true);
        }
      });
      dying.once('exit', () => { clearTimeout(timer); reject(new Error('Child exited early')); });
    });
    assert.equal(started, true);
    const end = once(dying, 'exit');
    dying.kill('SIGKILL');
    await end;
    replacement = await startDigestWorker({
      valkeyUrl: url, queueName, stalledIntervalMs: 1000, lockDurationMs: 2000,
    });
    const status = await waitDone(producer, jobId, 20000);
    assert.equal(status.state, 'completed');
    assert.deepEqual(status.result, digestText(payload));
  } finally {
    if (dying?.exitCode === null) dying.kill('SIGKILL');
    await replacement?.close();
    await producer.close();
  }
});

test('compiled worker entry starts and shuts down on SIGTERM', { timeout: 15000 }, async () => {
  const child = await spawned(['dist/worker-entry.js'], {
    VALKEY_URL: url, JOBS_QUEUE_NAME: name(),
  }, 'LEGO_WORKER_READY');
  try {
    const exit = once(child, 'exit');
    child.kill('SIGTERM');
    const [code] = await Promise.race([exit, sleep(7000).then(() => { throw new Error('Worker shutdown timeout'); })]);
    assert.equal(code, 0);
  } finally {
    if (child.exitCode === null) child.kill('SIGKILL');
  }
});
