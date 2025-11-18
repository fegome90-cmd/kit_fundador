/**
 * Ejecutor de seeds de ejemplo para mantener `npm run seed:dev` funcional.
 * Reemplaza el contenido con tu lógica de carga de datos iniciales.
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
