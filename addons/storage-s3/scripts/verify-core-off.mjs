#!/usr/bin/env node
// R3 gate: run the real Fastify Core template in an isolated directory.
// Do not import Storage or use the repository's dependency tree.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

assert.equal(Number(process.versions.node.split('.')[0]), 24, 'R3 Core gate requires Node 24');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const source = join(root, 'templates', 'fastify-core');
const scratch = mkdtempSync(join(tmpdir(), 'lego-r3-core-off-'));
const core = join(scratch, 'fastify-core');
function run(command, args) {
  const result = spawnSync(command, args, { cwd: core, env: process.env, stdio: 'inherit' });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, command + ' ' + args.join(' ') + ' failed for Fastify Core');
}
try {
  cpSync(source, core, {
    recursive: true,
    filter: path => !relative(source, path).split(sep).some(p => p === 'node_modules' || p === 'dist'),
  });
  const manifest = JSON.parse(readFileSync(join(core, 'package.json'), 'utf8'));
  assert.equal(manifest.private, true);
  assert.deepEqual(Object.keys(manifest.dependencies ?? {}), ['fastify'],
    'The actual Core template gained an external storage dependency');
  assert.ok(!JSON.stringify(manifest).includes('@kit-fundador/storage-s3'));
  assert.ok(!JSON.stringify(manifest).includes('@aws-sdk/client-s3'));

  run('pnpm', ['install', '--frozen-lockfile', '--strict-peer-dependencies', '--ignore-scripts']);
  run('pnpm', ['run', 'typecheck']);
  run('pnpm', ['test']);
  const { buildApp } = await import(pathToFileURL(join(core, 'dist', 'app.js')).href);
  assert.equal(typeof buildApp, 'function', 'Must import Core factory, not bare Fastify');
  const app = buildApp();
  try {
    await app.ready();
    assert.equal((await app.inject('/health')).statusCode, 200);
    assert.equal((await app.inject('/private/a/shared')).statusCode, 404);
    assert.equal((await app.inject('/storage/s3')).statusCode, 404);
  } finally {
    await app.close();
  }
  console.log('LEGO_R3_REAL_CORE_OFF_PASS', basename(core));
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
