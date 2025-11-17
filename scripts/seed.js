"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = void 0;
/* eslint-disable no-console */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
/**
 * Loads environment variables from the specified .env file into process.env.
 *
 * Reads the file as UTF-8 and parses each non-empty, non-comment line. Lines are split at the first `=` into a key and value; surrounding single or double quotes are removed from the value. Existing environment variables are preserved and will not be overwritten. If the file does not exist, the function returns without modifying environment variables.
 *
 * @param filePath - Path to the .env file to load
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
 * Selects the PostgreSQL connection URL to use for the application.
 *
 * If the `DATABASE_URL` environment variable is present and non-empty, that value is returned; otherwise a local fallback URL is returned and a warning is logged.
 *
 * @returns The chosen database connection URL.
 */
function resolveDatabaseUrl() {
    const fromEnv = process.env.DATABASE_URL?.trim();
    if (fromEnv) {
        return fromEnv;
    }
    console.warn('[Kit Fundador] DATABASE_URL no está definido. Usando fallback local.');
    return FALLBACK_URL;
}
/**
 * Ensures a reference user with email "founder@example.com" exists in the `seed_users` table.
 *
 * If a row with that email already exists, the operation makes no changes.
 */
async function seedReferenceUser(client) {
    await client.query(`INSERT INTO seed_users (email)
     VALUES ($1)
     ON CONFLICT (email) DO NOTHING`, ['founder@example.com']);
}
/**
 * Connects to the configured database, performs the minimal seed operations, and closes the connection.
 *
 * Determines the database connection URL from the environment (or a fallback), logs the target
 * database name without exposing credentials, runs required seed inserts, and ensures the
 * database client is closed; if closing fails, a warning is logged.
 */
async function runSeed() {
    const connectionString = resolveDatabaseUrl();
    // Avoid logging sensitive credentials
    const dbName = process.env.DB_NAME ?? 'myapp_dev';
    console.log(`[Kit Fundador] Conectando a la base de datos "${dbName}" ...`);
    const client = new pg_1.Client({ connectionString });
    try {
        await client.connect();
        console.log('[Kit Fundador] Conexión establecida. Ejecutando seeds base...');
        await seedReferenceUser(client);
        console.log('[Kit Fundador] Seed mínimo completado.');
    }
    finally {
        await client.end().catch((error) => {
            console.warn('No se pudo cerrar la conexión a la base de datos limpiamente:', error);
        });
    }
}
exports.runSeed = runSeed;
if (require.main === module) {
    runSeed().catch((error) => {
        console.error('Seed de ejemplo falló:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map