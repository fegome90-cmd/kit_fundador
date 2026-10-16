import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { notes } from '../dist/schema.js';
import { createPostgresPlugin } from '../dist/index.js';

const appUrl = process.env.APP_DATABASE_URL;
const migrateUrl = process.env.MIGRATION_DATABASE_URL;
if (!appUrl || !migrateUrl) {
  throw new Error('PostgreSQL integration tests require ephemeral CI APP_DATABASE_URL and MIGRATION_DATABASE_URL');
}

test('core Fastify works without registering PostgreSQL or providing credentials', async () => {
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ ok: true }));
  try {
    await app.ready();
    assert.equal((await app.inject('/health')).statusCode, 200);
    assert.equal((await app.inject('/notes')).statusCode, 404);
  } finally {
    await app.close();
  }
});

test('enabled add-on validates its connection before the server can listen and sanitizes errors', async () => {
  for (const bad of ['', 'not-a-postgres-url', 'postgresql://ci:DO_NOT_EXPOSE_123@127.0.0.1:65432/nope']) {
    const app = Fastify({ logger: false });
    app.register(createPostgresPlugin({ databaseUrl: bad, connectionTimeoutMs: 200 }));
    try {
      await assert.rejects(app.ready(), error => {
        assert.ok(error instanceof Error);
        assert.ok(!error.message.includes('DO_NOT_EXPOSE_123'));
        assert.match(error.message, /PostgreSQL/);
        return true;
      });
    } finally {
      await app.close().catch(() => {});
    }
  }
});

test('Drizzle migration journal and isolated application schema exist', async () => {
  const admin = new Pool({ connectionString: migrateUrl });
  try {
    const data = await admin.query('SELECT COUNT(*)::integer AS count FROM drizzle.__drizzle_migrations');
    assert.equal(data.rows[0].count, 1, 'migrating twice must not repeat the first migration');
    const table = await admin.query(
      "SELECT COUNT(*)::integer AS count FROM pg_tables WHERE schemaname='lego_app' AND tablename='notes'"
    );
    assert.equal(table.rows[0].count, 1);
  } finally {
    await admin.end();
  }
});

test('application role can use typed DML but cannot migrate or read unrelated tables', async () => {
  const appPool = new Pool({ connectionString: appUrl });
  try {
    const whoami = await appPool.query('SELECT current_user AS name');
    assert.equal(whoami.rows[0].name, 'lego_app_ci');
    const constraints = [
      'CREATE TABLE lego_app.privilege_escape (id integer)',
      'SELECT * FROM drizzle.__drizzle_migrations',
      'SELECT * FROM public.privileged_ci',
    ];
    for (const statement of constraints) {
      await assert.rejects(appPool.query(statement), error => {
        assert.equal(error.code, '42501', statement);
        return true;
      });
    }
  } finally {
    await appPool.end();
  }
});

test('opt-in Fastify encapsulation exposes only consumer routes and releases connections', async () => {
  const app = Fastify({ logger: false });
  app.register(createPostgresPlugin({
    databaseUrl: appUrl,
    maxConnections: 2,
    registerRoutes(scope, db) {
      scope.post('/notes', async (request, reply) => {
        const body = request.body;
        if (!body || typeof body !== 'object' || !('content' in body) || typeof body.content !== 'string') {
          return reply.code(400).send({ error: 'Invalid body' });
        }
        const [row] = await db.insert(notes).values({ content: body.content }).returning();
        return row;
      });
      scope.get('/notes', async () => db.select().from(notes));
    },
  }));
  try {
    await app.ready();
    const created = await app.inject({ method: 'POST', url: '/notes', payload: { content: "O'Hara'); DROP TABLE lego_app.notes; --" } });
    assert.equal(created.statusCode, 200);
    const note = created.json();
    assert.equal(note.content, "O'Hara'); DROP TABLE lego_app.notes; --");
    assert.match(note.id, /^[0-9a-f-]{36}$/);
    const list = await app.inject('/notes');
    assert.equal(list.statusCode, 200);
    assert.ok(list.json().some(row => row.id === note.id));
  } finally {
    await app.close();
  }
  const admin = new Pool({ connectionString: migrateUrl });
  try {
    const active = await admin.query(
      "SELECT COUNT(*)::integer AS count FROM pg_stat_activity WHERE usename = 'lego_app_ci' AND application_name = 'kit_lego_postgres'"
    );
    assert.equal(active.rows[0].count, 0, 'pool was not fully closed by onClose');
  } finally {
    await admin.end();
  }
});
