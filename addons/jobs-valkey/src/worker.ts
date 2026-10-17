import { Redis } from 'ioredis';
import { Worker, type Job } from 'bullmq';
import { digestText, DIGEST_JOB_NAME, type DigestResult } from './contract.js';
import { resolveJobsConfig, type JobsValkeyOptions } from './config.js';

export interface DigestWorkerOptions extends JobsValkeyOptions {
  concurrency?: number;
  /** Test-only shortening for validating stalled-job recovery. */
  stalledIntervalMs?: number;
  lockDurationMs?: number;
}
export interface DigestWorkerHandle {
  worker: Worker;
  close: () => Promise<void>;
}
function bounded(name: string, value: number | undefined, fallback: number, min: number, max: number) {
  const num = value ?? fallback;
  if (!Number.isSafeInteger(num) || num < min || num > max) throw new Error('Invalid worker ' + name);
  return num;
}

/** Worker owns its Redis connection and runs independently of HTTP process. */
export async function startDigestWorker(options: DigestWorkerOptions): Promise<DigestWorkerHandle> {
  const config = resolveJobsConfig(options);
  const concurrency = bounded('concurrency', options.concurrency, 2, 1, 8);
  const stalledInterval = bounded('stalledInterval', options.stalledIntervalMs, 30000, 1000, 60000);
  const lockDuration = bounded('lockDuration', options.lockDurationMs, 30000, 2000, 120000);
  const redis = new Redis(config.url, {
    lazyConnect: true,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 1500,
    retryStrategy: (attempts: number) => Math.min(attempts * 500, 2000),
  });
  redis.on('error', () => {});
  let worker: Worker | undefined;
  try {
    await redis.connect();
    worker = new Worker(config.queueName, async (job: Job): Promise<DigestResult> => {
      if (job.name !== DIGEST_JOB_NAME) throw new Error('Unknown job type');
      return digestText(job.data);
    }, {
      connection: redis, prefix: 'lego', concurrency, stalledInterval, lockDuration,
      maxStalledCount: 1,
    });
    // Failure messages may contain job data: never log error.message/stack.
    worker.on('error', () => { process.stderr.write('LEGO_WORKER_CONNECTION_ERROR\n'); });
    await worker.waitUntilReady();
  } catch {
    await worker?.close().catch(() => {});
    redis.disconnect();
    throw new Error('Valkey worker unavailable');
  }
  const owned = worker;
  let closed = false;
  return {
    worker: owned,
    async close() {
      if (closed) return;
      closed = true;
      try { await owned.close(); }
      finally { redis.disconnect(); }
    },
  };
}
