import { defineConfig } from 'drizzle-kit';

// Separate migration owner/journal from LEGO app tables.
// Never create or migrate auth tables during HTTP request handling/startup.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/auth-schema.ts',
  out: './drizzle',
  migrations: { schema: 'auth_meta', table: '__drizzle_migrations' },
  ...(process.env.AUTH_MIGRATION_DATABASE_URL
    ? { dbCredentials: { url: process.env.AUTH_MIGRATION_DATABASE_URL } }
    : {}),
});
