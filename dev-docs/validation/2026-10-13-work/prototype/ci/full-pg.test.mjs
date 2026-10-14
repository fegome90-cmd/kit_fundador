import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import pg from 'pg';
import { Queue, createPostgresBackend } from 'bullmq';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL required for PostgreSQL E2E test');
const baseURL = 'http://127.0.0.1:4310';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const eventually = async (check, label, timeout = 18000) => {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const result = await check();
    if (result) return result;
    await sleep(75);
  }
  throw new Error('Timed out: ' + label);
};
const cookies = headers => (headers.getSetCookie?.() ?? (headers.get('set-cookie') ? [headers.get('set-cookie')] : []))
  .map(value => value.split(';')[0]).join('; ');
const json = async (response) => { const txt = await response.text(); try { return JSON.parse(txt); } catch { return { raw: txt.slice(0, 500) }; } };
const request = (path, options = {}) => fetch(baseURL + path, { ...options, headers: { origin: baseURL, ...(options.headers ?? {}) } });

async function startProcess(command, args, readiness, env = {}) {
  const child = spawn(command, args, { cwd: process.cwd(), env: { ...process.env, ...env }, stdio: ['ignore', 'pipe', 'pipe'] });
  let logs = '';
  const ready = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Start timeout '+command+': '+logs.slice(-1400))), 14000);
    const onData = chunk => { logs += chunk.toString(); if (logs.includes(readiness)) { clearTimeout(timeout); resolve(); } };
    child.stdout.on('data', onData);
    child.stderr.on('data', chunk => { logs += chunk.toString(); });
    child.once('exit', (code, signal) => { clearTimeout(timeout); reject(new Error('Early exit '+command+': '+code+'/'+signal+': '+logs.slice(-1400))); });
    child.once('error', error => { clearTimeout(timeout); reject(error); });
  });
  try { await ready; } catch (error) { if (child.exitCode === null) child.kill('SIGKILL'); throw error; }
  return { child, logs: () => logs };
}
async function stopProcess(child, signal = 'SIGTERM') {
  if (child.exitCode !== null || child.signalCode !== null) return;
  const exited = new Promise(resolve => child.once('exit', resolve));
  child.kill(signal);
  await Promise.race([exited, sleep(10000).then(() => { if (child.exitCode === null) child.kill('SIGKILL'); })]);
}
async function waitJob(queue, id, expected = 'completed') {
  return eventually(async () => {
    const job = await queue.getJob(id);
    if (!job) return false;
    const state = await job.getState();
    if (state === 'failed' && expected !== 'failed') throw new Error('Job failed: ' + job.failedReason);
    return state === expected ? job : false;
  }, 'job '+id+' -> '+expected, 30000);
}

test('PostgreSQL is operational and both schema owners migrated', async () => {
  const pool = new pg.Pool({ connectionString: databaseUrl });
  try {
    const ver = await pool.query('SHOW server_version');
    assert.match(ver.rows[0].server_version, /^16\./);
    const rows = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename = ANY($1::text[])", [['user', 'account', 'session', 'verification']]);
    assert.deepEqual(rows.rows.map(x=>x.tablename).sort(), ['account','session','user','verification']);
    const schema = await pool.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name='bullmq'");
    assert.equal(schema.rowCount, 1);
    console.log('POSTGRES_MIGRATIONS_PASS', JSON.stringify({ version: ver.rows[0].server_version, authTables: rows.rowCount, bullmqSchema: schema.rows[0].schema_name }));
  } finally { await pool.end(); }
});

