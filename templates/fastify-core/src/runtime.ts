import type { FastifyInstance } from 'fastify';
import { readServerConfig } from './config.js';

/** HTTP lifecycle; only the entrypoint should invoke this function. */
export async function listen(app: FastifyInstance): Promise<string> {
  const config = readServerConfig();

  let closing = false;
  async function shutdown(): Promise<void> {
    if (closing) return;
    closing = true;
    try {
      await app.close();
    } catch {
      process.exitCode = 1;
    }
  }

  process.once('SIGTERM', () => { void shutdown(); });
  process.once('SIGINT', () => { void shutdown(); });
  try {
    const address = await app.listen({ host: config.host, port: config.port });
    console.log('KIT_LISTEN ' + address);
    return address;
  } catch (error) {
    await app.close();
    throw error;
  }
}
