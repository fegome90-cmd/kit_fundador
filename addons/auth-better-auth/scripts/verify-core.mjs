import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createAuthPlugin } from '../dist/index.js';

const appPath = process.argv[2];
if (!appPath) throw new Error('Compiled Fastify Core path is required');
const { buildApp } = await import(pathToFileURL(resolve(appPath)).href);

const core = buildApp();
try {
  await core.ready();
  assert.equal((await core.inject('/health')).statusCode, 200);
  assert.equal((await core.inject('/api/auth/get-session')).statusCode, 404);
} finally { await core.close(); }

const composed = buildApp({
  beforeRoutes(app) {
    app.register(createAuthPlugin({
      databaseUrl: process.env.AUTH_APP_DATABASE_URL ?? '',
      baseURL: 'http://127.0.0.1:4310',
      secret: process.env.AUTH_TEST_SECRET ?? '',
      registerRoutes(scope, { getPrincipal }) {
        scope.get('/session-probe', async (request, reply) => {
          const principal = await getPrincipal(request);
          return principal ? { id: principal.id } : reply.code(401).send({ error: 'Unauthorized' });
        });
      },
    }));
  },
});
try {
  await composed.ready();
  assert.equal((await composed.inject('/health')).statusCode, 200);
  assert.equal((await composed.inject('/session-probe')).statusCode, 401);
  assert.equal((await composed.inject('/api/auth/get-session')).statusCode, 200);
} finally { await composed.close(); }
console.log('LEGO_AUTH_CORE_OPT_IN_PASS');
