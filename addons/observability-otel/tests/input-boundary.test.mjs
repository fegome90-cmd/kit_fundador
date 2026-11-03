import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveObservabilityOptions as resolve } from '../dist/config.js';

const valid = { enabled: true, serviceName: 'lego-r4-api', endpoint: 'http://127.0.0.1:4318' };

test('port zero cannot identify an OTLP destination', () => {
  for (const endpoint of ['http://127.0.0.1:0', 'https://collector.invalid:0', 'https://collector.invalid:000']) {
    assert.throws(() => resolve({ ...valid, endpoint }), { message: 'Invalid observability endpoint' });
  }
});

test('inherited enabled flag cannot opt an application into telemetry', () => {
  const input = Object.assign(Object.create({ enabled: true }), {
    serviceName: 'lego-r4-api', endpoint: 'http://127.0.0.1:4318',
  });
  assert.deepEqual(resolve(input), { enabled: false });
});

test('inherited flag getter is not evaluated', () => {
  const input = Object.create({ get enabled() { throw new Error('Unexpected inherited getter'); } });
  assert.deepEqual(resolve(input), { enabled: false });
});

test('enabled configuration requires an own service name', () => {
  const input = Object.assign(Object.create({ serviceName: 'lego-r4-api' }), {
    enabled: true, endpoint: 'http://127.0.0.1:4318',
  });
  assert.throws(() => resolve(input), { message: 'Invalid observability serviceName' });
});

test('enabled configuration requires an own destination', () => {
  const input = Object.assign(Object.create({ endpoint: 'http://127.0.0.1:4318' }), {
    enabled: true, serviceName: 'lego-r4-api',
  });
  assert.throws(() => resolve(input), { message: 'Invalid observability endpoint' });
});

test('inherited optional budgets and sampling do not override defaults', () => {
  const input = Object.assign(Object.create({ sampleRatio: 0, exportTimeoutMs: 4000, shutdownTimeoutMs: 6000 }), valid);
  assert.deepEqual(resolve(input), {
    enabled: true, serviceName: 'lego-r4-api', endpoint: 'http://127.0.0.1:4318',
    sampleRatio: 1, exportTimeoutMs: 1000, shutdownTimeoutMs: 2000,
  });
});

test('own properties on a null-prototype data object remain supported', () => {
  const input = Object.assign(Object.create(null), valid, { sampleRatio: 0.5 });
  assert.equal(resolve(input).sampleRatio, 0.5);
});

// Accessor properties are executable code; option resolution must not invoke them.
test('own enabled getter cannot execute code or leak a thrown secret', () => {
  let touched = 0;
  const input = { get enabled() { touched++; throw new Error('SYNTHETIC_OWN_GETTER_SECRET'); } };
  assert.throws(() => resolve(input), { message: 'Invalid observability options' });
  assert.equal(touched, 0);
});

test('ON rejects accessors in endpoint and optional fields without evaluating them', () => {
  for (const key of ['serviceName', 'endpoint', 'sampleRatio', 'exportTimeoutMs', 'shutdownTimeoutMs']) {
    let touched = 0;
    const input = { ...valid };
    Object.defineProperty(input, key, {
      enumerable: true,
      get() { touched++; throw new Error('SYNTHETIC_OWN_GETTER_SECRET'); },
    });
    assert.throws(() => resolve(input), { message: 'Invalid observability options' });
    assert.equal(touched, 0, `Getter executed: ${key}`);
  }
});
