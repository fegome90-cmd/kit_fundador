import Redis from 'ioredis';
import { Queue } from 'bullmq';
import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { digestJobId, DIGEST_JOB_NAME, validateDigestInput, type DigestInput, type DigestResult } from './contract.js';
import { resolveJobsConfig, type JobsValkeyOptions } from './config.js';

export interface DigestProducer {
  enqueueDigest: (input: unknown) => Promise<{ jobId: string }>;
  getDigestStatus: (jobId: string) => Promise<{ state: string; result?: DigestResult } | null>;
  close: () => Promise<void>;
}

export interface ProducerPluginOptions extends JobsValkeyOptions {
  /** The consuming app owns its routes and their identity/resource permissions. */
  registerRoutes?: (app: FastifyInstance, producer: DigestProducer) => Promise<void> | void;
}

/** Producer uses a fast-fail connection; it never holds an HTTP request indefinitely. */
export async function openDigestProducer(options: JobsValkeyOptions): Promise<DigestProducer> {
  const config = resolveJobsConfig(options);
  const redis = new Redis(config.url, {
    lazyConnect: true,
    connectTimeout: 1500,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });
  // Prevent unhandled 'error' events. Do not log connection strings or payloads.
  redis.on('error', () => {});
  let queue: Queue | undefined;
  try {
    await redis.connect();
    queue = new Queue(config.queueName, {
      connection: redis,
      prefix: 'lego',
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 250 },
        removeOnComplete: { age: 86400, count: 1000 },
        removeOnFail: { age: 86400, count: 1000 },
      },
    });
    queue.on('error', () => {});
    await queue.waitUntilReady();
  } catch {
    await queue?.close().catch(() => {});
    redis.disconnect();
    throw new Error('Valkey producer unavailable');
  }

  const boundQueue = queue;
  let closed = false;
  return {
    async enqueueDigest(value: unknown): Promise<{ jobId: string }> {
      if (closed) throw new Error('Valkey producer closed');
      const input: DigestInput = validateDigestInput(value);
      const job = await boundQueue.add(DIGEST_JOB_NAME, input, { jobId: digestJobId(input) });
      if (!job.id) throw new Error('Valkey job ID missing');
      return { jobId: job.id };
    },
    async getDigestStatus(jobId: string) {
      if (closed) throw new Error('Valkey producer closed');
      if (!/^digest-[a-f0-9]{64}$/.test(jobId)) throw new Error('Invalid job ID');
      const job = await boundQueue.getJob(jobId);
      if (!job) return null;
      const state = await job.getState();
      if (state !== 'completed') return { state };
      return { state, result: job.returnvalue as DigestResult };
    },
    async close() {
      if (closed) return;
      closed = true;
      try { await boundQueue.close(); }
      finally { redis.disconnect(); }
    },
  };
}

/** Optional scope; no routes/decorators/connections are added to Fastify Core by default. */
export function createJobsPlugin(options: ProducerPluginOptions): FastifyPluginAsync {
  return async function jobsScope(app) {
    const producer = await openDigestProducer(options);
    app.addHook('onClose', async () => { await producer.close(); });
    try { await options.registerRoutes?.(app, producer); }
    catch {
      await producer.close();
      throw new Error('Jobs plugin registration failed');
    }
  };
}
