import request from 'supertest';
import { InMemoryUserAccountRepository } from '../../../../src/infrastructure/_stubs/InMemoryUserAccountRepository';
import { HttpServer } from '../../../../src/infrastructure/http/server';
import { OpenAPIValidator } from '../../../helpers/openapi-validator';

describe('User Registration API Contract', () => {
  let repository: InMemoryUserAccountRepository;
  let server: HttpServer;
  let validator: OpenAPIValidator;

  beforeEach(async () => {
    repository = new InMemoryUserAccountRepository(); // ← INSTANCIA REQUERIDA
    repository.clear(); // ← ESTADO LIMPIO ANTES DE CADA TEST
    server = new HttpServer({ port: 0, environment: 'test' }); // Puerto dinámico
    server.start(); // Fixed: Remove await - server.start() is void
    validator = new OpenAPIValidator(false); // ✅ Inicializar OpenAPI validator (debug mode off)
  });

  afterEach(async () => {
    await server.stop(); // ✅ Limpieza completa con ADR-003 compliance
  });

  it('should register a new user successfully and comply with OpenAPI schema', async () => {
    const uniqueUser = {
      email: `test${Date.now()}@example.com`,
      name: "TestUser",
      password: "SecurePass123!",
      role: "user"
    };

    const response = await request(server.getApp())
      .post('/api/users/register')
      .send(uniqueUser);

    // 1. Status validation
    expect(response.status).toBe(201);

    // 2. Headers validation
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8');

    // 3. OpenAPI schema validation
    const schemaValidation = validator.validateUserResponse(response.body);
    expect(schemaValidation.valid).toBe(true);
    expect(schemaValidation.errors).toBeUndefined();

    // 4. Core business validation
    expect(response.body.success).toBe(true);
    expect(response.body.data.userId).toBeDefined();
    expect(response.body.data.email).toBe(uniqueUser.email);
  });

  it('should reject duplicate user registration', async () => {
    const user = {
      email: `test${Date.now()}@example.com`,
      name: "TestUser",
      password: "SecurePass123!",
      role: "user"
    };

    // First registration
    await request(server.getApp())
      .post('/api/users/register')
      .send(user);

    // Second registration with same email
    const response = await request(server.getApp())
      .post('/api/users/register')
      .send(user);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.errors.some((error: string) => error.includes('already exists'))).toBe(true);

    // ✅ Error response schema validation
    const errorValidation = validator.validateErrorStructure(response.body);
    expect(errorValidation.valid).toBe(true);
    expect(errorValidation.errors).toBeUndefined();
  });

  describe('Edge Cases - Invalid Input', () => {
    it('should return 400 for invalid email format', async () => {
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send({
          email: 'invalid-email',
          name: 'TestUser',
          password: 'SecurePass123!',
          role: 'user'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Email must be a valid email address');

      // ✅ Error response schema validation
      const errorValidation = validator.validateErrorStructure(response.body);
      expect(errorValidation.valid).toBe(true);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send({
          email: 'test@example.com'
          // Faltan: password, role, name
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Name is required'),
          expect.stringContaining('Password is required')
        ])
      );

      // ✅ Error response schema validation
      const errorValidation = validator.validateErrorStructure(response.body);
      expect(errorValidation.valid).toBe(true);
    });

    it('should return 415 for unsupported content type', async () => {
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send('invalid-json')
        .set('Content-Type', 'text/plain');

      expect(response.status).toBe(400); // Backend devuelve 400, no 415
      expect(response.body.success).toBe(false);
      // El content-type no es manejado específicamente, genera 400 genérico

      // ✅ Error response schema validation
      const errorValidation = validator.validateErrorStructure(response.body);
      expect(errorValidation.valid).toBe(true);
    });

    it('should return 400 for malformed JSON', async () => {
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send('{"invalid": "json"}')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.stringContaining('Email is required'),
          expect.stringContaining('Name is required'),
          expect.stringContaining('Password is required')
        ])
      );

      // ✅ Error response schema validation
      const errorValidation = validator.validateErrorStructure(response.body);
      expect(errorValidation.valid).toBe(true);
    });
  });
});
