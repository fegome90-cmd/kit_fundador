#!/usr/bin/env node
// R2 lab only: build private packages, then replay a frozen install externally.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const lab = mkdtempSync(join(tmpdir(), 'lego-full-b-'));
function run(cwd, executable, args) {
  const r = spawnSync(executable, args, { cwd, env: process.env, stdio: 'inherit' });
  if (r.error) throw r.error;
  assert.equal(r.status, 0, executable + ' failed during R2: ' + args.join(' '));
}
function copy(relative, dest) { cpSync(join(root, relative), dest, { recursive: true }); }
function json(path) { return JSON.parse(readFileSync(path, 'utf8')); }
function save(path, data) { writeFileSync(path, JSON.stringify(data, null, 2) + '\n'); }
for (const key of ['PG_ADMIN_URL', 'MIGRATION_DATABASE_URL', 'AUTH_MIGRATION_DATABASE_URL',
  'FULLB_DB_URL', 'FULLB_AUTH_URL', 'FULLB_AUTH_SECRET', 'VALKEY_URL']) {
  assert.ok(process.env[key], 'Missing synthetic CI variable ' + key);
}
try {
  const build = join(lab, 'build');
  const replay = join(lab, 'replayed-consumer');
  const vendor = join(build, 'vendor');
  mkdirSync(vendor, { recursive: true });
  const archives = new Map();
  for (const addon of ['db-postgres', 'auth-better-auth', 'jobs-valkey']) {
    const dir = join(lab, 'isolated-' + addon);
    copy('addons/' + addon, dir);
    assert.ok(!existsSync(join(dirname(dir), 'package.json')));
    run(dir, 'pnpm', ['install', '--frozen-lockfile', '--strict-peer-dependencies', '--ignore-scripts']);
    run(dir, 'pnpm', ['run', 'typecheck']);
    run(dir, 'pnpm', ['run', 'build']);
    if (addon !== 'jobs-valkey') {
      run(dir, 'pnpm', ['run', 'db:check']);
      run(dir, 'pnpm', ['run', 'db:migrate']);
      run(dir, 'pnpm', ['run', 'db:migrate']);
    }
    const prior = new Set(readdirSync(vendor));
    run(dir, 'pnpm', ['pack', '--pack-destination', vendor]);
    const newlyPacked = readdirSync(vendor).filter(f => f.endsWith('.tgz') && !prior.has(f));
    assert.equal(newlyPacked.length, 1, 'Expected exactly one tarball: ' + addon);
    renameSync(join(vendor, newlyPacked[0]), join(vendor, addon + '.tgz'));
    archives.set(addon, 'file:vendor/' + addon + '.tgz');
  }
  copy('templates/fastify-openapi', build);
  const recipe = join(root, 'recipes/full-b');
  for (const name of ['ci', 'tests', 'migrations']) {
    mkdirSync(join(build, name), { recursive: true });
  }
  for (const name of ['tests/full-b.test.mjs', 'ci/init-db.mjs', 'migrations/0001_fullb.sql']) {
    copyFileSync(join(recipe, name), join(build, name));
  }
  for (const name of ['src/full-b.ts', 'worker.mjs']) {
    if (existsSync(join(recipe, name))) {
      copyFileSync(join(recipe, name), join(build, name));
    }
  }
  const manifestFile = join(build, 'package.json');
  const manifest = json(manifestFile);
  manifest.dependencies = {
    ...manifest.dependencies,
    '@kit-fundador/db-postgres': archives.get('db-postgres'),
    '@kit-fundador/auth-better-auth': archives.get('auth-better-auth'),
    '@kit-fundador/jobs-valkey': archives.get('jobs-valkey'),
    'drizzle-orm': '0.45.4',
    'pg': '8.23.1',
  };
  manifest.devDependencies = { ...manifest.devDependencies, '@types/pg': '8.23.1' };
  assert.equal(manifest.private, true);
  assert.ok(Object.values(manifest.dependencies).every(d => !String(d).startsWith('workspace:')));
  save(manifestFile, manifest);
  const configFile = join(build, 'tsconfig.json');
  const config = json(configFile);
  assert.equal(config.compilerOptions.strict, true);
  config.compilerOptions.skipLibCheck = true; // upstream Drizzle/Better Auth .d.ts waiver
  save(configFile, config);

  // First install resolves pinned dependencies into a new, consumer-owned lockfile.
  run(build, 'pnpm', ['install', '--no-frozen-lockfile', '--strict-peer-dependencies', '--ignore-scripts']);
  assert.ok(existsSync(join(build, 'pnpm-lock.yaml')));
  const omit = new Set(['node_modules', 'dist']);
  cpSync(build, replay, {
    recursive: true,
    filter: path => !path.slice(build.length).split(sep).some(part => omit.has(part)),
  });
  run(replay, 'pnpm', ['install', '--frozen-lockfile', '--strict-peer-dependencies', '--ignore-scripts']);
  run(replay, 'pnpm', ['run', 'typecheck']);
  run(replay, 'pnpm', ['run', 'build']);
  if (process.env.RUNNER_TEMP) {
    copyFileSync(join(replay, 'pnpm-lock.yaml'), join(process.env.RUNNER_TEMP, 'full-b-pnpm-lock.yaml'));
  }
  run(replay, 'node', ['ci/init-db.mjs']);
  run(replay, 'node', ['--test', 'tests/full-b.test.mjs']);
  console.log('LEGO_R2_FULL_B_E2E_PASS');
} finally {
  rmSync(lab, { recursive: true, force: true });
}
