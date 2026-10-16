import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { Pool } from 'pg';
import { createAuthPlugin } from '../dist/index.js';

const databaseUrl = process.env.AUTH_APP_DATABASE_URL;
const migrationUrl = process.env.AUTH_MIGRATION_DATABASE_URL;
const secret = process.env.AUTH_TEST_SECRET;
const baseURL = 'http://127.0.0.1:4310';
if (!databaseUrl || !migrationUrl || !secret) {
  throw new Error('Ephemeral PostgreSQL URLs and auth secret are required for E2E tests');
}

const userA = { email: 'a@example.test', name: 'User A', password: 'A-long-secure-passphrase-2026!' };
const userB = { email: 'b@example.test', name: 'User B', password: 'Another-secure-passphrase-2026!' };
function makeApp(opts = {}) {
  const app = Fastify({ logger: false, bodyLimit: 1024 * 1024, trustProxy: false });
  app.register(createAuthPlugin({
    databaseUrl, baseURL, secret, maxConnections: 2,
    registerRoutes(scope, { getPrincipal }) {
      scope.get('/private', async (req, reply) => {
        const principal = await getPrincipal(req);
        return principal ? { id: principal.id, email: principal.email } : reply.code(401).send({ error: 'Unauthorized' });
      });
      scope.get('/private/:userId', async (req, reply) => {
        const principal = await getPrincipal(req);
        if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
        const { userId } = req.params;
        return principal.id === userId ? { id: principal.id } : reply.code(403).send({ error: 'Forbidden' });
      });
      scope.get('/admin', async (req, reply) => {
        const principal = await getPrincipal(req);
        if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
        return principal.role === 'admin' ? { ok: true } : reply.code(403).send({ error: 'Forbidden' });
      });
    },
    ...opts,
  }));
  return app;
}
async function authRequest(app, path, opts = {}) {
  return app.inject({
    method: opts.method ?? 'GET',
    url: '/api/auth' + path,
    headers: {
      origin: opts.origin ?? baseURL,
      ...(opts.cookie ? { cookie: opts.cookie } : {}),
      ...(opts.headers ?? {}),
    },
    ...(opts.body ? { payload: opts.body } : {}),
  });
}
function cookies(response) {
  const raw = response.headers['set-cookie'];
  if (!raw) return '';
  return (Array.isArray(raw) ? raw : [raw]).map(value => value.split(';')[0]).join('; ');
}
function expectJSON(response) {
  assert.match(response.headers['content-type'] ?? '', /application\/json/);
  return response.json();
}

test('Fastify Core never mounts auth or opens a pool unless the plugin is registered', async () => {
  const app = Fastify({ logger: false });
  app.get('/health', async () => ({ ok: true }));
  try {
    await app.ready();
    assert.equal((await app.inject('/health')).statusCode, 200);
    assert.equal((await app.inject('/api/auth/get-session')).statusCode, 404);
    assert.equal((await app.inject('/private')).statusCode, 404);
  } finally { await app.close(); }
});

test('invalid secrets, URLs and origins fail before listening without leaking credentials', async () => {
  const scenarios = [
    { options: { secret: 'short' }, expected: 'Auth secret must contain at least 32 characters' },
    { options: { baseURL: 'http://evil.example' }, expected: 'Auth baseURL must be an exact HTTPS origin (or local loopback HTTP)' },
    { options: { baseURL: 'https://user:password@auth.example' }, expected: 'Auth baseURL must be an exact HTTPS origin (or local loopback HTTP)' },
    { options: { trustedOrigins: ['*'] }, expected: 'Auth trustedOrigins require explicit secure origins' },
    { options: { databaseUrl: 'postgresql://' }, expected: 'Invalid Auth PostgreSQL databaseUrl' },
    { options: { databaseUrl: 'postgresql://auth_user:SENSITIVE_TEST_PASSWORD@127.0.0.1:65432/no-server' }, expected: 'Auth add-on initialization failed' },
  ];
  for (const { options, expected } of scenarios) {
    const app = makeApp(options);
    try {
      await assert.rejects(app.ready(), error => {
        assert.ok(error instanceof Error);
        assert.equal(error.message, expected);
        assert.ok(!error.message.includes('SENSITIVE_TEST_PASSWORD'));
        assert.ok(!error.message.includes(secret));
        return true;
      });
    } finally { await app.close().catch(() => {}); }
  }
});

