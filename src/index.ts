/* eslint-disable no-console */
/**
 * Application Entry Point
 * Boots only the legacy health server; the identity demo is opt-in under examples/
 */

import { createServer } from './infrastructure/http/server';

async function main(): Promise<void> {
  const server = createServer({
    port: Number.parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
  });

  server.start();
}

try {
  await main();
} catch (error: unknown) {
  console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}

export { main };
