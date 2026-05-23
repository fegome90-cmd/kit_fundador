/* eslint-disable no-console */
/**
 * Application Entry Point
 * Initializes and starts the HTTP server with all middleware, routes, and documentation
 */
import moduleAlias from 'module-alias';
import { join } from 'node:path';
// Register module aliases for path resolution at runtime
moduleAlias.addAliases({
    '@': join(__dirname),
    '@domain': join(__dirname, 'domain'),
    '@application': join(__dirname, 'application'),
    '@infrastructure': join(__dirname, 'infrastructure'),
});
import { createServer } from './infrastructure/http/server';
async function main() {
    const server = createServer({
        port: Number.parseInt(process.env.PORT || '3000', 10),
        environment: process.env.NODE_ENV || 'development',
    });
    server.start();
}
try {
    await main();
}
catch (error) {
    console.error('Failed to start server:', error instanceof Error ? error.message : String(error));
    process.exit(1);
}
export { main };
//# sourceMappingURL=index.js.map