import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { openAPI } from 'better-auth/plugins';
import * as schema from './auth-schema.js';
export const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 1500 });
export const db = drizzle(pool, { schema });
export const auth = betterAuth({
  baseURL: process.env.AUTH_URL ?? 'http://127.0.0.1:4310',
  secret: process.env.LAB_AUTH_SECRET ?? 'isolated-lab-only-secret-000000000000000000000000000000',
  trustedOrigins: ['http://127.0.0.1:4310','http://localhost:3000'],
  database: drizzleAdapter(db, { provider: 'pg', schema }),
  emailAndPassword: { enabled: true },
  user: { additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } } },
  advanced: { useSecureCookies: process.env.AUTH_URL?.startsWith('https://') ?? false },
  plugins: [openAPI()],
});
