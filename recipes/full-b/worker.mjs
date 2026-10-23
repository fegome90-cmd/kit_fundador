// Worker is a separate Node process; API HTTP does not inherit a session.
import { startDigestWorker } from '@kit-fundador/jobs-valkey';

if (!process.env.VALKEY_URL) throw new Error('VALKEY_URL must be set');
const handle = await startDigestWorker({
  valkeyUrl: process.env.VALKEY_URL,
  queueName: process.env.JOBS_QUEUE_NAME ?? 'lego-fullb-v1',
});
console.log('LEGO_WORKER_READY');
let closing = false;
async function shutdown() {
  if (closing) return;
  closing = true;
  try { await handle.close(); }
  catch { process.exitCode = 1; }
}
process.once('SIGTERM', () => { void shutdown(); });
process.once('SIGINT', () => { void shutdown(); });
