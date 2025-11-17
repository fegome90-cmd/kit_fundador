/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

type Action = 'up' | 'down' | 'create';

type MigrationParts = {
  up: string;
  down: string | null;
};

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'db/migrations');
const HISTORY_TABLE = 'kit_migrations';

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

function ensureMigrationsDir(): void {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
}

function listMigrationFiles(): string[] {
  ensureMigrationsDir();
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

function readMigrationParts(filePath: string): MigrationParts {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parts = raw.split(/^--\s*down\s*$/im);
  const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';
  const down = parts[1] ? parts[1].trim() : null;

  return { up, down };
}

async function ensureHistoryTable(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${HISTORY_TABLE} (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function runMigrations(direction: Extract<Action, 'up' | 'down'>): Promise<void> {
  const connectionString = resolveDatabaseUrl();
  const client = new Client({ connectionString });

  await client.connect();
  try {
    await ensureHistoryTable(client);

    if (direction === 'up') {
      await migrateUp(client);
    } else {
      await migrateDown(client);
    }
  } finally {
    await client.end();
  }
}

async function migrateUp(client: Client): Promise<void> {
  const files = listMigrationFiles();
  const applied = await client.query<{ name: string }>(
    `SELECT name FROM ${HISTORY_TABLE} ORDER BY run_on ASC`
  );
  const appliedNames = new Set(applied.rows.map((row) => row.name));

  for (const file of files) {
    if (appliedNames.has(file)) {
      continue;
    }

    const filePath = path.join(MIGRATIONS_DIR, file);
    const { up } = readMigrationParts(filePath);
    if (!up) {
      console.log(`[migrate] ${file} no contiene bloque -- up. Se omite.`);
      continue;
    }

    console.log(`[migrate] Ejecutando ${file}`);
    await client.query(up);
    await client.query(`INSERT INTO ${HISTORY_TABLE} (name) VALUES ($1)`, [file]);
  }

  console.log('[migrate] Migraciones al día.');
}

async function migrateDown(client: Client): Promise<void> {
  const latest = await client.query<{ name: string }>(
    `SELECT name FROM ${HISTORY_TABLE} ORDER BY run_on DESC LIMIT 1`
  );
  if (latest.rowCount === 0) {
    console.log('[migrate] No hay migraciones para revertir.');
    return;
  }

  const file = latest.rows[0].name as string;
  const filePath = path.join(MIGRATIONS_DIR, file);
  if (!fs.existsSync(filePath)) {
    throw new Error(`No se encontró el archivo ${file} para revertir.`);
  }

  const { down } = readMigrationParts(filePath);
  if (!down) {
    throw new Error(`La migración ${file} no define bloque -- down.`);
  }

  console.log(`[migrate] Revirtiendo ${file}`);
  await client.query(down);
  await client.query(`DELETE FROM ${HISTORY_TABLE} WHERE name = $1`, [file]);
}

function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function createMigrationFile(rawName?: string): void {
  ensureMigrationsDir();
  const slug = toSlug(rawName ?? 'new_migration');
  const timestamp = new Date()
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 12);
  const fileName = `${timestamp}__${slug || 'migration'}.sql`;
  const target = path.join(MIGRATIONS_DIR, fileName);

  const template = `-- up\n-- down\n`;
  fs.writeFileSync(target, template, { encoding: 'utf8' });
  console.log(`[migrate] Archivo creado: ${target}`);
}

async function main(): Promise<void> {
  const rawArgs = process.argv.slice(2).filter((arg) => arg !== '--');
  const action = (rawArgs[0] as Action | undefined) ?? 'up';

  if (action === 'create') {
    createMigrationFile(rawArgs[1]);
    return;
  }

  if (action !== 'up' && action !== 'down') {
    throw new Error(`Acción no soportada: ${action}`);
  }

  await runMigrations(action);
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error('[migrate] Error:', error);
    process.exit(1);
  });
}
