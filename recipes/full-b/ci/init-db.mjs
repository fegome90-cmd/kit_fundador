import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';

const url = process.env.PG_ADMIN_URL;
const passwordApp = process.env.FULLB_APP_PASSWORD;
const passwordAuth = process.env.FULLB_AUTH_PASSWORD;
for (const password of [passwordApp, passwordAuth]) {
  assert.match(password ?? '', /^[a-zA-Z0-9-]{14,72}$/, 'CI synthetic password required');
}
assert.ok(url?.startsWith('postgresql://'), 'Synthetic admin connection required');
const db = new Pool({ connectionString: url, application_name: 'lego_fullb_migrator' });
try {
  for (const [role, password] of [['lego_fullb_app', passwordApp], ['lego_fullb_auth', passwordAuth]]) {
    const existing = await db.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [role]);
    if (existing.rowCount === 0) {
      // Fixed identifiers and validated synthetic password; no user input.
      await db.query("CREATE ROLE " + role + " LOGIN PASSWORD '" + password + "' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION");
    }
    await db.query('GRANT CONNECT ON DATABASE lego_fullb_ci TO ' + role);
  }
  const migration = readFileSync(new URL('../migrations/0001_fullb.sql', import.meta.url), 'utf8');
  await db.query(migration);
  await db.query(migration);
  await db.query('GRANT USAGE ON SCHEMA lego_app TO lego_fullb_app');
  await db.query('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA lego_app TO lego_fullb_app');
  await db.query('GRANT USAGE ON SCHEMA auth TO lego_fullb_auth');
  await db.query('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO lego_fullb_auth');

  const history = await db.query(
    'SELECT (SELECT COUNT(*)::integer FROM drizzle.__drizzle_migrations) AS app, ' +
    '(SELECT COUNT(*)::integer FROM auth_meta.__drizzle_migrations) AS auth'
  );
  assert.equal(history.rows[0].app, 1);
  assert.equal(history.rows[0].auth, 1);
  const tables = await db.query("SELECT tablename FROM pg_tables WHERE schemaname = 'lego_app' ORDER BY tablename");
  assert.deepEqual(tables.rows.map(x => x.tablename), ['fullb_jobs', 'fullb_notes', 'notes']);
  console.log('LEGO_R2_MIGRATIONS_REPEATABLE_PASS');
} finally {
  await db.end();
}
