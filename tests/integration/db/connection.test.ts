import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

type DbClient = Client;

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const contents = fs.readFileSync(filePath, 'utf8');
  contents
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .forEach((line) => {
      const [key, ...rest] = line.split('=');
      if (!key) {
        return;
      }

      const value = rest.join('=').trim().replace(/^['"]|['"]$/g, '');
      if (!process.env[key]) {
        process.env[key] = value;
      }
    });
}

loadEnvFile(path.resolve(process.cwd(), '.env'));

const DEFAULT_DB_USER = process.env.DB_USER ?? 'dev';
const DEFAULT_DB_PASSWORD = process.env.DB_PASSWORD ?? 'devpass';
const DEFAULT_DB_NAME = process.env.DB_NAME ?? 'myapp_dev';
const FALLBACK_URL = `postgresql://${DEFAULT_DB_USER}:${DEFAULT_DB_PASSWORD}@localhost:5432/${DEFAULT_DB_NAME}`;

function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : FALLBACK_URL;
}

describe('database bootstrap', () => {
  let client: DbClient;

  beforeAll(async () => {
    client = new Client({ connectionString: resolveDatabaseUrl() });
    await client.connect();
  });

  afterAll(async () => {
    if (client) {
      await client.end();
    }
  });

  it('establishes a connection using DATABASE_URL', async () => {
    const result = await client.query('select 1 as ok');
    expect(result.rows[0].ok).toBe(1);
  });

  it('detects the bootstrap migration entry', async () => {
    const migrations = await client.query(
      "SELECT COUNT(*)::int AS count FROM kit_migrations WHERE name = '000000000000__bootstrap.sql'"
    );

    expect(migrations.rows[0].count).toBeGreaterThan(0);

    const tableExists = await client.query("SELECT to_regclass('public.seed_users') AS exists");
    expect(tableExists.rows[0].exists).toBe('seed_users');
  });
});
