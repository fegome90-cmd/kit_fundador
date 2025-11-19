/**
 * Simplified End-to-End User Registration Tests
 * Tests complete workflow: API → Repository → Validation
 */

import request from 'supertest';
import { HttpServer } from '../../src/infrastructure/http/server';

describe('User Registration E2E Workflow', () => {
  let server: HttpServer;

  beforeEach(async () => {
    // ✅ ADR-003 Compliance: Test isolation - Server only
    server = new HttpServer({ port: 0, environment: 'test' });
    server.start();  // Fixed: Remove await - server.start() is void
  });

  afterEach(async () => {
    await server.stop(); // ✅ Limpieza completa
  });

  it('should register user through complete E2E workflow with API verification', async () => {
    // Arrange: Test data
    const userData = {
      email: `e2e-simple-${Date.now()}@example.com`,
      name: 'E2E Simple Test User',
      password: 'SecurePass123!',
      role: 'user'
    };

    // Act: API Request
    const apiResponse = await request(server.getApp())
      .post('/api/users/register')
      .send(userData);

    // Assert: API Response Structure
    expect(apiResponse.status).toBe(201);
    expect(apiResponse.body.success).toBe(true);
    expect(apiResponse.body.data).toHaveProperty('userId');
    expect(apiResponse.body.data).toHaveProperty('email');
    expect(apiResponse.body.data.email).toBe(userData.email);
    expect(apiResponse.body.data).toHaveProperty('name');
    expect(apiResponse.body.data).toHaveProperty('role');
    expect(apiResponse.body.data).toHaveProperty('createdAt');

    // Assert: Response Values
    expect(typeof apiResponse.body.data.userId).toBe('string');
    expect(typeof apiResponse.body.data.name).toBe('string');
    expect(typeof apiResponse.body.data.role).toBe('string');
    expect(typeof apiResponse.body.data.createdAt).toBe('string');

    console.log(`E2E Registration: User ${apiResponse.body.data.userId} created successfully`);
  });

  it('should handle E2E error workflow with proper error handling', async () => {
    // Arrange: Invalid user data
    const invalidUserData = {
      email: 'invalid-email-format', // ← INVÁLIDO
      name: 'Test User',
      password: 'ValidPass123!',
      role: 'user'
    };

    // Act: API Request
    const apiResponse = await request(server.getApp())
      .post('/api/users/register')
      .send(invalidUserData);

    // Assert: API Error Response
    expect(apiResponse.status).toBe(400);
    expect(apiResponse.body.success).toBe(false);
    expect(apiResponse.body.errors).toContain('Email must be a valid email address');

    // Assert: Repository Layer - No User Created (verified through API response only)
    expect(apiResponse.body.success).toBe(false);
    expect(apiResponse.body.errors).toContain('Email must be a valid email address');
  });

  it('should handle E2E duplicate user workflow with conflict resolution', async () => {
    // Arrange: User data
    const duplicateUserData = {
      email: `duplicate-simple-${Date.now()}@example.com`,
      name: 'Duplicate Simple Test User',
      password: 'ValidPass123!',
      role: 'user'
    };

    // Act: First Registration (Success)
    const firstResponse = await request(server.getApp())
      .post('/api/users/register')
      .send(duplicateUserData);

    // Assert: First Registration Success
    expect(firstResponse.status).toBe(201);
    expect(firstResponse.body.success).toBe(true);

    // Act: Second Registration (Conflict)
    const secondResponse = await request(server.getApp())
      .post('/api/users/register')
      .send(duplicateUserData);

    // Assert: Second Registration Conflict
    expect(secondResponse.status).toBe(409);
    expect(secondResponse.body.success).toBe(false);
    expect(secondResponse.body.errors.some((error: string) =>
      error.includes('already exists'))).toBe(true);

    console.log(`E2E Duplicate Test: Conflict handled correctly`);
  });

  describe('Performance & Integration Tests', () => {
    it('should meet performance requirements for E2E workflow', async () => {
      // Arrange: Performance test data
      const userData = {
        email: `perf-simple-${Date.now()}@example.com`,
        name: 'Performance Simple Test User',
        password: 'ValidPass123!',
        role: 'user'
      };

      // Act: Measure performance
      const startTime = performance.now();
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send(userData);
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Assert: Performance Requirements
      expect(response.status).toBe(201);
      expect(duration).toBeLessThan(500); // ← < 500ms requirement

      console.log(`E2E Performance: ${duration.toFixed(2)}ms`);
    });
  });
});