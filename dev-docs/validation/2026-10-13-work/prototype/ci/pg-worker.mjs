import { Worker, createPostgresBackend, UnrecoverableError } from 'bullmq';

const queueName = process.env.QUEUE_NAME;
const databaseUrl = process.env.DATABASE_URL;
if (!queueName || !databaseUrl) throw new Error('QUEUE_NAME and DATABASE_URL required');
const worker = new Worker(queueName, async job => {
  if (typeof job.data.value !== 'number' || !Number.isFinite(job.data.value)) {
    throw new UnrecoverableError('Invalid value');
  }
  if (job.attemptsMade < (job.data.failUntil ?? 0)) throw new Error('Planned retry');
  if (job.data.delay) await new Promise(resolve => setTimeout(resolve, job.data.delay));
  return job.data.value * 2;
}, {
  connection: { connectionString: databaseUrl, schema: 'bullmq', max: 4 },
  concurrency: Number(process.env.CONCURRENCY ?? 4),
  lockDuration: 1200,
  stalledInterval: 500,
  maxStalledCount: 1
}, createPostgresBackend);

worker.on('error', e => console.error('PG_WORKER_ERROR:', e.message));
await worker.waitUntilReady();
console.log('PG_WORKER_READY');
process.on('SIGTERM', async () => {
  await worker.close();
  console.log('PG_WORKER_CLOSED');
  process.exit(0);
});
