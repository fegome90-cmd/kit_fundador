import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { buildApp } from '../dist/app.js';
import { registerSwagger, registerSwaggerUi } from '../dist/plugins/api-docs.js';

test('docs OFF leaves no UI or JSON schema', async (t) => {
  const app = buildApp();
  t.after(() => app.close());
  for (const url of ['/docs/', '/docs/json']) {
    const response = await app.inject({ method: 'GET', url });
    assert.equal(response.statusCode, 404, url);
  }
  const health = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(health.statusCode, 200);
});

test('Swagger before routes includes health and has an opt-in UI', async (t) => {
  const app = buildApp({
    beforeRoutes: registerSwagger,
    afterRoutes: registerSwaggerUi,
  });
  t.after(() => app.close());
  const spec = await app.inject({ method: 'GET', url: '/docs/json' });
  assert.equal(spec.statusCode, 200, spec.body);
  const json = spec.json();
  assert.ok(json.openapi?.startsWith('3.'));
  assert.ok(json.paths['/health'], 'health missing from OpenAPI');
  const ui = await app.inject({ method: 'GET', url: '/docs/' });
  assert.equal(ui.statusCode, 200);
});

test('invalid docs flag rejects compiled entrypoint before listen', async () => {
  const child = spawn(process.execPath, ['dist/server.js'], {
    env: { ...process.env, DOCS_ENABLED: 'yes', PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stderr.on('data', data => output += data.toString());
  const code = await new Promise(resolve => child.once('exit', resolve));
  assert.notEqual(code, 0);
  assert.match(output, /DOCS_ENABLED must be 0 or 1/);
  assert.ok(!output.includes('KIT_LISTEN'));
});
