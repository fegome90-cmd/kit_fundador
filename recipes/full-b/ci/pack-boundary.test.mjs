import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertNoLifecycleHooks } from '../../../scripts/lego-package-lifecycle-policy.mjs';

test('R2 disallows malicious prepack/prepublish hooks using the existing R1 guard', () => {
  for (const name of ['prepack','postpack','prepare','install','prepublishOnly','postpublish']) {
    assert.throws(() => assertNoLifecycleHooks({[name]:'node unexpected-script.mjs'}),
      {name:'AssertionError',message:'Lifecycle side effect forbidden: '+name});
  }
});
test('R2 existing private manifests satisfy lifecycle hook policy', () => {
  for(const name of ['db-postgres','auth-better-auth','jobs-valkey']) {
    const manifest=JSON.parse(readFileSync(new URL('../../../addons/'+name+'/package.json',import.meta.url),'utf8'));
    assert.equal(manifest.private,true);
    assert.doesNotThrow(()=>assertNoLifecycleHooks(manifest.scripts));
  }
});
test('R2 checks every isolated addon manifest before any install/build or pack', () => {
  const runner=readFileSync(new URL('./run.mjs',import.meta.url),'utf8');
  const guard=runner.indexOf("assertNoLifecycleHooks(json(join(dir, 'package.json')).scripts)");
  const install=runner.indexOf("run(dir, 'pnpm', ['install'");
  const pack=runner.indexOf("run(dir, 'pnpm', ['pack'");
  assert.ok(guard>=0,'R2 runner must explicitly enforce R1 lifecycle policy');
  assert.ok(install>=0 && pack>=0,'Expected real addon install and pack steps');
  assert.ok(guard<install && guard<pack,'Lifecycle guard must run before executing package scripts');
});
test('R2 workflow tracks changes to the shared R1 lifecycle guard',()=>{
  const workflow=readFileSync(new URL('../../../.github/workflows/lego-full-b.yml',import.meta.url),'utf8');
  assert.match(workflow,/scripts\/lego-package-lifecycle-policy\.mjs/);
});
