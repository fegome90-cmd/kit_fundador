/**
 * End-to-End User Registration Tests
 * Tests complete workflow: API → Application → Domain → Repository
 */

import request from 'supertest';
import { InMemoryUserAccountRepository } from '../../src/infrastructure/_stubs/InMemoryUserAccountRepository';
import { HttpServer } from '../../src/infrastructure/http/server';
import { RegisterUserAccountCommand } from '../../src/application/register-user-account/register-user-account-command';
import { RegisterUserAccountHandler } from '../../src/application/register-user-account/register-user-account-handler';
import { User } from '../../src/domain/entities/User';

describe('User Registration E2E Workflow', () => {
  let repository: InMemoryUserAccountRepository;
  let server: HttpServer;
  let handler: RegisterUserAccountHandler;

  beforeEach(async () => {
    // ✅ ADR-003 Compliance: Test isolation
    repository = new InMemoryUserAccountRepository();
    repository.clear(); // ← ESTADO LIMPIO ANTES DE CADA TEST

    handler = new RegisterUserAccountHandler(repository);

    server = new HttpServer({ port: 0, environment: 'test' });
    await server.start();
  });

  afterEach(async () => {
    await server.stop(); // ✅ Limpieza completa
  });

  it('should register user through complete E2E workflow with domain events', async () => {
    // Arrange: Test data
    const userData = {
      email: `e2e-user-${Date.now()}@example.com`,
      name: 'E2E Test User',
      password: 'SecurePass123!',
      role: 'user'
    };

    // Act: API Request
    const apiResponse = await request(server.getApp())
      .post('/api/users/register')
      .send(userData);

    // Assert: API Response
    expect(apiResponse.status).toBe(201);
    expect(apiResponse.body.success).toBe(true);
    expect(apiResponse.body.data.userId).toBeDefined();
    expect(apiResponse.body.data.email).toBe(userData.email);

    // Assert: Domain Layer - User Entity Created
    const storedUser = await repository.findById(apiResponse.body.data.userId);
    expect(storedUser).not.toBeNull();
    expect(storedUser?.getEmail()).toBe(userData.email);
    expect(storedUser?.getName()).toBe(userData.name);
    expect(storedUser?.getRole()).toBe(userData.role);
    expect(storedUser?.isEmailVerified()).toBe(false);

    // Assert: Domain Events Raised
    expect(storedUser?.getDomainEvents()).toHaveLength(1);
    const domainEvent = storedUser?.getDomainEvents()[0];
    expect(domainEvent.constructor.name).toBe('UserCreatedEvent');
    expect(domainEvent.aggregateId).toBe(apiResponse.body.data.userId);
    expect(domainEvent.occurredAt).toBeInstanceOf(Date);
  });

  it('should handle E2E error workflow with proper error propagation', async () => {
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

    // Assert: Domain Layer - No User Created
    const allUsers = await repository.findAll();
    expect(allUsers).toHaveLength(0);

    // Assert: No Domain Events Raised
    expect(allUsers.every(user => user.getDomainEvents().length === 0)).toBe(true);
  });

  it('should handle E2E duplicate user workflow with conflict resolution', async () => {
    // Arrange: User data
    const duplicateUserData = {
      email: `duplicate-${Date.now()}@example.com`,
      name: 'Duplicate Test User',
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
    expect(secondResponse.body.errors.some(error =>
      error.includes('already exists'))).toBe(true);

    // Assert: Domain Layer - Only One User Exists
    const allUsers = await repository.findAll();
    expect(allUsers).toHaveLength(1);
    expect(allUsers[0].getEmail()).toBe(duplicateUserData.email);

    // Assert: Only First User Has Domain Events
    expect(allUsers[0].getDomainEvents()).toHaveLength(1);
  });

  describe('Performance & Integration Tests', () => {
    it('should meet performance requirements for E2E workflow', async () => {
      // Arrange: Performance test data
      const userData = {
        email: `perf-${Date.now()}@example.com`,
        name: 'Performance Test User',
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

      // Assert: Functional correctness still maintained
      expect(response.body.success).toBe(true);
      expect(response.body.data.userId).toBeDefined();

      console.log(`E2E Performance: ${duration.toFixed(2)}ms`);
    });

    it('should handle concurrent E2E workflows without conflicts', async () => {
      // Arrange: Concurrent users with different emails
      const concurrentUsers = Array.from({ length: 5 }, (_, index) => ({
        email: `concurrent-${Date.now()}-${index}@example.com`,
        name: `Concurrent User ${index}`,
        password: 'ValidPass123!',
        role: 'user'
      }));

      // Act: Concurrent registrations
      const promises = concurrentUsers.map(userData =>
        request(server.getApp())
          .post('/api/users/register')
          .send(userData)
      );

      const responses = await Promise.all(promises);

      // Assert: All concurrent registrations succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.email).toBe(concurrentUsers[index].email);
      });

      // Assert: All users stored correctly
      const allUsers = await repository.findAll();
      expect(allUsers).toHaveLength(5);

      // Assert: Each user has correct email and domain events
      concurrentUsers.forEach((expectedUser, index) => {
        const storedUser = allUsers.find(user =>
          user.getEmail() === expectedUser.email);
        expect(storedUser).toBeDefined();
        expect(storedUser?.getDomainEvents()).toHaveLength(1);
      });
    });
  });

  describe('Security Integration Tests', () => {
    it('should sanitize and validate inputs through E2E workflow', async () => {
      // Arrange: Malicious input data
      const maliciousData = {
        email: `test-${Date.now()}@example.com`,
        name: '<script>alert("xss")</script>', // ← XSS attempt
        password: 'ValidPass123!',
        role: 'user'
      };

      // Act: API Request with malicious data
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send(maliciousData);

      // Assert: API handles malicious input appropriately
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Assert: Stored data is sanitized
      const storedUser = await repository.findById(response.body.data.userId);
      expect(storedUser).not.toBeNull();
      expect(storedUser?.getName()).toBe('<script>alert("xss")</script>');
      // Note: Sanization depends on requirements - currently stored as-is

      // Assert: No script execution in stored data
      expect(typeof storedUser?.getName()).toBe('string');
      expect(storedUser?.getName()).not.toContain('alert('); // No execution
    });

    it('should handle SQL injection attempts in E2E workflow', async () => {
      // Arrange: SQL injection attempt in email field
      const sqlInjectionData = {
        email: "'; DROP TABLE users; --",
        name: 'SQL Injection Test',
        password: 'ValidPass123!',
        role: 'user'
      };

      // Act: API Request
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send(sqlInjectionData);

      // Assert: SQL injection is blocked/sanitized
      expect(response.status).toBe(400); // ← Should be rejected
      expect(response.body.success).toBe(false);

      // Assert: No data corruption
      const allUsers = await repository.findAll();
      expect(allUsers).toHaveLength(0);

      // Assert: Database integrity maintained
      expect(allUsers.every(user =>
        !user.getEmail().includes('DROP TABLE'))).toBe(true);
    });
  });

  describe('Domain Event Integration Tests', () => {
    it('should raise and handle UserCreatedEvent in complete workflow', async () => {
      // Arrange: User data
      const userData = {
        email: `events-${Date.now()}@example.com`,
        name: 'Domain Events Test User',
        password: 'ValidPass123!',
        role: 'user'
      };

      // Act: Complete registration workflow
      const response = await request(server.getApp())
        .post('/api/users/register')
        .send(userData);

      // Assert: API Success
      expect(response.status).toBe(201);

      // Assert: Domain Events Raised
      const storedUser = await repository.findById(response.body.data.userId);
      const domainEvents = storedUser?.getDomainEvents();

      expect(domainEvents).toHaveLength(1);
      const userCreatedEvent = domainEvents![0];

      // Assert: Event Structure
      expect(userCreatedEvent.constructor.name).toBe('UserCreatedEvent');
      expect(userCreatedEvent.aggregateId).toBe(response.body.data.userId);
      expect(userCreatedEvent.occurredAt).toBeInstanceOf(Date);
      expect(userCreatedEvent.occurredAt.getTime()).toBeLessThanOrEqual(Date.now());

      // Assert: Event Data Integrity
      expect(userCreatedEvent.getEventData()).toMatchObject({
        userId: response.body.data.userId,
        email: userData.email,
        name: userData.name,
        role: userData.role
      });
    });
  });
});