test('runtime role can access auth tables but cannot create schemas, read migrations or LEGO app data', async () => {
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    assert.equal((await pool.query('SELECT current_user AS role')).rows[0].role, 'lego_auth_ci');
    for (const query of [
      'CREATE TABLE auth.escalation (id integer)',
      'SELECT * FROM auth_meta.__drizzle_migrations',
      'SELECT * FROM drizzle.__drizzle_migrations',
      'SELECT * FROM lego_app.notes',
    ]) {
      await assert.rejects(pool.query(query), error => {
        assert.equal(error.code, '42501', query);
        return true;
      });
    }
  } finally { await pool.end(); }
});

test('passwords below the 15-character policy are rejected before account creation', async () => {
  const app = makeApp();
  try {
    await app.ready();
    const email = 'weak-password@example.test';
    const weak = await authRequest(app, '/sign-up/email', {
      method: 'POST',
      body: { email, name: 'Weak Password', password: 'Only-14-letters' .slice(0, 14) },
    });
    assert.ok(weak.statusCode >= 400 && weak.statusCode < 500, weak.body.slice(0, 220));
    assert.ok(!cookies(weak).includes('session_token'));
    const pool = new Pool({ connectionString: migrationUrl });
    try {
      const record = await pool.query('SELECT 1 FROM auth."user" WHERE email=$1', [email]);
      assert.equal(record.rowCount, 0);
    } finally { await pool.end(); }
  } finally { await app.close(); }
});

test('two independent signup/login sessions cannot cross accounts or promote public role', async () => {
  const app = makeApp();
  try {
    await app.ready();
    assert.equal((await app.inject('/private')).statusCode, 401);
    assert.equal((await app.inject('/admin')).statusCode, 401);
    const signedA = await authRequest(app, '/sign-up/email', {
      method: 'POST', body: { ...userA, role: 'admin', emailVerified: true },
    });
    assert.ok([200, 201].includes(signedA.statusCode), JSON.stringify({ status: signedA.statusCode, body: signedA.body.slice(0, 250) }));
    const cookieA = cookies(signedA);
    assert.ok(cookieA.includes('session_token'));
    assert.ok(String(signedA.headers['set-cookie']).toLowerCase().includes('httponly'));
    const signedB = await authRequest(app, '/sign-up/email', { method: 'POST', body: userB });
    assert.ok([200, 201].includes(signedB.statusCode), signedB.body.slice(0, 200));
    const cookieB = cookies(signedB);
    assert.ok(cookieB.includes('session_token'));
    const privateA = await app.inject({ method: 'GET', url: '/private', headers: { cookie: cookieA } });
    const privateB = await app.inject({ method: 'GET', url: '/private', headers: { cookie: cookieB } });
    assert.equal(privateA.statusCode, 200);
    assert.equal(privateB.statusCode, 200);
    const a = expectJSON(privateA), b = expectJSON(privateB);
    assert.notEqual(a.id, b.id);
    assert.equal(a.email, userA.email);
    assert.equal(b.email, userB.email);
    assert.equal((await app.inject({ url: '/private/' + a.id, headers: { cookie: cookieB } })).statusCode, 403);
    assert.equal((await app.inject({ url: '/private/' + a.id, headers: { cookie: cookieA } })).statusCode, 200);
    assert.equal((await app.inject({ url: '/admin', headers: { cookie: cookieA } })).statusCode, 403);
    assert.equal((await app.inject({ url: '/admin', headers: { cookie: cookieB } })).statusCode, 403);
    assert.equal((await authRequest(app, '/admin/create-user', { method: 'POST', cookie: cookieA, body: { email: 'admin@example.test', password: userA.password } })).statusCode, 404);

    const pool = new Pool({ connectionString: migrationUrl });
    try {
      const roles = await pool.query('SELECT email, role FROM auth."user" WHERE email = ANY($1::text[]) ORDER BY email', [[userA.email, userB.email]]);
      assert.deepEqual(roles.rows.map(row => row.role), ['user', 'user']);
    } finally { await pool.end(); }

    const loggedOut = await authRequest(app, '/sign-out', { method: 'POST', cookie: cookieA, body: {} });
    assert.equal(loggedOut.statusCode, 200, loggedOut.body.slice(0, 250));
    assert.equal((await app.inject({ url: '/private', headers: { cookie: cookieA } })).statusCode, 401);
    assert.equal((await app.inject({ url: '/private', headers: { cookie: cookieB } })).statusCode, 200);
    const loggedIn = await authRequest(app, '/sign-in/email', { method: 'POST', body: { email: userA.email, password: userA.password } });
    assert.equal(loggedIn.statusCode, 200, loggedIn.body.slice(0, 250));
    assert.equal((await app.inject({ url: '/private', headers: { cookie: cookies(loggedIn) } })).statusCode, 200);
  } finally { await app.close(); }
});

