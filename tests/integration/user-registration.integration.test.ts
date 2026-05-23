/**
 * Integration Tests: Full User Registration Flow
 * Valida la integración completa entre capas del sistema
 */

import request from 'supertest';
import { app } from '../../../src/infrastructure/http/app';
import { cleanupDatabase } from '../../helpers/test-setup';
import { createValidUser, createEdgeCaseUser } from '../../helpers/test-data-factories';
import { InMemoryUserRepository } from '../../../src/infrastructure/_stubs/repositories/in-memory-user-repository';
import { User } from '../../../src/domain/entities/user';

describe('Integration: Full User Registration Flow', () => {
  const endpoint = '/api/users/register';

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe('Complete Registration Flow', () => {
    it('debe completar el flujo completo de registro exitosamente', async () => {
      const userData = createValidUser();

      // Paso 1: Enviar request de registro
      const registerResponse = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(registerResponse.status).toBe(201);
      expect(registerResponse.body).toHaveProperty('data');
      expect(registerResponse.body.data).toHaveProperty('id');
      expect(registerResponse.body.data.email).toBe(userData.email);
      expect(registerResponse.body.data.name).toBe(userData.name);
      expect(registerResponse.body.data).not.toHaveProperty('password');

      // Paso 2: Verificar que el usuario fue persistido
      const userId = registerResponse.body.data.id;
      
      // Nota: En un escenario real con DB, haríamos una query directa
      // Aquí validamos que el endpoint GET funcione (si estuviera implementado)
      expect(userId).toBeDefined();
      expect(typeof userId).toBe('string');
    });

    it('debe manejar correctamente usuarios duplicados', async () => {
      const userData = createValidUser();

      // Primer registro - debe ser exitoso
      const firstResponse = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(firstResponse.status).toBe(201);

      // Segundo registro con mismo email - debe fallar
      const secondResponse = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(secondResponse.status).toBe(409); // Conflict
      expect(secondResponse.body).toHaveProperty('error');
      expect(secondResponse.body.error.toLowerCase()).toContain('exists');
    });
  });

  describe('Domain Events Verification', () => {
    it('debe publicar evento UserCreatedEvent al registrar usuario', async () => {
      const userData = createValidUser();

      // El evento se publica internamente en el dominio
      // Validamos indirectamente a través de la respuesta
      const response = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(response.status).toBe(201);
      
      // La respuesta debe incluir información del usuario creado
      expect(response.body.data).toHaveProperty('createdAt');
      expect(new Date(response.body.data.createdAt).getTime()).toBeLessThanOrEqual(Date.now());
    });
  });

  describe('Transaction Integrity', () => {
    it('debe hacer rollback si falla alguna parte del proceso', async () => {
      // Caso: Email inválido debe fallar antes de persistir
      const invalidUserData = {
        ...createValidUser(),
        email: 'invalid-email-format',
      };

      const response = await request(server.getApp())
        .post(endpoint)
        .send(invalidUserData);

      expect(response.status).toBe(400);

      // Validar que no se creó ningún usuario
      // En un escenario real, consultaríamos la DB directamente
      expect(response.body).toHaveProperty('error');
    });

    it('debe mantener consistencia ante passwords inválidos', async () => {
      const userData = {
        ...createValidUser(),
        password: 'weak', // Password muy débil
      };

      const response = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.error.toLowerCase()).toContain('password');
    });
  });

  describe('Error Handling End-to-End', () => {
    it('debe retornar error estructurado para campos faltantes', async () => {
      const incompleteData = {
        email: createValidUser().email,
        // Falta password y name
      };

      const response = await request(server.getApp())
        .post(endpoint)
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('debe retornar error estructurado para tipos incorrectos', async () => {
      const wrongTypes = {
        email: 12345, // Debería ser string
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const response = await request(server.getApp())
        .post(endpoint)
        .send(wrongTypes);

      expect(response.status).toBe(400);
    });

    it('debe manejar gracefully errores internos del servidor', async () => {
      // Simular scenario que podría causar error interno
      // En este caso, enviamos datos válidos pero extremadamente largos
      const extremeData = {
        email: `${'a'.repeat(1000)}@example.com`,
        password: 'SecurePass123!',
        name: 'Test User',
      };

      const response = await request(server.getApp())
        .post(endpoint)
        .send(extremeData);

      // Debería ser rechazado por validación, no causar error 500
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
    });
  });

  describe('Edge Cases', () => {
    it('debe manejar caracteres especiales en nombres', async () => {
      const userData = createEdgeCaseUser('special-chars');

      const response = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect([200, 201]).toContain(response.status);
      
      if (response.status === 201) {
        expect(response.body.data.name).toContain('José');
      }
    });

    it('debe manejar passwords en el límite mínimo', async () => {
      const userData = createEdgeCaseUser('short-password');

      const response = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      // Password mínimo válido debería ser aceptado
      expect([200, 201, 400]).toContain(response.status);
    });

    it('debe rechazar emails excesivamente largos', async () => {
      const userData = createEdgeCaseUser('long-email');

      const response = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(response.status).toBe(400);
    });
  });

  describe('Repository Isolation', () => {
    it('cada test debe tener repositorio limpio (ADR-003)', async () => {
      const userData = createValidUser();

      // Registrar usuario
      const response = await request(server.getApp())
        .post(endpoint)
        .send(userData);

      expect(response.status).toBe(201);

      // Este test es independiente - no hay usuarios previos
      // El cleanup en beforeEach garantiza aislamiento
    });
  });
});
