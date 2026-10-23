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
function verifiedBaseUrl(): string {
  const raw = required('FULLB_BASE_URL');
  const expected = 'FULLB_BASE_URL must match the loopback HTTP listener origin';
  let url: URL;
  try { url = new URL(raw); }
  catch { throw new Error(expected); }
  // Node includes square brackets in URL.hostname for IPv6.
  const originHost = url.hostname.startsWith('[') && url.hostname.endsWith(']')
    ? url.hostname.slice(1, -1).toLowerCase() : url.hostname.toLowerCase();
  const listenerHost = host.toLowerCase();
  const portText = process.env.PORT ?? '3000';
  const listenerPort = Number(portText);
  const originPort = Number(url.port || (url.protocol === 'http:' ? '80' : '443'));
  // A dynamic port cannot be verified before Better Auth validates its origin.
  if (url.protocol !== 'http:' || originHost !== listenerHost ||
      !/^[0-9]+$/.test(portText) || !Number.isSafeInteger(listenerPort) ||
      listenerPort < 1 || listenerPort > 65535 || originPort !== listenerPort ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash) {
    throw new Error(expected);
  }
  return raw;
}

const app = buildFullB({
  databaseUrl: required('FULLB_DB_URL'),
  authUrl: required('FULLB_AUTH_URL'),
  secret: required('FULLB_AUTH_SECRET'),
  baseURL: verifiedBaseUrl(),
  valkeyUrl: required('VALKEY_URL'),
  queueName: process.env.JOBS_QUEUE_NAME ?? 'lego-fullb-v1',
  docsEnabled: flag === '1',
});
await listen(app);
