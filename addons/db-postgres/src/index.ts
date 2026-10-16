import type { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.js';

export type PostgresDatabase = NodePgDatabase<typeof schema>;
export type RouteInstaller = (scope: FastifyInstance, db: PostgresDatabase) => Promise<void> | void;

export interface PostgresOptions {
  /** Supplied by the consumer, never inferred from imports or process startup. */
  databaseUrl: string;
  maxConnections?: number;
  connectionTimeoutMs?: number;
  /** Registers application routes *inside* this Fastify encapsulation boundary. */
  registerRoutes?: RouteInstaller;
}

function validateOptions(options: PostgresOptions): Required<Pick<PostgresOptions, 'databaseUrl' | 'maxConnections' | 'connectionTimeoutMs'>> {
  const url = options?.databaseUrl;
  if (typeof url !== 'string' || !url.trim()) {
    throw new Error('PostgreSQL option databaseUrl is required');
  }
  try {
    const parsed = new URL(url);
    if (!['postgres:', 'postgresql:'].includes(parsed.protocol) || !parsed.hostname) {
      throw new Error('Invalid protocol or hostname');
    }
  } catch {
    // Never print the connection string: it commonly contains a password.
    throw new Error('Invalid PostgreSQL databaseUrl');
  }

  const maxConnections = options.maxConnections ?? 4;
  const connectionTimeoutMs = options.connectionTimeoutMs ?? 2000;
  if (!Number.isSafeInteger(maxConnections) || maxConnections < 1 || maxConnections > 20) {
    throw new Error('PostgreSQL maxConnections must be between 1 and 20');
  }
  if (!Number.isSafeInteger(connectionTimeoutMs) || connectionTimeoutMs < 100 || connectionTimeoutMs > 30000) {
    throw new Error('PostgreSQL connectionTimeoutMs must be between 100 and 30000');
  }
  return { databaseUrl: url, maxConnections, connectionTimeoutMs };
}

/**
 * Opt-in scope, registered explicitly via app.register(createPostgresPlugin(...)).
 * No pool is allocated until Fastify boots the plugin; core imports remain side-effect free.
 * Connection ownership is local to this scope; consumers receive the typed Drizzle db
 * through registerRoutes, not through an application-global decorator.
 */
export function createPostgresPlugin(options: PostgresOptions): FastifyPluginAsync {
  return async function postgresScope(app) {
    const config = validateOptions(options); // fail before allocating resources
    const pool = new Pool({
      connectionString: config.databaseUrl,
      max: config.maxConnections,
      connectionTimeoutMillis: config.connectionTimeoutMs,
      idleTimeoutMillis: 1000,
      application_name: 'kit_lego_postgres',
    });
    const onIdleError = () => {
      // Ignore raw PG errors, DSNs, SQL and parameter values in request logs.
      app.log.error({ component: 'postgres' }, 'PostgreSQL idle connection failed');
    };
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
      // A broken enabled add-on must fail startup. Core without it remains independent.
      await pool.query('SELECT 1');
      const db = drizzle(pool, { schema });
      await options.registerRoutes?.(app, db);
    } catch {
      await close();
      throw new Error('PostgreSQL add-on initialization failed');
    }
  };
}
