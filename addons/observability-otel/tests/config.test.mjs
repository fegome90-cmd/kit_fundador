import assert from 'node:assert/strict';
import { test } from 'node:test';
import { spawnSync } from 'node:child_process';
import * as candidate from '../dist/config.js';

const sentinel = 'SYNTHETIC_R4_SECRET_DO_NOT_EXPORT';
const valid = { enabled: true, serviceName: 'lego-r4-api', endpoint: 'http://127.0.0.1:4318' };

test('R4-A0 explicit observability configuration contract', async (t) => {
  assert.equal(typeof candidate.resolveObservabilityOptions, 'function',
    'R4_RED_MISSING_CONFIG_CONTRACT: resolveObservabilityOptions must exist');
  const resolve = candidate.resolveObservabilityOptions;

  await t.test('omitted configuration is OFF and immutable', () => {
    const result = resolve();
    assert.deepEqual(result, { enabled: false });
    assert.ok(Object.isFrozen(result));
  });
  await t.test('explicit OFF does not require active configuration', () => {
    assert.deepEqual(resolve({ enabled: false, endpoint: sentinel }), { enabled: false });
  });
  await t.test('empty configuration defaults to OFF', () => {
    assert.deepEqual(resolve({}), { enabled: false });
  });
  await t.test('does not infer configuration from environment or mutate it', () => {
    const before = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
    try {
      process.env.OTEL_EXPORTER_OTLP_ENDPOINT = `https://${sentinel}.invalid`;
      assert.deepEqual(resolve(), { enabled: false });
      assert.equal(process.env.OTEL_EXPORTER_OTLP_ENDPOINT, `https://${sentinel}.invalid`);
    } finally {
      if (before === undefined) delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;
      else process.env.OTEL_EXPORTER_OTLP_ENDPOINT = before;
    }
  });
  await t.test('ON produces a minimal immutable resolved configuration', () => {
    const input = Object.freeze({ ...valid });
    const result = resolve(input);
    assert.deepEqual(result, {
      enabled: true, serviceName: 'lego-r4-api', endpoint: 'http://127.0.0.1:4318',
      sampleRatio: 1, exportTimeoutMs: 1000, shutdownTimeoutMs: 2000,
    });
    assert.deepEqual(input, valid);
    assert.ok(Object.isFrozen(result));
  });
  for (const input of [null, [], 'true', 1, false]) {
    await t.test(`rejects non-object options: ${JSON.stringify(input)}`, () => {
      assert.throws(() => resolve(input), { message: 'Invalid observability options' });
    });
  }
  for (const enabled of ['1', '0', 1, null]) {
    await t.test(`does not coerce enabled=${JSON.stringify(enabled)}`, () => {
      assert.throws(() => resolve({ enabled }), { message: 'Invalid observability enabled flag' });
    });
  }
  await t.test('rejects unknown ON fields without echoing keys or values', () => {
    assert.throws(() => resolve({ ...valid, [sentinel]: sentinel }),
      { message: 'Unknown observability option' });
  });
  for (const serviceName of [undefined, '', ' service', 'a'.repeat(64), 'user@example.org', sentinel]) {
    await t.test(`rejects invalid service name ${String(serviceName).slice(0,24)}`, () => {
      assert.throws(() => resolve({ ...valid, serviceName }),
        { message: 'Invalid observability serviceName' });
    });
  }
  for (const endpoint of [undefined, '', 'not-a-url', 'http://collector.example.org:4318',
    'ftp://127.0.0.1:4318', `https://user:${sentinel}@collector.invalid`,
    `https://collector.invalid/?token=${sentinel}`, `https://collector.invalid/#${sentinel}`,
    'https://collector.invalid/v1/traces', ' https://collector.invalid',
    'http://127.0.0.1:99999', 'http://127.0.0.2:4318',
    'https://collector.invalid/?', 'https://collector.invalid/#',
    'https://collector.invalid/ignored/..', 'https://@collector.invalid',
    'https://collec\ntor.invalid', 'https://collector.invalid\\']) {
    await t.test('rejects unsafe or ambiguous endpoint ' + String(endpoint).split(':')[0], () => {
      assert.throws(() => resolve({ ...valid, endpoint }),
        { message: 'Invalid observability endpoint' });
    });
  }
  for (const endpoint of ['http://localhost:4318/', 'http://[::1]:4318', 'https://collector.example.org:4318/']) {
    await t.test(`accepts explicit transport policy: ${endpoint}`, () => {
      assert.equal(resolve({ ...valid, endpoint }).endpoint, new URL(endpoint).origin);
    });
  }
  for (const sampleRatio of [-1, 1.01, NaN, Infinity, '0.5']) {
    await t.test(`rejects invalid sampleRatio: ${sampleRatio}`, () => {
      assert.throws(() => resolve({ ...valid, sampleRatio }),
        { message: 'Invalid observability sampleRatio' });
    });
  }
  await t.test('sampling boundaries are accepted without coercion', () => {
    for (const sampleRatio of [0, 0.5, 1]) {
      assert.equal(resolve({ ...valid, sampleRatio }).sampleRatio, sampleRatio);
    }
  });
  for (const [field, bad, minimum, maximum] of [
    ['exportTimeoutMs', [99, 5001, 100.5, Infinity, '1000', null], 100, 5000],
    ['shutdownTimeoutMs', [99, 10001, 100.5, Infinity, '2000', null], 100, 10000],
  ]) {
    await t.test(`${field} is a bounded integer`, () => {
      for (const value of bad) assert.throws(() => resolve({ ...valid, [field]: value }),
        { message: `Invalid observability ${field}` });
      for (const value of [minimum, maximum]) {
        const input = { ...valid, [field]: value };
        if (field === 'exportTimeoutMs') input.shutdownTimeoutMs = Math.max(2000, value);
        else input.exportTimeoutMs = Math.min(1000, value);
        assert.equal(resolve(input)[field], value);
      }
    });
  }
  await t.test('shutdown budget cannot be shorter than one export timeout', () => {
    assert.throws(() => resolve({ ...valid, exportTimeoutMs: 2000, shutdownTimeoutMs: 1000 }),
      { message: 'Observability shutdown timeout must cover export timeout' });
  });
  await t.test('validation errors contain no input values, causes, or credentials', () => {
    try { resolve({ ...valid, endpoint: `https://x:${sentinel}@collector.invalid` }); }
    catch (error) {
      assert.ok(error instanceof Error);
      assert.equal(error.message.includes(sentinel), false);
      assert.equal(error.stack.includes(sentinel), false);
      assert.equal(error.cause, undefined);
      return;
    }
    assert.fail('expected rejected endpoint');
  });
  await t.test('import and resolution have no network, process-listener, or env effects', () => {
    const child = spawnSync(process.execPath, [new URL('./no-side-effects.mjs', import.meta.url).pathname],
      { encoding: 'utf8', timeout: 5000 });
    assert.equal(child.error, undefined);
    assert.equal(child.status, 0, child.stderr + child.stdout);
    assert.match(child.stdout, /R4_CONFIG_NO_SIDE_EFFECTS_PASS/);
  });
});
