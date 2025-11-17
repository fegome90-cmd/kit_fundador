/**
 * Stub seed runner intended to be customized to populate development or test data.
 *
 * Replace this placeholder with database, HTTP client, or fixture calls to load initial data for local development or CI environments.
 */
async function runSeed() {
  console.log('[Kit Fundador] scripts/seed.ts es un stub listo para personalizar.');
  console.log('Aquí puedes invocar ORMs, clientes HTTP o fixtures para poblar tu entorno.');
}

if (require.main === module) {
  runSeed().catch((error) => {
    console.error('Seed de ejemplo falló:', error);
    process.exit(1);
  });
}

export { runSeed };