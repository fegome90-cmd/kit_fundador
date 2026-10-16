/**
 * Standalone, explicitly launched demonstration; never imported by the Kit core.
 * Binds only to 127.0.0.1 and has no persistent identity provider.
 */
import { createServer } from './infrastructure/http/server';

const rawPort = process.env.PORT ?? '3000';
if (!/^(0|[1-9][0-9]*)$/.test(rawPort) || Number(rawPort) > 65535) {
  throw new Error('Invalid PORT: expected a decimal number from 0 to 65535');
}

const server = createServer({
  port: Number(rawPort),
  environment: process.env.NODE_ENV ?? 'development',
});

server.start();
for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.once(signal, () => {
    void server.stop().then(
      () => { process.exitCode = 0; },
      () => { process.exitCode = 1; }
    );
  });
}
