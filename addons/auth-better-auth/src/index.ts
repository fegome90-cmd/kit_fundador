import type { FastifyInstance, FastifyPluginAsync, FastifyRequest } from 'fastify';
import { betterAuth } from 'better-auth';
import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { fromNodeHeaders } from 'better-auth/node';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './auth-schema.js';

export interface AuthPrincipal {
  id: string;
  email: string;
  role: string;
}

export interface AuthRoutes {
  /** A session checked against PostgreSQL on every request (no cookie cache). */
  getPrincipal: (request: FastifyRequest) => Promise<AuthPrincipal | null>;
}

export interface AuthOptions {
  databaseUrl: string;
  baseURL: string;
  secret: string;
  /** Optional same-origin or separately trusted browser origins; never '*' */
  trustedOrigins?: string[];
  maxConnections?: number;
  /** Caller-owned routes are registered INSIDE the optional Fastify scope. */
  registerRoutes?: (scope: FastifyInstance, session: AuthRoutes) => Promise<void> | void;
}

function validated(options: AuthOptions) {
  if (typeof options?.databaseUrl !== 'string' || !options.databaseUrl.trim()) {
    throw new Error('Auth PostgreSQL databaseUrl is required');
  }
  try {
    const parsed = new URL(options.databaseUrl);
    const explicitHost = parsed.searchParams.get('host')?.trim();
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || (!parsed.hostname && !explicitHost)) {
      throw new Error('Invalid protocol or host');
    }
  } catch {
    throw new Error('Invalid Auth PostgreSQL databaseUrl');
  }

  let url: URL;
  try {
    url = new URL(options.baseURL);
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      (url.protocol === 'http:' && !['localhost','127.0.0.1','[::1]'].includes(url.hostname)) ||
      url.username || url.password || url.pathname !== '/' || url.search || url.hash
    ) throw new Error('Invalid origin');
  } catch {
    throw new Error('Auth baseURL must be an exact HTTPS origin (or local loopback HTTP)');
  }
  if (typeof options.secret !== 'string' || options.secret.length < 32) {
    throw new Error('Auth secret must contain at least 32 characters');
  }
  if (!Array.isArray(options.trustedOrigins ?? []) || (options.trustedOrigins ?? []).some(origin => {
    if (typeof origin !== 'string') return true;
    try {
      const parsed = new URL(origin);
      return parsed.origin !== origin || !['http:', 'https:'].includes(parsed.protocol) ||
        (parsed.protocol === 'http:' && !['localhost','127.0.0.1','[::1]'].includes(parsed.hostname));
    } catch { return true; }
  })) throw new Error('Auth trustedOrigins require explicit secure origins');

  const maxConnections = options.maxConnections ?? 4;
  if (!Number.isSafeInteger(maxConnections) || maxConnections < 1 || maxConnections > 20) {
    throw new Error('Auth maxConnections must be between 1 and 20');
  }
  return { baseURL: url.origin, maxConnections };
}

/** Opt-in Better Auth scope. No implicit global decorators, CORS or DB migrations. */
export function createAuthPlugin(options: AuthOptions): FastifyPluginAsync {
  return async function authScope(app) {
    const config = validated(options);
    const pool = new Pool({
      connectionString: options.databaseUrl,
      application_name: 'kit_lego_auth',
      max: config.maxConnections,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 2000,
    });
    const onIdleError = () => app.log.error({ component: 'auth-postgres' }, 'Auth PostgreSQL idle connection failed');
    pool.on('error', onIdleError);
    let closed = false;
    const close = async () => {
      if (closed) return;
      closed = true;
      pool.off('error', onIdleError);
      await pool.end();
    };
    app.addHook('onClose', close);

    try {
      // Fail closed before listen for an absent OR partially applied auth schema.
      // Check every required table with the runtime DML role; never read the
      // migrator-only journal and never create tables implicitly on boot.
      for (const table of ['user', 'session', 'account', 'verification']) {
        await pool.query(`SELECT 1 FROM auth."${table}" LIMIT 0`);
      }
      const db = drizzle(pool, { schema });
      const auth = betterAuth({
        baseURL: config.baseURL,
        secret: options.secret,
        trustedOrigins: [config.baseURL, ...(options.trustedOrigins ?? [])],
        database: drizzleAdapter(db, { provider: 'pg', schema, schemaName: 'auth' }),
        emailAndPassword: { enabled: true, minPasswordLength: 15 },
        user: {
          additionalFields: { role: { type: 'string', defaultValue: 'user', input: false } },
        },
        // For the sample, explicitly enable limits in development/test too.
        // In-memory rate limiting is not multi-instance production protection.
        rateLimit: { enabled: true, window: 60, max: 100 },
        advanced: { useSecureCookies: config.baseURL.startsWith('https:') },
      });

      app.route({
        method: ['GET','POST'], url: '/api/auth/*',
        handler: async (request, reply) => {
          try {
            // Use the trusted configured baseURL, never request.headers.host.
            const url = new URL(request.url, config.baseURL);
            const response = await auth.handler(new Request(url, {
              method: request.method,
              headers: fromNodeHeaders(request.headers),
              ...(request.method === 'POST' && request.body !== undefined
                ? { body: JSON.stringify(request.body) }
                : {}),
            }));
            reply.code(response.status);
            for (const [key, value] of response.headers) {
              if (!['set-cookie','content-length','transfer-encoding','connection'].includes(key)) {
                reply.header(key, value);
              }
            }
            const cookies = response.headers.getSetCookie();
            if (cookies.length) reply.header('set-cookie', cookies);
            return reply.send(response.body ? await response.text() : null);
          } catch {
            // No raw Better Auth error or request content in HTTP/logs.
            return reply.code(500).send({ error: 'Authentication unavailable' });
          }
        },
      });
      await options.registerRoutes?.(app, {
        async getPrincipal(request) {
          const data = await auth.api.getSession({ headers: fromNodeHeaders(request.headers) });
          if (!data) return null;
          return { id: data.user.id, email: data.user.email, role: data.user.role ?? 'user' };
        },
      });
    } catch {
      await close();
      throw new Error('Auth add-on initialization failed');
    }
  };
}
