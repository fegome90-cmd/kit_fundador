/* eslint-disable no-console */
/**
 * Entry point placeholder that keeps npm scripts runnable out of the box.
 * Replace the implementation with your own HTTP server, CLI, worker, etc.
 */
async function main(): Promise<void> {
  console.log('[Kit Fundador] src/index.ts está listo para que reemplaces este bootstrap.'); // eslint-disable-line no-console
  console.log('Añade aquí la inicialización de tu aplicación (HTTP server, jobs, etc.).'); // eslint-disable-line no-console
}

if (require.main === module) {
  main().catch((error: Error) => {
    console.error('Fallo al ejecutar el bootstrap de ejemplo:', error); // eslint-disable-line no-console
    process.exit(1);
  });
}

export { main };
