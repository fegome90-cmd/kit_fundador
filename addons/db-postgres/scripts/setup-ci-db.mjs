import { Pool } from 'pg';

const adminUrl = process.env.MIGRATION_DATABASE_URL;
const password = process.env.APP_DB_TEST_PASSWORD;
if (!adminUrl || !password || !/^[A-Za-z0-9-]{12,80}$/.test(password)) {
  throw new Error('Ephemeral database setup credentials are required');
}
const pool = new Pool({ connectionString: adminUrl, connectionTimeoutMillis: 2000 });
try {
  // Fixed role and ephemeral CI-only password. The role is not a migration owner.
  await pool.query(`CREATE ROLE lego_app_ci LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
  await pool.query('GRANT CONNECT ON DATABASE lego_test TO lego_app_ci');
  await pool.query('GRANT USAGE ON SCHEMA lego_app TO lego_app_ci');
  await pool.query('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA lego_app TO lego_app_ci');
  await pool.query('CREATE TABLE public.privileged_ci (id integer PRIMARY KEY)');
  const journal = await pool.query('SELECT COUNT(*)::integer AS count FROM drizzle.__drizzle_migrations');
  if (journal.rows[0].count !== 1) throw new Error('Migration journal is not idempotent');
  const table = await pool.query(
    "SELECT COUNT(*)::integer AS count FROM pg_tables WHERE schemaname = 'lego_app' AND tablename = 'notes'"
  );
  if (table.rows[0].count !== 1) throw new Error('Expected Drizzle app table is missing');
  console.log('LEGO_PG_MIGRATIONS_APPLIED_ONCE', JSON.stringify({ historyRows: journal.rows[0].count, appTables: table.rows[0].count }));
} finally {
  await pool.end();
}
