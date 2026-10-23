#!/usr/bin/env node
// R1: only a controlled local tarball, never npm publish or a live service.
// Usage: node scripts/verify-lego-package-consumer.mjs <addon-name>
import assert from 'node:assert/strict';
import { spawnSync, execFileSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { assertNoLifecycleHooks } from './lego-package-lifecycle-policy.mjs';

const expected = Object.freeze({
  'db-postgres': {
    entry: 'createPostgresPlugin',
    files: ['dist', 'src', 'drizzle', 'drizzle.config.ts', 'scripts/require-migration-url.mjs', 'README.md'],
    archiveFiles: ['package/dist/schema.js', 'package/dist/schema.d.ts', 'package/drizzle.config.ts', 'package/drizzle/0000_init.sql', 'package/src/schema.ts', 'package/scripts/require-migration-url.mjs'],
    types: [
      "import { createPostgresPlugin } from '@kit-fundador/db-postgres';",
      "import { notes } from '@kit-fundador/db-postgres/schema';",
      "import type { FastifyPluginAsync } from 'fastify';",
      "const plugin: FastifyPluginAsync = createPostgresPlugin({ databaseUrl: 'postgresql://example:example@127.0.0.1/app' });",
      "const columnName: string = notes.content.name;",
      "void plugin; void columnName;",
    ],
  },
  'auth-better-auth': {
    entry: 'createAuthPlugin',
    files: ['dist', 'src', 'drizzle', 'drizzle.config.ts', 'scripts/require-migration-url.mjs', 'README.md'],
    archiveFiles: ['package/drizzle.config.ts', 'package/drizzle/0000_init.sql', 'package/src/auth-schema.ts', 'package/scripts/require-migration-url.mjs'],
    types: [
      "import { createAuthPlugin } from '@kit-fundador/auth-better-auth';",
      "import type { FastifyPluginAsync } from 'fastify';",
      "const plugin: FastifyPluginAsync = createAuthPlugin({",
      "  databaseUrl: 'postgresql://example:example@127.0.0.1/auth',",
      "  baseURL: 'http://127.0.0.1:4310',",
      "  secret: 'synthetic-value-only-used-to-typecheck-2026',",
      "});",
      "void plugin;",
    ],
  },
  'jobs-valkey': {
    entry: 'createJobsPlugin',
    files: ['dist', 'README.md'],
    archiveFiles: ['package/dist/worker-entry.js', 'package/dist/index.d.ts'],
    types: [
      "import { createJobsPlugin } from '@kit-fundador/jobs-valkey';",
      "import type { FastifyPluginAsync } from 'fastify';",
      "const plugin: FastifyPluginAsync = createJobsPlugin({ valkeyUrl: 'redis://127.0.0.1:6379' });",
      "void plugin;",
    ],
  },
});

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit', env: process.env });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, command + ' ' + args.join(' ') + ' failed in ' + cwd);
}
function requireEntry(entries, name) {
  assert.ok(entries.includes(name), 'Missing archive file: ' + name);
}

const addon = process.argv[2];
const definition = Object.hasOwn(expected, addon) ? expected[addon] : null;
assert.ok(definition, 'Unknown add-on (allowed: db-postgres, auth-better-auth, jobs-valkey)');
const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const original = join(repo, 'addons', addon);
const manifest = JSON.parse(readFileSync(join(original, 'package.json'), 'utf8'));
assert.equal(manifest.name, '@kit-fundador/' + addon);
assert.equal(manifest.private, true, 'Packaging test must never authorize npm publishing');
assert.equal(manifest.type, 'module');
assert.equal(manifest.packageManager, 'pnpm@11.25.0');
assert.equal(manifest.engines?.node, '>=24 <25');
assert.equal(manifest.main, './dist/index.js');
assert.equal(manifest.types, './dist/index.d.ts');
assert.equal(manifest.exports?.['.']?.types, manifest.types);
assert.equal(manifest.exports?.['.']?.default, manifest.main);
assert.deepEqual(manifest.files, definition.files, 'Packaged file allowlist changed');
if (addon === 'db-postgres') {
  assert.equal(manifest.exports?.['./schema']?.types, './dist/schema.d.ts');
  assert.equal(manifest.exports?.['./schema']?.default, './dist/schema.js');
}
assertNoLifecycleHooks(manifest.scripts);

