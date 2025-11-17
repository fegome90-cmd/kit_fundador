/* eslint-disable no-console */
/**
 * Entry point placeholder that keeps npm scripts runnable out of the box.
 * Replace the implementation with your own HTTP server, CLI, worker, etc.
 */
async function main(): Promise<void> {
  console.log('[Kit Fundador] src/index.ts está listo para que reemplaces este bootstrap.');
  console.log('Añade aquí la inicialización de tu aplicación (HTTP server, jobs, etc.).');
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Fallo al ejecutar el bootstrap de ejemplo:', error);
    process.exit(1);
  });
}

export { main };
