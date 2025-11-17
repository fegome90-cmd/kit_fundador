/* eslint-disable no-console */
import path from 'path';
import { Client } from 'pg';
import { config as loadEnvConfig } from 'dotenv';

const ENV_PATH = path.resolve(process.cwd(), '.env');
loadEnvConfig({ path: ENV_PATH });

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
  const connectionDescriptor = describeConnection(connectionString);
  console.log(`[Kit Fundador] Conectando a la base de datos definida en ${connectionDescriptor} ...`);

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('[Kit Fundador] Conexión establecida. Ejecutando seeds base...');

    await seedReferenceUser(client);

    console.log('[Kit Fundador] Seed mínimo completado.');
  } finally {
    await client.end().catch((error: unknown) => {
      console.warn('No se pudo cerrar la conexión a la base de datos limpiamente:', error);
    });
  }
}

if (require.main === module) {
  runSeed().catch((error: unknown) => {
    console.error('Seed de ejemplo falló:', error);
    process.exit(1);
  });
}

export { runSeed };

function describeConnection(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    const maskedUser = url.username ? url.username : 'anonymous';
    const host = url.host || 'localhost:5432';
    return `${url.protocol}//${maskedUser}:****@${host}${url.pathname}`;
  } catch {
    return 'la base de datos configurada en DATABASE_URL';
  }
}