const scratch = mkdtempSync(join(tmpdir(), 'lego-r1-contract-'));
try {
  const addonDir = join(scratch, 'addon');
  const consumerDir = join(scratch, 'consumer');
  cpSync(original, addonDir, { recursive: true });
  mkdirSync(consumerDir);
  assert.ok(!existsSync(join(scratch, 'package.json')), 'Consumer must be outside workspace');
  run('pnpm', ['install', '--frozen-lockfile', '--strict-peer-dependencies', '--ignore-scripts'], addonDir);
  run('pnpm', ['run', 'build'], addonDir);
  assert.ok(existsSync(join(addonDir, 'dist/index.js')));
  assert.ok(existsSync(join(addonDir, 'dist/index.d.ts')));
  run('pnpm', ['pack', '--pack-destination', scratch], addonDir);

  const archiveNames = readdirSync(scratch).filter(name => name.endsWith('.tgz'));
  assert.equal(archiveNames.length, 1, 'Expected exactly one local package tarball');
  const archive = join(scratch, archiveNames[0]);
  const entries = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split(/\r?\n/);
  requireEntry(entries, 'package/package.json');
  requireEntry(entries, 'package/dist/index.js');
  requireEntry(entries, 'package/dist/index.d.ts');
  requireEntry(entries, 'package/README.md');
  for (const path of definition.archiveFiles) requireEntry(entries, path);
  const unsafe = entries.filter(path => /(^|\/)(node_modules|\.git|\.env($|[./]))/.test(path));
  assert.deepEqual(unsafe, [], 'Tarball contains private environment or tool files');

  const consumer = {
    name: 'lego-external-consumer-test',
    private: true,
    version: '0.0.0',
    type: 'module',
    packageManager: 'pnpm@11.25.0',
    dependencies: {
      fastify: '5.12.7',
      [manifest.name]: 'file:../' + basename(archive),
    },
    devDependencies: { typescript: '5.9.3' },
  };
  writeFileSync(join(consumerDir, 'package.json'), JSON.stringify(consumer, null, 2) + '\n');
  writeFileSync(join(consumerDir, 'tsconfig.json'), JSON.stringify({
    compilerOptions: {
      target: 'ES2022',
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      strict: true,
      skipLibCheck: true,
      noEmit: true,
    },
    include: ['smoke.ts'],
  }, null, 2) + '\n');
  writeFileSync(join(consumerDir, 'smoke.ts'), definition.types.join('\n') + '\n');

  run('pnpm', ['install', '--strict-peer-dependencies', '--ignore-scripts'], consumerDir);
  run('pnpm', ['install', '--frozen-lockfile', '--strict-peer-dependencies', '--ignore-scripts'], consumerDir);
  run('pnpm', ['exec', 'tsc', '--noEmit', '-p', 'tsconfig.json'], consumerDir);
  const runtime = [
    "import assert from 'node:assert/strict';",
    'const api = await import(' + JSON.stringify(manifest.name) + ');',
    'assert.equal(typeof api[' + JSON.stringify(definition.entry) + "], 'function');",
    "console.log('LEGO_EXTERNAL_PACKAGE_IMPORT_PASS', " + JSON.stringify(addon) + ');',
  ].join('\n');
  run('node', ['--input-type=module', '--eval', runtime], consumerDir);
  console.log('LEGO_R1_PACKAGE_CONTRACT_PASS', addon, manifest.version);
} finally {
  rmSync(scratch, { recursive: true, force: true });
}
