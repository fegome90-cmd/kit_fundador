import request from 'supertest';
import { InMemoryUserAccountRepository } from '../../../../src/infrastructure/_stubs/InMemoryUserAccountRepository';
import { HttpServer } from '../../../../src/infrastructure/http/server';

describe('User Registration API Contract', () => {
  let repository: InMemoryUserAccountRepository;
  let server: HttpServer;

  beforeEach(() => {
    repository = new InMemoryUserAccountRepository(); // ← INSTANCIA REQUERIDA
    repository.clear(); // ← ESTADO LIMPIO ANTES DE CADA TEST
    server = new HttpServer({ port: 3000, environment: 'test' });
  });

  afterEach(() => {
    // Note: HttpServer doesn't have a stop() method in current implementation
    // Server cleanup will be handled by process termination
  });

  it('should register a new user successfully', async () => {
    const uniqueUser = {
      email: `test${Date.now()}@example.com`,
      name: "TestUser",
      password: "SecurePass123!",
      role: "user"
    };

    const response = await request(server.getApp())
      .post('/api/users/register')
      .send(uniqueUser);

    expect(response.status).toBe(201);
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
  });
});
