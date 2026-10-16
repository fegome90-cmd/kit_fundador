import { defineConfig } from 'drizzle-kit';

// generate/check do not require credentials. migrate always requires a separate
// privileged MIGRATION_DATABASE_URL, provided explicitly at deploy time.
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schema.ts',
  out: './drizzle',
  migrations: { schema: 'drizzle', table: '__drizzle_migrations' },
  ...(process.env.MIGRATION_DATABASE_URL
    ? { dbCredentials: { url: process.env.MIGRATION_DATABASE_URL } }
    : {}),
});