test('wrong password and untrusted browser origin do not grant a session', async () => {
  const app = makeApp();
  try {
    await app.ready();
    const wrong = await authRequest(app, '/sign-in/email', { method: 'POST', body: { email: userA.email, password: 'wrong-guess' } });
    assert.ok(wrong.statusCode >= 400 && wrong.statusCode < 500);
    assert.ok(!cookies(wrong).includes('session_token'));
    const attacker = await authRequest(app, '/sign-up/email', {
      method: 'POST', origin: 'https://evil.example', body: {
        email: 'attacker@example.test', name: 'Attacker', password: userA.password,
      },
    });
    assert.ok(attacker.statusCode >= 400 && attacker.statusCode < 500, attacker.body.slice(0, 200));
    assert.ok(!cookies(attacker).includes('session_token'));
    const pool = new Pool({ connectionString: migrationUrl });
    try {
      const rows = await pool.query('SELECT 1 FROM auth."user" WHERE email=$1', ['attacker@example.test']);
      assert.equal(rows.rowCount, 0);
    } finally { await pool.end(); }
  } finally { await app.close(); }
});

test('auth migrations and application migrations have separate, repeatable journals', async () => {
  const pool = new Pool({ connectionString: migrationUrl });
  try {
    for (const path of ['auth_meta.__drizzle_migrations', 'drizzle.__drizzle_migrations']) {
      const result = await pool.query('SELECT COUNT(*)::integer AS n FROM ' + path);
      assert.equal(result.rows[0].n, 1);
    }
    const count = await pool.query("SELECT COUNT(*)::integer AS n FROM pg_tables WHERE schemaname='auth'");
    assert.equal(count.rows[0].n, 4);
    const appCount = await pool.query("SELECT COUNT(*)::integer AS n FROM pg_tables WHERE schemaname='lego_app'");
    assert.equal(appCount.rows[0].n, 1);
  } finally { await pool.end(); }
});

test('closing Fastify releases the owned auth pool', async () => {
  const app = makeApp();
  await app.ready();
  await app.close();
  const pool = new Pool({ connectionString: migrationUrl });
  try {
    const active = await pool.query(
      "SELECT COUNT(*)::integer AS n FROM pg_stat_activity WHERE application_name='kit_lego_auth' AND usename='lego_auth_ci'"
    );
    assert.equal(active.rows[0].n, 0);
  } finally { await pool.end(); }
});
