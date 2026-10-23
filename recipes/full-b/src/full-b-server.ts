import { buildFullB } from './full-b.js';
import { listen } from './runtime.js';

// Deliberately a separate explicit entrypoint: the starter's default
// server remains Core-only. No migrations or workers run during import.
function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error('Missing Full B configuration: ' + name);
  return value;
}
const host = process.env.HOST ?? '127.0.0.1';
if (!['127.0.0.1', 'localhost', '::1'].includes(host)) {
  throw new Error('Full B laboratory API must bind to loopback only');
}
const flag = process.env.FULLB_DOCS_ENABLED ?? '0';
if (flag !== '0' && flag !== '1') {
  throw new Error('FULLB_DOCS_ENABLED must be 0 or 1');
}
const app = buildFullB({
  databaseUrl: required('FULLB_DB_URL'),
  authUrl: required('FULLB_AUTH_URL'),
  secret: required('FULLB_AUTH_SECRET'),
  baseURL: process.env.FULLB_BASE_URL ?? 'http://127.0.0.1:4310',
  valkeyUrl: required('VALKEY_URL'),
  queueName: process.env.JOBS_QUEUE_NAME ?? 'lego-fullb-v1',
  docsEnabled: flag === '1',
});
await listen(app);
