/**
 * Test Setup Utilities
 * Utilidades para configuración y limpieza de tests
 */

import { InMemoryUserRepository } from '../../src/infrastructure/_stubs/repositories/in-memory-user-repository';

// Singleton del repositorio para tests
let testRepository: InMemoryUserRepository | null = null;

/**
 * Obtiene el repositorio de testing (singleton)
 */
export function getTestRepository(): InMemoryUserRepository {
  if (!testRepository) {
    testRepository = new InMemoryUserRepository();
  }
  return testRepository;
}

/**
 * Limpia la base de datos de testing (in-memory)
 * ADR-003 Compliant: Test Isolation Strategy
 */
export async function cleanupDatabase(): Promise<void> {
  if (testRepository) {
    await testRepository.clear();
  }
}

/**
 * Reinicia el estado del repositorio para cada test
 */
export async function resetTestEnvironment(): Promise<void> {
  await cleanupDatabase();
  testRepository = null;
}
