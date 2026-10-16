import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { createPostgresPlugin } from '../dist/index.js';
import { notes } from '../dist/schema.js';

const coreAppPath = process.argv[2];
const databaseUrl = process.env.APP_DATABASE_URL;
if (!coreAppPath || !databaseUrl) throw new Error('Compiled Core path and ephemeral APP_DATABASE_URL are required');
const { buildApp } = await import(pathToFileURL(resolve(coreAppPath)).href);

// The code from an untouched Fastify Core template remains functional without PG.
const bare = buildApp();
try {
  await bare.ready();
  assert.equal((await bare.inject('/health')).statusCode, 200);
  assert.equal((await bare.inject('/example-db')).statusCode, 404);
} finally {
  await bare.close();
}

// Optional composition via the existing documented beforeRoutes hook.
const app = buildApp({
  beforeRoutes(core) {
    core.register(createPostgresPlugin({
      databaseUrl,
      registerRoutes(scope, db) {
        scope.get('/example-db', async () => db.select().from(notes));
      },
    }));
  },
});
try {
  await app.ready();
  assert.equal((await app.inject('/health')).statusCode, 200);
  const response = await app.inject('/example-db');
  assert.equal(response.statusCode, 200);
  assert.ok(Array.isArray(response.json()));
} finally {
  await app.close();
}
console.log('LEGO_PG_CORE_COMPOSITION_PASS');
