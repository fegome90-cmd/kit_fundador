import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertFullBLaboratoryEndpoints } from './lab-safety.mjs';

const good = Object.freeze({
  GITHUB_ACTIONS: 'true',
  PG_ADMIN_URL: 'postgresql://postgres:synthetic@127.0.0.1:5432/lego_fullb_ci',
  MIGRATION_DATABASE_URL: 'postgresql://postgres:synthetic@127.0.0.1:5432/lego_fullb_ci',
  AUTH_MIGRATION_DATABASE_URL: 'postgresql://postgres:synthetic@127.0.0.1:5432/lego_fullb_ci',
  FULLB_DB_URL: 'postgresql://lego_fullb_app:synthetic@127.0.0.1:5432/lego_fullb_ci',
  FULLB_AUTH_URL: 'postgresql://lego_fullb_auth:synthetic@127.0.0.1:5432/lego_fullb_ci',
  VALKEY_URL: 'redis://127.0.0.1:6379',
});
test('R2 accepts only its precisely scoped synthetic CI services', () => {
  assert.doesNotThrow(() => assertFullBLaboratoryEndpoints(good));
});
test('R2 refuses attempts to run migration harness outside CI', () => {
  assert.throws(() => assertFullBLaboratoryEndpoints({...good,GITHUB_ACTIONS:'false'}), /Full B laboratory/);
});
test('R2 refuses any non-synthetic or remote database before migrations', () => {
  for (const [name,value] of [
    ['PG_ADMIN_URL','postgresql://postgres:synthetic@db.example:5432/lego_fullb_ci'],
    ['MIGRATION_DATABASE_URL','postgresql://postgres:synthetic@127.0.0.1:5432/prod'],
    ['AUTH_MIGRATION_DATABASE_URL','postgresql://postgres:synthetic@127.0.0.1:5433/lego_fullb_ci'],
    ['FULLB_DB_URL','postgresql://postgres:synthetic@127.0.0.1:5432/lego_fullb_ci'],
    ['FULLB_AUTH_URL','postgresql://lego_fullb_auth:synthetic@localhost:5432/lego_fullb_ci'],
  ]) {
    assert.throws(()=>assertFullBLaboratoryEndpoints({...good,[name]:value}), /Full B laboratory/,
      'Unexpectedly accepted ' + name);
  }
});
test('R2 refuses remote, alternate port or authenticated Valkey endpoints', () => {
  for(const value of [
    'redis://valkey.example:6379',
    'rediss://127.0.0.1:6379',
    'redis://127.0.0.1:6380',
    'redis://operator:password@127.0.0.1:6379',
  ]) {
    assert.throws(()=>assertFullBLaboratoryEndpoints({...good,VALKEY_URL:value}), /Full B laboratory/);
  }
});
test('both executable migration entrypoints invoke the shared lab guard', () => {
  for(const file of ['run.mjs','init-db.mjs']) {
    const content=readFileSync(new URL('./'+file,import.meta.url),'utf8');
    assert.match(content,/assertFullBLaboratoryEndpoints\(process\.env\)/,file);
  }
});
