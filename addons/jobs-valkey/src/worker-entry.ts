import { startDigestWorker } from './worker.js';

const valkeyUrl = process.env.VALKEY_URL;
if (!valkeyUrl) throw new Error('VALKEY_URL must be configured');
const worker = await startDigestWorker({
  valkeyUrl,
  queueName: process.env.JOBS_QUEUE_NAME ?? 'lego-digest-v1',
});
console.log('LEGO_WORKER_READY');
let shuttingDown = false;
async function shutdown(): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;
  try { await worker.close(); }
  catch { process.exitCode = 1; }
}
process.once('SIGINT', () => { void shutdown(); });
process.once('SIGTERM', () => { void shutdown(); });
