/**
 * E2E Security Tests: Input Validation
 * Valida que el validation layer previene ataques de inyección y XSS
 * 
 * ADR-006 Compliant: Security Testing in Clean Architecture
 */

import request from 'supertest';
import { HttpServer } from '../../../src/infrastructure/http/server';
import {
  testSqlInjectionPrevention,
  testXssPrevention,
  assertSecurityResults,
  generateSecurityReport,
} from '../../helpers/security-test-helpers';
import { createValidUser } from '../../helpers/test-data-factories';

describe('E2E Security: Input Validation', () => {
  let server: HttpServer;
  const endpoint = '/api/users/register';
  const validBasePayload = {
    password: 'SecurePass123!',
    name: 'Test User',
  };

  beforeEach(async () => {
    server = new HttpServer({ port: 0, environment: 'test' });
    await server.start();
  });

  afterEach(async () => {
    await server.stop();
  });

  describe('SQL Injection Prevention', () => {
    it('debe rechazar todos los payloads de SQL injection en el email', async () => {
      const results = await testSqlInjectionPrevention(endpoint, validBasePayload, server.getApp());
      
      // Validar que todos los payloads fueron rechazados
      assertSecurityResults(results, 'SQL Injection Prevention');
      
      // Generar reporte para documentación
      const report = generateSecurityReport('SQL Injection Test', results);
      console.log(report);
    });

    it('debe retornar error 400 con mensaje genérico (no revelar detalles)', async () => {
      const maliciousEmail = "'; DROP TABLE users; --";
      
      const response = await request(server.getApp())
        .post(endpoint)
        .send({
          email: maliciousEmail,
          password: validBasePayload.password,
          name: validBasePayload.name,
        });

      expect(response.status).toBe(400);
      // El mensaje puede estar en 'error' o en 'errors[0]' o en 'message'
      const hasError = 
        response.body.hasOwnProperty('error') || 
        response.body.hasOwnProperty('errors') || 
        response.body.hasOwnProperty('message');
      expect(hasError).toBe(true);
      
      // El mensaje no debe revelar detalles de la estructura de la DB
      const errorMessage = JSON.stringify(response.body).toLowerCase();
      expect(errorMessage).not.toContain('sql');
      expect(errorMessage).not.toContain('table');
      expect(errorMessage).not.toContain('database');
    });
  });

  describe('XSS Prevention', () => {
    it('debe rechazar o sanitizar todos los payloads XSS en el nombre', async () => {
      const validEmail = createValidUser().email;
      const basePayload = {
        email: validEmail,
        password: validBasePayload.password,
      };

      const results = await testXssPrevention(endpoint, basePayload, server.getApp());
      
      // Validar que todos los payloads XSS fueron manejados
      assertSecurityResults(results, 'XSS Prevention');
      
      // Generar reporte para documentación
      const report = generateSecurityReport('XSS Prevention Test', results);
      console.log(report);
    });

    it('debe prevenir almacenamiento de scripts en la respuesta', async () => {
      const maliciousName = '<script>alert("XSS")</script>';
      const validEmail = createValidUser().email;
      
      const response = await request(server.getApp())
        .post(endpoint)
        .send({
          email: validEmail,
          password: validBasePayload.password,
          name: maliciousName,
        });

      // Opción A: Rechazo completo (recomendado)
      if (response.status === 200 || response.status === 201) {
        // Si fue aceptado, verificar que el nombre fue sanitizado
        const userData = response.body.data || response.body;
        expect(userData.name).not.toContain('<script>');
        expect(userData.name).not.toContain('alert');
      } else {
        // Opción B: Rechazado completamente
        expect(response.status).toBe(400);
      }
    });
  });

  describe('NoSQL Injection Prevention', () => {
    it('debe rechazar objetos MongoDB-style en el payload', async () => {
      const nosqlPayloads = [
        { email: { $ne: null }, password: 'SecurePass123!', name: 'Test' },
        { email: 'test@example.com', password: { $gt: '' }, name: 'Test' },
        { email: 'test@example.com', password: 'SecurePass123!', name: { $regex: '.*' } },
      ];

      for (const payload of nosqlPayloads) {
        const response = await request(server.getApp()).post(endpoint).send(payload);
        
        // Debe ser rechazado por validación de tipos
        expect(response.status).toBe(400);
      }
    });
  });

  describe('Path Traversal Prevention', () => {
    it('debe rechazar path traversal en el nombre', async () => {
      const pathTraversalNames = [
        '../../../etc/passwd',
        '..\\..\\..\\windows\\system32',
        '....//....//etc/passwd',
      ];

      const validEmail = createValidUser().email;

      for (const name of pathTraversalNames) {
        const response = await request(server.getApp())
          .post(endpoint)
          .send({
            email: validEmail,
            password: validBasePayload.password,
            name,
          });

        // Debe ser rechazado o sanitizado
        expect(response.status).toBeGreaterThanOrEqual(400);
      }
    });
  });

  describe('Input Length Validation', () => {
    it('debe rechazar emails excesivamente largos', async () => {
      const longEmail = `${'a'.repeat(300)}@example.com`;
      
      const response = await request(server.getApp())
        .post(endpoint)
        .send({
          email: longEmail,
          password: validBasePayload.password,
          name: validBasePayload.name,
        });

      expect(response.status).toBe(400);
    });

    it('debe rechazar nombres excesivamente largos', async () => {
      const validEmail = createValidUser().email;
      const longName = 'a'.repeat(300);
      
      const response = await request(server.getApp())
        .post(endpoint)
        .send({
          email: validEmail,
          password: validBasePayload.password,
          name: longName,
        });

      expect(response.status).toBe(400);
    });
  });

  describe('Content-Type Validation', () => {
    it('debe rechazar Content-Type incorrecto', async () => {
      const validEmail = createValidUser().email;
      
      const response = await request(server.getApp())
        .post(endpoint)
        .set('Content-Type', 'text/plain')
        .send(`email=${validEmail}&password=SecurePass123!&name=Test`);

      // Nota: El servidor actual no tiene middleware de validación de Content-Type
      // pero express.json() rechazará automáticamente cuerpos no-JSON con error 400
      expect([400, 415]).toContain(response.status);
    });

    it('debe aceptar application/json correctamente', async () => {
      const validEmail = createValidUser().email;
      
      const response = await request(server.getApp())
        .post(endpoint)
        .set('Content-Type', 'application/json')
        .send({
          email: validEmail,
          password: validBasePayload.password,
          name: validBasePayload.name,
        });

      expect([200, 201]).toContain(response.status);
    });
  });
});
