"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-console */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const MIGRATIONS_DIR = path_1.default.resolve(process.cwd(), 'db/migrations');
const HISTORY_TABLE = 'kit_migrations';
/**
 * Load key/value pairs from a .env-style file into process.env if the file exists.
 *
 * Lines beginning with `#` or empty lines are ignored. Each non-comment line is
 * split on the first `=` into a key and value; surrounding single or double quotes
 * around the value are removed. Existing environment variables are not overwritten.
 *
 * @param filePath - Path to the .env-style file to read
 */
function loadEnvFile(filePath) {
    if (!fs_1.default.existsSync(filePath)) {
        return;
    }
    const contents = fs_1.default.readFileSync(filePath, 'utf8');
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
loadEnvFile(path_1.default.resolve(process.cwd(), '.env'));
const DEFAULT_DB_USER = process.env.DB_USER ?? 'dev';
const DEFAULT_DB_PASSWORD = process.env.DB_PASSWORD ?? 'devpass';
const DEFAULT_DB_NAME = process.env.DB_NAME ?? 'myapp_dev';
const FALLBACK_URL = `postgresql://${DEFAULT_DB_USER}:${DEFAULT_DB_PASSWORD}@localhost:5432/${DEFAULT_DB_NAME}`;
/**
 * Selects the database connection URL to use for migrations.
 *
 * @returns The value of the `DATABASE_URL` environment variable if it is set and non-empty, otherwise the fallback PostgreSQL URL constructed from default credentials.
 */
function resolveDatabaseUrl() {
    const fromEnv = process.env.DATABASE_URL?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : FALLBACK_URL;
}
/**
 * Ensures the migrations directory exists on disk, creating it (recursively) if it does not.
 */
function ensureMigrationsDir() {
    if (!fs_1.default.existsSync(MIGRATIONS_DIR)) {
        fs_1.default.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }
}
/**
 * List SQL migration filenames found in the migrations directory in sorted order.
 *
 * @returns An array of `.sql` filenames (basename only) sorted lexicographically
 */
function listMigrationFiles() {
    ensureMigrationsDir();
    return fs_1.default
        .readdirSync(MIGRATIONS_DIR)
        .filter((file) => file.endsWith('.sql'))
        .sort();
}
/**
 * Parse a SQL migration file into its "up" and optional "down" sections.
 *
 * Splits the file at a line containing only `-- down` (case-insensitive). If present, a leading `-- up` marker is removed from the up section.
 * @param {string} filePath - Path to the migration `.sql` file.
 * @returns {{ up: string, down: string | null }} An object where `up` is the SQL to apply the migration and `down` is the SQL to revert it, or `null` when no down section is present.
 */
function readMigrationParts(filePath) {
    const raw = fs_1.default.readFileSync(filePath, 'utf8');
    const parts = raw.split(/^--\s*down\s*$/im);
    const up = parts[0]?.replace(/^--\s*up\s*$/i, '').trim() ?? '';
    const down = parts[1] ? parts[1].trim() : null;
    return { up, down };
}
/**
 * Create the migrations history table if it does not already exist.
 *
 * The table created is named `kit_migrations` and has the following columns:
 * - `id`: serial primary key
 * - `name`: text, unique identifier for the migration (not null)
 * - `run_on`: timestamptz, defaults to the current time
 */
async function ensureHistoryTable(client) {
    await client.query(`
    CREATE TABLE IF NOT EXISTS ${HISTORY_TABLE} (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      run_on TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}
/**
 * Connects to the database, ensures the migration history table exists, and runs migrations.
 *
 * @param direction - 'up' to apply pending migrations; 'down' to revert the most recently applied migration
 */
async function runMigrations(direction) {
    const connectionString = resolveDatabaseUrl();
    const client = new pg_1.Client({ connectionString });
    await client.connect();
    try {
        await ensureHistoryTable(client);
        if (direction === 'up') {
            await migrateUp(client);
        }
        else {
            await migrateDown(client);
        }
    }
    finally {
        await client.end();
    }
}
/**
 * Apply all pending "up" migrations from the migrations directory and record each applied file in the migrations history table.
 *
 * For each migration file not already recorded, executes its `-- up` SQL block and inserts the filename into the history table. Files that lack an `-- up` block are skipped and not recorded.
 */
async function migrateUp(client) {
    const files = listMigrationFiles();
    const applied = await client.query(`SELECT name FROM ${HISTORY_TABLE} ORDER BY run_on ASC`);
    const appliedNames = new Set(applied.rows.map((row) => row.name));
    for (const file of files) {
        if (appliedNames.has(file)) {
            continue;
        }
        const filePath = path_1.default.join(MIGRATIONS_DIR, file);
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
 * Reverts the most recently applied migration by executing its `-- down` SQL and removing its record from the migrations history.
 *
 * @param {import('pg').Client} client - Connected PostgreSQL client used to execute the down SQL and update the migrations history table.
 * @throws {Error} If the migration file for the latest applied migration is missing.
 * @throws {Error} If the latest migration file does not contain a `-- down` block.
 */
async function migrateDown(client) {
    const latest = await client.query(`SELECT name FROM ${HISTORY_TABLE} ORDER BY run_on DESC LIMIT 1`);
    if (latest.rowCount === 0) {
        console.log('[migrate] No hay migraciones para revertir.');
        return;
    }
    const file = latest.rows[0].name;
    const filePath = path_1.default.join(MIGRATIONS_DIR, file);
    if (!fs_1.default.existsSync(filePath)) {
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
 * Produce a filename-safe slug from a string.
 *
 * @param {string} name - Input string to convert.
 * @returns {string} The slug: lowercased, runs of non-alphanumeric characters replaced by single underscores, with no leading or trailing underscores.
 */
function toSlug(name) {
    return name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
}
/**
 * Create a timestamped SQL migration file containing `-- up` and `-- down` sections in the migrations directory.
 * @param {string} [rawName] - Optional human-readable name for the migration; used to generate the slug. Defaults to `new_migration` when omitted.
 */
function createMigrationFile(rawName) {
    ensureMigrationsDir();
    const slug = toSlug(rawName ?? 'new_migration');
    const timestamp = new Date()
        .toISOString()
        .replace(/[-:TZ.]/g, '')
        .slice(0, 12);
    const fileName = `${timestamp}__${slug || 'migration'}.sql`;
    const target = path_1.default.join(MIGRATIONS_DIR, fileName);
    const template = `-- up\n-- down\n`;
    fs_1.default.writeFileSync(target, template, { encoding: 'utf8' });
    console.log(`[migrate] Archivo creado: ${target}`);
}
/**
 * Parse CLI arguments and execute the requested migration command.
 *
 * Supported actions:
 * - `create <name>`: create a new timestamped migration file and exit.
 * - `up`: apply all pending migrations.
 * - `down`: revert the most recently applied migration.
 *
 * @throws {Error} If the action is not one of `create`, `up`, or `down`.
 */
async function main() {
    const rawArgs = process.argv.slice(2).filter((arg) => arg !== '--');
    const action = rawArgs[0] ?? 'up';
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
    main().catch((error) => {
        console.error('[migrate] Error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=migrate.js.map