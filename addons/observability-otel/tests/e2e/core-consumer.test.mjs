import assert from 'node:assert/strict';
import { test } from 'node:test';
import { copyFile, realpath } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createServer, request } from 'node:http';
import { join, relative, isAbsolute, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = await realpath(fileURLToPath(new URL('../../../../', import.meta.url)));
assert.ok(process.env.R4_E2E_CORE_DIR, 'R4_E2E_CORE_DIR must identify a real compiled Core outside the repository');
const core = await realpath(process.env.R4_E2E_CORE_DIR);
const delta = relative(root, core);
assert.ok(delta === '..' || delta.startsWith('..' + sep) || isAbsolute(delta),
  'The E2E consumer must be outside the checkout');
await copyFile(new URL('../../dist/config.js', import.meta.url), join(core, 'r4-config.js'));
await copyFile(new URL('./consumer-entry.mjs', import.meta.url), join(core, 'r4-e2e-entry.mjs'));

const sentinel = 'SYNTHETIC_R4_E2E_DO_NOT_LOG';
const valid = { enabled: true, serviceName: 'lego-r4-e2e', endpoint: 'http://127.0.0.1:4318' };

async function deadline(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(label)), ms);
    })]);
  } finally { clearTimeout(timer); }
}

function start(t, input, endpoint) {
  const env = { ...process.env, HOST: '127.0.0.1', PORT: '0',
    OTEL_EXPORTER_OTLP_ENDPOINT: endpoint, OTEL_SERVICE_NAME: sentinel };
  delete env.R4_E2E_OPTIONS;
  if (input !== undefined) env.R4_E2E_OPTIONS = JSON.stringify(input);
  const child = spawn(process.execPath, [join(core, 'r4-e2e-entry.mjs')], {
    cwd: core, env, stdio: ['ignore', 'pipe', 'pipe'],
  });
  let stdout = '', stderr = '';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data', data => { stdout += data; });
  child.stderr.on('data', data => { stderr += data; });
  const exited = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', (code, signal) => resolve({ code, signal }));
  });
  // Install cleanup immediately, including when startup assertions fail.
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
    await deadline(exited, 5000, 'Child cleanup timed out');
  });
  async function listening() {
    const ready = new Promise((resolve, reject) => {
      const inspect = () => {
        const match = stdout.match(/KIT_LISTEN (http:\/\/127\.0\.0\.1:\d+)/);
        if (match) resolve(match[1]);
      };
      inspect();
      child.stdout.on('data', inspect);
      exited.then(() => reject(new Error('Exited before HTTP readiness: ' + stderr)), reject);
    });
    return deadline(ready, 10000, 'Real Core readiness timed out');
  }
  return { child, exited, listening, output: () => stdout + stderr };
}

function get(url) {
  return new Promise((resolve, reject) => {
    const req = request(url, { method: 'GET', headers: { connection: 'close' }, timeout: 2000 }, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.once('end', () => resolve({ status: res.statusCode, headers: res.headers, body }));
      res.once('error', reject);
    });
    req.once('timeout', () => req.destroy(new Error('HTTP deadline exceeded')));
    req.once('error', reject);
    req.end();
  });
}

async function networkWitness(t) {
  let connections = 0;
  const server = createServer((_req, res) => res.end());
  server.on('connection', () => { connections++; });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  t.after(async () => {
    server.closeAllConnections();
    await new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  });
  return { endpoint: `http://127.0.0.1:${server.address().port}`, count: () => connections };
}

for (const scenario of [
  { name: 'omitted config remains OFF despite OTEL environment', make: () => undefined, enabled: false, signal: 'SIGTERM' },
  { name: 'explicit OFF tolerates inactive invalid destination', make: () => ({ enabled: false, endpoint: sentinel }), enabled: false, signal: 'SIGINT' },
  { name: 'ON configuration is validated without starting telemetry in A0', make: endpoint => ({ ...valid, endpoint }), enabled: true, signal: 'SIGTERM' },
]) {
  test(`E2E ${scenario.name}: isolated consumer → real HTTP → clean shutdown`, { timeout: 20000 }, async t => {
    const witness = await networkWitness(t);
    const app = start(t, scenario.make(witness.endpoint), witness.endpoint);
    const address = await app.listening();
    const health = await get(address + '/health?synthetic=' + sentinel);
    assert.equal(health.status, 200);
    assert.deepEqual(JSON.parse(health.body), { ok: true });
    assert.equal(health.headers['x-content-type-options'], 'nosniff');
    assert.ok(health.headers['x-request-id']);
    for (const path of ['/docs/', '/v1/traces', '/v1/metrics']) {
      assert.equal((await get(address + path)).status, 404);
    }
    assert.match(app.output(), new RegExp(`R4_CONFIG_ACCEPTED \\{"enabled":${scenario.enabled}\\}`));
    app.child.kill(scenario.signal);
    assert.deepEqual(await deadline(app.exited, 5000, 'Graceful shutdown timed out'), { code: 0, signal: null });
    await assert.rejects(get(address + '/health'), error => error.code === 'ECONNREFUSED');
    assert.equal(witness.count(), 0, 'A0 must never contact a telemetry destination');
    assert.equal(app.output().includes(sentinel), false, 'No sentinel in stdout/stderr');
  });
}

for (const [name, input] of [
  ['credential-bearing destination', { ...valid, endpoint: `https://x:${sentinel}@collector.invalid` }],
  ['non-loopback plaintext destination', { ...valid, endpoint: 'http://collector.invalid:4318' }],
  ['port zero destination', { ...valid, endpoint: 'http://127.0.0.1:0' }],
]) {
  test(`E2E ${name} is rejected before HTTP starts`, { timeout: 15000 }, async t => {
    const witness = await networkWitness(t);
    const app = start(t, input, witness.endpoint);
    assert.deepEqual(await deadline(app.exited, 5000, 'Invalid config did not exit'), { code: 2, signal: null });
    assert.match(app.output(), /R4_CONFIG_REJECTED/);
    assert.doesNotMatch(app.output(), /KIT_LISTEN|R4_CONFIG_ACCEPTED/);
    assert.equal(app.output().includes(sentinel), false);
    assert.equal(witness.count(), 0);
  });
}
