import assert from 'node:assert/strict';
import net from 'node:net';
import dns from 'node:dns';
import http from 'node:http';
import https from 'node:https';
import dgram from 'node:dgram';
import { syncBuiltinESMExports } from 'node:module';

const beforeEnv = { ...process.env };
const beforeListeners = new Map(process.eventNames().map(name => [name, process.listenerCount(name)]));
let attempted = 0;
const deny = () => { attempted++; throw new Error('R4_UNEXPECTED_NETWORK'); };
net.Socket.prototype.connect = deny;
dns.lookup = deny;
dns.resolve = deny;
http.request = deny;
https.request = deny;
dgram.createSocket = deny;
globalThis.fetch = deny;
syncBuiltinESMExports();
// Node's ESM loader can read its own environment while importing; restrict the
// guard to reads whose call stack includes the compiled module under test.
const configUrl = new URL('../dist/config.js', import.meta.url);
/** Distinguish direct configuration-module environment reads from loader probes. */
const moduleReadsEnv = () => new Error().stack?.includes(configUrl.href);
// The OFF path must not even inspect environment values it subsequently ignores.
const envDescriptor = Object.getOwnPropertyDescriptor(process, 'env');
assert.ok(envDescriptor);
const envReads = [];
let resolve, omitted, explicitOff;
Object.defineProperty(process, 'env', {
  ...envDescriptor,
  value: new Proxy(process.env, {
    get(target, property, receiver) {
      if (moduleReadsEnv()) envReads.push(String(property));
      return Reflect.get(target, property, receiver);
    },
    has(target, property) {
      if (moduleReadsEnv()) envReads.push(String(property));
      return Reflect.has(target, property);
    },
    ownKeys(target) {
      if (moduleReadsEnv()) envReads.push('[keys]');
      return Reflect.ownKeys(target);
    },
  }),
});
try {
  ({ resolveObservabilityOptions: resolve } = await import(configUrl));
  omitted = resolve();
  explicitOff = resolve({ enabled: false, endpoint: 'not-a-destination' });
} finally {
  Object.defineProperty(process, 'env', envDescriptor);
}
assert.deepEqual(omitted, { enabled: false });
assert.deepEqual(explicitOff, { enabled: false });
assert.deepEqual(envReads, [], 'R4_UNEXPECTED_ENV_READ');
resolve({ enabled: true, serviceName: 'lego-r4-api', endpoint: 'http://127.0.0.1:4318' });
assert.equal(attempted, 0);
assert.deepEqual({ ...process.env }, beforeEnv);
assert.deepEqual(new Map(process.eventNames().map(name => [name, process.listenerCount(name)])), beforeListeners);
console.log('R4_CONFIG_NO_SIDE_EFFECTS_PASS');
