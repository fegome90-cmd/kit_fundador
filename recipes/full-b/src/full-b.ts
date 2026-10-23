import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { sql } from 'drizzle-orm';
import { buildApp } from './app.js';
import { registerSwagger, registerSwaggerUi } from './plugins/api-docs.js';
import { createAuthPlugin, type AuthRoutes } from '@kit-fundador/auth-better-auth';
import { createPostgresPlugin, type PostgresDatabase } from '@kit-fundador/db-postgres';
import { createJobsPlugin, type DigestProducer } from '@kit-fundador/jobs-valkey';

export interface FullBOptions {
  databaseUrl: string;
  authUrl: string;
  secret: string;
  baseURL: string;
  valkeyUrl: string;
  queueName: string;
  docsEnabled: boolean;
}

interface OwnedNote { id: string; owner_id: string; content: string }
interface NoteIdParams { id: string }
interface JobParams extends NoteIdParams { jobId: string }

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const jobIdPattern = /^digest-[0-9a-f]{64}$/;
const noteSchema = {
  body: {
    type: 'object',
    required: ['text'],
    additionalProperties: false,
    properties: { text: { type: 'string', minLength: 1, maxLength: 1024 } },
  },
} as const;

function validText(body: unknown): string | null {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const obj = body as Record<string, unknown>;
  if (Object.keys(obj).sort().join(',') !== 'text') return null;
  if (typeof obj.text !== 'string' || !obj.text.trim() ||
    Buffer.byteLength(obj.text, 'utf8') > 1024) return null;
  return obj.text;
}
function invalidId(reply: FastifyReply, id: string): boolean {
  if (uuid.test(id)) return false;
  reply.code(400).send({ error: 'Invalid note ID' });
  return true;
}
async function getNote(db: PostgresDatabase, id: string): Promise<OwnedNote | null> {
  const result = await db.execute<OwnedNote>(sql`SELECT id, owner_id, content
    FROM lego_app.fullb_notes WHERE id = ${id}::uuid LIMIT 1`);
  return result.rows[0] ?? null;
}
function installRoutes(
  app: FastifyInstance,
  db: PostgresDatabase,
  producer: DigestProducer,
  getPrincipal: AuthRoutes['getPrincipal'],
): void {
  app.get('/fullb/notes', async (request, reply) => {
    const principal = await getPrincipal(request);
    if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
    const rows = await db.execute<{ id: string; content: string }>(
      sql`SELECT id, content FROM lego_app.fullb_notes
          WHERE owner_id = ${principal.id} ORDER BY id`);
    return { notes: rows.rows };
  });

  app.post('/fullb/notes', { schema: noteSchema }, async (request, reply) => {
    const principal = await getPrincipal(request);
    if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
    const text = validText(request.body);
    if (text === null) return reply.code(400).send({ error: 'Invalid synthetic text' });
    const result = await db.execute<{ id: string }>(
      sql`INSERT INTO lego_app.fullb_notes (owner_id, content)
          VALUES (${principal.id}, ${text}) RETURNING id`);
    const id = result.rows[0]?.id;
    if (!id) throw new Error('Synthetic insertion unavailable');
    return reply.code(201).send({ id });
  });

  app.get<{ Params: NoteIdParams }>('/fullb/notes/:id', async (request, reply) => {
    const principal = await getPrincipal(request as FastifyRequest);
    if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
    const id = request.params.id;
    if (invalidId(reply, id)) return reply;
    const note = await getNote(db, id);
    if (!note) return reply.code(404).send({ error: 'Not found' });
    if (note.owner_id !== principal.id) return reply.code(403).send({ error: 'Forbidden' });
    return { id: note.id, text: note.content };
  });

  app.post<{ Params: NoteIdParams }>('/fullb/notes/:id/digest', async (request, reply) => {
    const principal = await getPrincipal(request as FastifyRequest);
    if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
    const id = request.params.id;
    if (invalidId(reply, id)) return reply;
    const note = await getNote(db, id);
    if (!note) return reply.code(404).send({ error: 'Not found' });
    if (note.owner_id !== principal.id) return reply.code(403).send({ error: 'Forbidden' });

    // Lab-only digest has no external effects. The DB claim and queue.add
    // are NOT atomic, so no exactly-once guarantee is made.
    const { jobId } = await producer.enqueueDigest({ version: 1, text: note.content });
    await db.execute(sql`INSERT INTO lego_app.fullb_jobs (note_id, owner_id, job_id)
      VALUES (${id}::uuid, ${principal.id}, ${jobId}) ON CONFLICT DO NOTHING`);
    return reply.code(202).send({ jobId });
  });

  app.get<{ Params: JobParams }>('/fullb/notes/:id/jobs/:jobId', async (request, reply) => {
    const principal = await getPrincipal(request as FastifyRequest);
    if (!principal) return reply.code(401).send({ error: 'Unauthorized' });
    const { id, jobId } = request.params;
    if (invalidId(reply, id)) return reply;
    if (!jobIdPattern.test(jobId)) return reply.code(400).send({ error: 'Invalid job ID' });
    const note = await getNote(db, id);
    if (!note) return reply.code(404).send({ error: 'Not found' });
    if (note.owner_id !== principal.id) return reply.code(403).send({ error: 'Forbidden' });
    const claim = await db.execute<{ exists: number }>(sql`SELECT 1 AS exists
      FROM lego_app.fullb_jobs WHERE note_id = ${id}::uuid
      AND owner_id = ${principal.id} AND job_id = ${jobId} LIMIT 1`);
    if (!claim.rows.length) return reply.code(404).send({ error: 'Not found' });
    const status = await producer.getDigestStatus(jobId);
    if (!status) return reply.code(404).send({ error: 'Not found' });
    return status;
  });
}

/** Composes existing public plugins; no services are created until app.ready(). */
export function buildFullB(options: FullBOptions): FastifyInstance {
  if (typeof options.docsEnabled !== 'boolean') {
    throw new Error('docsEnabled must be a boolean');
  }
  return buildApp({
    beforeRoutes(app) {
      if (options.docsEnabled) registerSwagger(app);
      app.register(createAuthPlugin({
        databaseUrl: options.authUrl,
        baseURL: options.baseURL,
        secret: options.secret,
        maxConnections: 2,
        registerRoutes(authScope, { getPrincipal }) {
          authScope.register(createPostgresPlugin({
            databaseUrl: options.databaseUrl,
            maxConnections: 2,
            registerRoutes(dbScope, db) {
              dbScope.register(createJobsPlugin({
                valkeyUrl: options.valkeyUrl,
                queueName: options.queueName,
                registerRoutes(jobsScope, producer) {
                  installRoutes(jobsScope, db, producer, getPrincipal);
                },
              }));
            },
          }));
        },
      }));
    },
    afterRoutes(app) {
      if (options.docsEnabled) registerSwaggerUi(app);
    },
  });
}
