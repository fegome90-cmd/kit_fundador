import { Pool } from 'pg';

const migrate = process.env.AUTH_MIGRATION_DATABASE_URL;
const password = process.env.AUTH_ROLE_TEST_PASSWORD;
if (!migrate || !password || !/^[a-zA-Z0-9-]{12,72}$/.test(password)) {
  throw new Error('Ephemeral migration and role credentials required');
}
const pool = new Pool({ connectionString: migrate, connectionTimeoutMillis: 2000 });
try {
  await pool.query(`CREATE ROLE lego_auth_ci LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
  await pool.query('GRANT CONNECT ON DATABASE lego_auth_ci TO lego_auth_ci');
  await pool.query('GRANT USAGE ON SCHEMA auth TO lego_auth_ci');
  await pool.query('GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA auth TO lego_auth_ci');
  const a = await pool.query('SELECT COUNT(*)::integer AS n FROM auth_meta.__drizzle_migrations');
  const b = await pool.query('SELECT COUNT(*)::integer AS n FROM drizzle.__drizzle_migrations');
  if (a.rows[0].n !== 1 || b.rows[0].n !== 1) throw new Error('Migration journals must have one entry each');
  const tables = await pool.query(
    "SELECT tablename FROM pg_tables WHERE schemaname='auth' ORDER BY tablename"
  );
  const names = tables.rows.map(row => row.tablename);
  if (JSON.stringify(names)!==JSON.stringify(['account','session','user','verification'])) {
    throw new Error('Unexpected auth schema contents');
  }
  console.log('LEGO_AUTH_MIGRATIONS_ISOLATED', JSON.stringify({ authHistory: 1, appHistory: 1, tables: names }));
} finally {
  await pool.end();
}
