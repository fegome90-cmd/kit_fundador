import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, mkdir, copyFile, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

// Harness canary: a deliberately network-active copy must not earn a PASS.
// The production resolver itself is unchanged by this test.
test('network guard detects a named ESM DNS call inserted before the resolver', async t => {
  const root = await mkdtemp(join(tmpdir(), 'r4-guard-canary-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'dist'));
  await mkdir(join(root, 'tests'));
  await writeFile(join(root, 'package.json'), '{"type":"module"}\n');
  await copyFile(new URL('./no-side-effects.mjs', import.meta.url), join(root, 'tests/no-side-effects.mjs'));
  const compiled = await readFile(new URL('../dist/config.js', import.meta.url), 'utf8');
  await writeFile(join(root, 'dist/config.js'),
    "import { lookup } from 'node:dns';\nlookup('localhost', () => {});\n" + compiled);
  const child = spawnSync(process.execPath, [join(root, 'tests/no-side-effects.mjs')], {
    encoding: 'utf8', timeout: 5000,
  });
  assert.equal(child.error, undefined);
  assert.equal(child.status, 1, 'A network-active mutation must be rejected by the guard');
  assert.match(child.stderr, /R4_UNEXPECTED_NETWORK/);
  assert.doesNotMatch(child.stdout, /R4_CONFIG_NO_SIDE_EFFECTS_PASS/);
});


// Canary for ignored process.env reads in either OFF call; no production mutation.
test('environment guard detects an ignored OFF-path environment read', async t => {
  const root = await mkdtemp(join(tmpdir(), 'r4-env-canary-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, 'dist'));
  await mkdir(join(root, 'tests'));
  await writeFile(join(root, 'package.json'), '{"type":"module"}\n');
  await copyFile(new URL('./no-side-effects.mjs', import.meta.url), join(root, 'tests/no-side-effects.mjs'));
  const compiled = await readFile(new URL('../dist/config.js', import.meta.url), 'utf8');
  const signature = 'export function resolveObservabilityOptions(input) {';
  assert.ok(compiled.includes(signature), 'Expected compiled resolver signature for mutation');
  const mutation = compiled.replace(signature,
    signature + '\n  void process.env.R4_IGNORED_ENV_READ;');
  await writeFile(join(root, 'dist/config.js'), mutation);
  const child = spawnSync(process.execPath, [join(root, 'tests/no-side-effects.mjs')], {
    encoding: 'utf8', timeout: 5000,
  });
  assert.equal(child.error, undefined);
  assert.equal(child.status, 1, 'An ignored environment read must be rejected');
  assert.match(child.stderr, /R4_UNEXPECTED_ENV_READ/);
  assert.doesNotMatch(child.stdout, /R4_CONFIG_NO_SIDE_EFFECTS_PASS/);
});
