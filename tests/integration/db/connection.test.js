"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const pg_1 = require("pg");
const dotenv_1 = require("dotenv");
const ENV_PATH = path_1.default.resolve(process.cwd(), '.env');
(0, dotenv_1.config)({ path: ENV_PATH });
const npmLifecycleEvent = process.env.npm_lifecycle_event ?? '';
const runFlag = (process.env.RUN_DB_TESTS ?? '').toLowerCase();
const runFlagEnabled = ['1', 'true', 'yes', 'on'].includes(runFlag);
const triggeredByDbScript = npmLifecycleEvent === 'test:integration:db';
const isCI = process.env.CI === 'true';
const shouldRunDbTests = !isCI && (runFlagEnabled || triggeredByDbScript);
const describeDb = shouldRunDbTests ? describe : describe.skip;
if (!shouldRunDbTests) {
    console.warn('[Kit Fundador] Saltando tests de integración contra PostgreSQL. Ejecuta `RUN_DB_TESTS=true npm run test:integration:db` ' +
        'luego de `make db:up` y `npm run migrate:up` para habilitarlos localmente.');
}
const DEFAULT_DB_USER = process.env.DB_USER ?? 'dev';
const DEFAULT_DB_PASSWORD = process.env.DB_PASSWORD ?? 'devpass';
const DEFAULT_DB_NAME = process.env.DB_NAME ?? 'myapp_dev';
const FALLBACK_URL = `postgresql://${DEFAULT_DB_USER}:${DEFAULT_DB_PASSWORD}@localhost:5432/${DEFAULT_DB_NAME}`;
function resolveDatabaseUrl() {
    const fromEnv = process.env.DATABASE_URL?.trim();
    return fromEnv && fromEnv.length > 0 ? fromEnv : FALLBACK_URL;
}
describeDb('database bootstrap', () => {
    let client;
    beforeAll(async () => {
        client = new pg_1.Client({ connectionString: resolveDatabaseUrl() });
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
        const migrations = await client.query("SELECT COUNT(*)::int AS count FROM kit_migrations WHERE name = '000000000000__bootstrap.sql'");
        expect(migrations.rows[0].count).toBeGreaterThan(0);
        const tableExists = await client.query("SELECT to_regclass('public.seed_users') AS exists");
        expect(tableExists.rows[0].exists).toBe('seed_users');
    });
});
//# sourceMappingURL=connection.test.js.map