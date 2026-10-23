import assert from 'node:assert/strict';

// Exact npm lifecycle hook keys, not arbitrary script names sharing a prefix.
// pnpm pack may invoke pack/publish lifecycle hooks; scripts are forbidden
// even when CI normally uses --ignore-scripts during dependency installation.
const forbidden = new Set([
  'preinstall', 'install', 'postinstall',
  'preuninstall', 'uninstall', 'postuninstall',
  'prepare', 'prepack', 'postpack',
  'prepublishOnly', 'prepublish', 'publish', 'postpublish',
]);

export function assertNoLifecycleHooks(scripts) {
  for (const name of Object.keys(scripts ?? {})) {
    assert.ok(!forbidden.has(name), 'Lifecycle side effect forbidden: ' + name);
  }
}
