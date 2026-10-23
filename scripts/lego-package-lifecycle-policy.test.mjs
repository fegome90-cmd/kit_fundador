import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertNoLifecycleHooks } from './lego-package-lifecycle-policy.mjs';

const forbidden = [
  'preinstall', 'install', 'postinstall',
  'preuninstall', 'uninstall', 'postuninstall',
  'prepare', 'prepack', 'postpack',
  'prepublishOnly', 'prepublish', 'publish', 'postpublish',
];

test('rejects every npm install, pack, publish and uninstall lifecycle hook', () => {
  for (const name of forbidden) {
    assert.throws(
      () => assertNoLifecycleHooks({ [name]: 'node lifecycle.js' }),
      { name: 'AssertionError', message: 'Lifecycle side effect forbidden: ' + name },
      name + ' must not execute',
    );
  }
});

test('accepts normal scripts even when names share lifecycle prefixes', () => {
  const legitimate = [
    'build', 'test', 'typecheck', 'db:migrate', 'prepare:docs',
    'publish-check', 'installer-check', 'postpublished', 'prepublication',
  ];
  for (const name of legitimate) {
    assert.doesNotThrow(() => assertNoLifecycleHooks({ [name]: 'echo safe' }), name);
  }
  assert.doesNotThrow(() => assertNoLifecycleHooks(undefined));
  assert.doesNotThrow(() => assertNoLifecycleHooks({}));
});

test('accepts all three actual private LEGO package script manifests', () => {
  for (const addon of ['auth-better-auth', 'db-postgres', 'jobs-valkey']) {
    const file = new URL('../addons/' + addon + '/package.json', import.meta.url);
    const manifest = JSON.parse(readFileSync(file, 'utf8'));
    assert.equal(manifest.private, true);
    assert.doesNotThrow(() => assertNoLifecycleHooks(manifest.scripts), addon);
  }
});

test('the package consumer verifier invokes the shared lifecycle guard', () => {
  const file = new URL('./verify-lego-package-consumer.mjs', import.meta.url);
  const verifier = readFileSync(file, 'utf8');
  assert.match(verifier, /assertNoLifecycleHooks\(manifest\.scripts\)/);
});