test('Better Auth real signup, login, session, logout, public-admin defense and route contracts', async () => {
  const server = await startProcess(process.execPath, ['dist/server.js'], 'LAB_LISTEN ', {
    PORT: '4310', DB: 'on', AUTH: 'on', DOCS: 'on', AUTH_URL: baseURL,
    LAB_AUTH_SECRET: 'temporary-test-secret-never-use-in-production-932850123456',
  });
  try {
    assert.equal((await request('/health')).status, 200);
    assert.equal((await request('/ready')).status, 200);
    assert.equal((await request('/private')).status, 401);
    const docs = await request('/docs/json');
    assert.equal(docs.status, 200);
    const fastifySpec = await json(docs);
    assert.ok(fastifySpec.paths['/health']);
    assert.ok(!fastifySpec.paths['/api/auth/sign-up/email']);
    const authSpecResp = await request('/api/auth/open-api/generate-schema');
    assert.equal(authSpecResp.status, 200);
    assert.ok((await json(authSpecResp)).paths['/sign-up/email']);
    const email = 'lego-ci-'+Date.now()+'@example.test';
    const password = 'ThisIsOnlyATestPassword45!';
    const signUp = await request('/api/auth/sign-up/email', { method: 'POST', headers: { 'content-type':'application/json' }, body:JSON.stringify({ name:'Lego Test', email, password }) });
    const signupBody = await json(signUp);
    assert.ok([200,201].includes(signUp.status), 'signup '+signUp.status+' '+JSON.stringify(signupBody).slice(0,700));
    const cookie = cookies(signUp.headers);
    assert.ok(cookie, 'signup did not issue session cookie');
    const privateResp = await request('/private', { headers: { cookie } });
    assert.equal(privateResp.status, 200, 'private status '+privateResp.status+' '+JSON.stringify(await json(privateResp)));
    assert.equal((await request('/admin', { headers: { cookie } })).status, 403);
    const session = await request('/api/auth/get-session', { headers: { cookie } });
    assert.equal(session.status, 200);
    const sessionData = await json(session);
    assert.equal(sessionData.user.email, email);
    const pool = new pg.Pool({ connectionString: databaseUrl });
    try {
      const [roleRow] = (await pool.query('SELECT role FROM "user" WHERE email=$1', [email])).rows;
      assert.equal(roleRow.role, 'user');
      const attemptEmail = 'lego-priv-'+Date.now()+'@example.test';
      const attemptedAdmin = await request('/api/auth/sign-up/email', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ name:'Privilege Test', email:attemptEmail, password, role:'admin' }) });
      assert.ok(attemptedAdmin.status < 500, 'admin request caused server error '+attemptedAdmin.status);
      if (attemptedAdmin.status < 400) {
        const [record] = (await pool.query('SELECT role FROM "user" WHERE email=$1', [attemptEmail])).rows;
        assert.ok(record, 'admin test user not persisted');
        assert.equal(record.role, 'user', 'public signup escalated privileges');
      }
    } finally { await pool.end(); }
    const signOut = await request('/api/auth/sign-out', { method: 'POST', headers: { 'content-type':'application/json', cookie }, body:'{}' });
    assert.equal(signOut.status, 200, 'sign out '+signOut.status+' '+JSON.stringify(await json(signOut)));
    assert.equal((await request('/private', { headers: { cookie } })).status, 401);
    const login = await request('/api/auth/sign-in/email', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ email, password }) });
    assert.equal(login.status, 200, 'login '+login.status+' '+JSON.stringify(await json(login)));
    assert.ok(cookies(login.headers), 'login did not issue cookie');
    assert.equal((await request('/private', { headers: { cookie: cookies(login.headers) } })).status, 200);
    console.log('AUTH_PG_PASS',JSON.stringify({ email, session: true, logout: true, login: true, adminBlocked: true }));
  } finally { await stopProcess(server.child); }
});

test('BullMQ PostgreSQL real queue, bounded retries, separate worker kill/recovery', async () => {
  const queueName = 'lego-pg-ci-'+Date.now();
  const options = { connection: { connectionString: databaseUrl, schema:'bullmq', max:4 } };
  const queue = new Queue(queueName, options, createPostgresBackend);
  let first, second;
  const startWorker = async () => startProcess(process.execPath, ['ci/pg-worker.mjs'], 'PG_WORKER_READY', { QUEUE_NAME: queueName, DATABASE_URL: databaseUrl });
  try {
    first = await startWorker();
    const start = Date.now();
    const retry = await queue.add('retry', { value:3, failUntil:1 }, { attempts:2, backoff: { type:'fixed', delay:150 } });
    const done = await waitJob(queue,retry.id);
    assert.equal(done.returnvalue,6);
    assert.equal(done.attemptsMade,2);
    assert.ok(Date.now()-start >= 150);
    const killed = await queue.add('crash', { value:9, delay:2500 });
    await eventually(async () => (await killed.getState())==='active', 'active before kill');
    await stopProcess(first.child,'SIGKILL');
    second = await startWorker();
    const recovered = await waitJob(queue,killed.id);
    assert.equal(recovered.returnvalue,18);
    assert.ok(recovered.attemptsStarted >= 2, 'crash test did not retry job');
    console.log('JOBS_PG_PASS',JSON.stringify({ retryAttempts:done.attemptsMade, crashAttempts:recovered.attemptsStarted, queue:queueName }));
  } finally {
    if (first) await stopProcess(first.child);
    if (second) await stopProcess(second.child);
    await queue.close();
  }
});
