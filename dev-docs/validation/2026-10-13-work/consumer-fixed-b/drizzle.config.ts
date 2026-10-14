import { defineConfig } from 'drizzle-kit';
export default defineConfig({ dialect: 'postgresql', schema: './src/auth-schema.ts', out: './drizzle', dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://lab@127.0.0.1:55432/legolab' } });
