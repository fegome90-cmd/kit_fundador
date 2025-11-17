/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

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
  if (fromEnv) {
    return fromEnv;
  }

  console.warn('[Kit Fundador] DATABASE_URL no está definido. Usando fallback local.');
  return FALLBACK_URL;
}

async function seedReferenceUser(client: Client): Promise<void> {
  await client.query(
    `INSERT INTO seed_users (email)
     VALUES ($1)
     ON CONFLICT (email) DO NOTHING`,
    ['founder@example.com']
  );
}

async function runSeed(): Promise<void> {
  const connectionString = resolveDatabaseUrl();
  console.log(`[Kit Fundador] Conectando a la base de datos definida en ${connectionString} ...`);

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('[Kit Fundador] Conexión establecida. Ejecutando seeds base...');

    await seedReferenceUser(client);

    console.log('[Kit Fundador] Seed mínimo completado.');
  } finally {
    await client.end().catch((error) => {
      console.warn('No se pudo cerrar la conexión a la base de datos limpiamente:', error);
    });
  }
}

if (require.main === module) {
  runSeed().catch((error) => {
    console.error('Seed de ejemplo falló:', error);
    process.exit(1);
  });
}

export { runSeed };
