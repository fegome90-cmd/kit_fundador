import { Worker } from 'bullmq';
import { Redis } from 'ioredis';
const url = process.env.VALKEY_URL;
const queueName = process.env.JOBS_QUEUE_NAME;
if (!url || !queueName) throw new Error('Synthetic worker settings missing');
const redis = new Redis(url, { maxRetriesPerRequest: null });
redis.on('error', () => {});
const worker = new Worker(queueName, async () => {
  process.stdout.write('LEGO_CRASH_WORKER_ACTIVE\n');
  await new Promise(() => {});
}, { connection: redis, prefix: 'lego', concurrency: 1, lockDuration: 2000, stalledInterval: 1000 });
worker.on('error', () => {});
await worker.waitUntilReady();
process.stdout.write('LEGO_CRASH_WORKER_READY\n');
