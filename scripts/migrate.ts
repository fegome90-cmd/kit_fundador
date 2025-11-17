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

/**
 * Loads environment variables from a file into process.env without overwriting existing values.
 *
 * Reads lines of the given file, ignores empty lines and lines starting with `#`, parses `KEY=VALUE`
 * pairs (allowing `=` in the value), strips surrounding single or double quotes from values, and sets
 * each `process.env[KEY]` only if it is not already defined.
 *
 * @param filePath - Path to the environment file to read (e.g., `.env`)
 */
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

/**
 * Selects the PostgreSQL connection URL to use.
 *
 * @returns The `DATABASE_URL` environment variable value if it is set and not empty, otherwise the configured fallback URL.
 */
function resolveDatabaseUrl(): string {
  const fromEnv = process.env.DATABASE_URL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : FALLBACK_URL;
}

/**
 * Ensure the migrations directory exists by creating MIGRATIONS_DIR (recursively) if it does not already exist.
 */
function ensureMigrationsDir(): void {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
  }
}

/**
 * Get a sorted list of migration filenames located in the migrations directory.
 *
 * @returns A sorted array of filenames from the migrations directory that end with `.sql`
 */
function listMigrationFiles(): string[] {
  ensureMigrationsDir();
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort();
}

/**
 * Parse a SQL migration file into its `up` and `down` sections.
 *
 * Reads the file at `filePath` and splits its contents at a line containing only `-- down` (case-insensitive). The content before the split is treated as the `up` block (with a leading `-- up` marker removed if present); the content after the split is treated as the `down` block.
 *
 * @param filePath - Path to the migration `.sql` file
 * @returns An object with `up` containing the SQL to apply the migration and `down` containing the SQL to revert it, or `null` if no down block is present
 */
function readMigrationParts(filePath: string): MigrationParts {
  const raw = fs.readFileSync(filePath, 'utf8');
  const parts = raw.split(/^--\s*down\s*$/im);
  const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';
  const down = parts[1] ? parts[1].trim() : null;

  return { up, down };
}

/**
 * Ensure the migrations history table exists with columns `id` (serial primary key), `name` (text, unique), and `run_on` (timestamp with time zone, default now()).
 */
async function ensureHistoryTable(client: Client): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS ${HISTORY_TABLE} (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

/**
 * Run migrations in the specified direction against the configured database.
 *
 * Connects to the database, ensures the migrations history table exists, executes
 * either pending "up" migrations or reverts the most recent migration for "down",
 * and always closes the database connection.
 *
 * @param direction - 'up' to apply pending migrations; 'down' to revert the latest migration
 */
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

/**
 * Applies all unapplied "up" migration SQL blocks from the migrations directory and records them in the migrations history table.
 *
 * Reads the list of migration files, queries the history table for already-applied names, and for each file not yet applied executes its `-- up` SQL block and inserts the filename into the history table. Files without an `-- up` block are skipped (a message is logged). Database query errors propagate to the caller.
 */
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

/**
 * Reverts the most recently applied migration recorded in the history table.
 *
 * Executes the migration's `-- down` SQL block for the latest entry in the history table and removes its record from that table. If there are no applied migrations the function returns without action.
 *
 * @throws If the migration file referenced by the latest history entry does not exist.
 * @throws If the migration file does not define a `-- down` block.
 */
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

/**
 * Create a lowercase, underscore-separated slug from a string suitable for filenames.
 *
 * @param name - The input string to convert into a slug
 * @returns A lowercase ASCII string containing only letters, digits, and underscores with no leading or trailing underscores
 */
function toSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/**
 * Creates a new SQL migration file with empty `-- up` and `-- down` sections in the migrations directory.
 *
 * The filename is prefixed with a 12-digit timestamp and an underscored slug: `<timestamp>__<slug>.sql` (timestamp format derived from ISO string digits). The file is written into MIGRATIONS_DIR and contains a template with `-- up` and `-- down` markers.
 *
 * @param rawName - Optional human-readable name used to generate the file slug; defaults to `"new_migration"` when omitted
 */
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

/**
 * Parse command-line arguments and perform the requested migration action.
 *
 * Supports three actions: "create" to generate a new migration file (takes an optional name),
 * "up" to apply pending migrations, and "down" to revert the most recently applied migration.
 * Ignores standalone `--` arguments when parsing.
 *
 * @throws Error - If the provided action is not "up", "down", or "create"
 */
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