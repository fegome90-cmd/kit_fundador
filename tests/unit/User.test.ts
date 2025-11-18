/**
 * Example Unit Test for User Entity
 * 
 * Following TDD principles:
 * - Arrange: Setup test data
 * - Act: Execute the behavior
 * - Assert: Verify the outcome
 */

import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

const STRONG_PASSWORD = 'SecurePass123!';

describe('User Entity', () => {
  describe('create', () => {
    it('should create a valid user', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create(STRONG_PASSWORD);
      
      // Act
      const user = User.create({
        email,
        name: 'Test User',
        password,
        role: 'user',
      });
      
      // Assert
      expect(user.id).toBeDefined();
      expect(user.email.value).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.role).toBe('user');
      expect(user.emailVerified).toBe(false);
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should raise UserCreated domain event', () => {
      // Arrange
      const email = Email.create('test@example.com');
      const password = Password.create(STRONG_PASSWORD);
      
      // Act
      const user = User.create({
        email,
        name: 'Test User',
        password,
      });
      
      // Assert
      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe('UserCreated');
    });

    it('should default to user role if not specified', () => {
      const email = Email.create('test@example.com');
      const password = Password.create(STRONG_PASSWORD);
      
      const user = User.create({
        email,
        name: 'Test User',
        password,
      });
      
      expect(user.role).toBe('user');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email successfully', () => {
      // Arrange
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Test User',
        password: Password.create(STRONG_PASSWORD),
      });
      
      // Act
      user.verifyEmail();
      
      // Assert
      expect(user.emailVerified).toBe(true);
    });

    it('should throw if email already verified', () => {
      // Arrange
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Test User',
        password: Password.create(STRONG_PASSWORD),
      });
      user.verifyEmail();
      
      // Act & Assert
      expect(() => user.verifyEmail()).toThrow('Email already verified');
    });
  });

  describe('changeName', () => {
    it('should change name successfully', () => {
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Old Name',
        password: Password.create(STRONG_PASSWORD),
      });
      
      user.changeName('New Name');
      
      expect(user.name).toBe('New Name');
    });

    it('should throw if name is empty', () => {
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Test User',
        password: Password.create(STRONG_PASSWORD),
      });
      
      expect(() => user.changeName('')).toThrow('Name cannot be empty');
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin users', () => {
      const user = User.create({
        email: Email.create('admin@example.com'),
        name: 'Admin User',
        password: Password.create('SecurePass123!'),
        role: 'admin',
      });
      
      expect(user.isAdmin()).toBe(true);
    });

    it('should return false for regular users', () => {
      const user = User.create({
        email: Email.create('user@example.com'),
        name: 'Regular User',
        password: Password.create('SecurePass123!'),
        role: 'user',
      });
      
      expect(user.isAdmin()).toBe(false);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Test User',
        password: Password.create('OldPass1234!'),
      });

      const newPassword = Password.create('NewPass4567!');
      user.changePassword(newPassword);
      
      expect(user.updatedAt).toBeDefined();
    });

    it('should update updatedAt timestamp', () => {
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Test User',
        password: Password.create(STRONG_PASSWORD),
      });

      const oldUpdatedAt = user.updatedAt;

      user.changePassword(Password.create('NewSecurePass123!'));

      expect(user.updatedAt).not.toBe(oldUpdatedAt);
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(oldUpdatedAt.getTime());
    });
  });

  describe('fromPersistence', () => {
    it('should reconstitute user from persistence', () => {
      const email = Email.create('persisted@example.com');
      const password = Password.create(STRONG_PASSWORD);
      const now = new Date();
      
      const user = User.fromPersistence({
        id: 'test-id-123',
        email,
        name: 'Persisted User',
        password,
        role: 'admin',
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      });
      
      expect(user.id).toBe('test-id-123');
      expect(user.emailVerified).toBe(true);
      expect(user.role).toBe('admin');
    });
  });

  describe('toJSON', () => {
    it('should serialize to JSON without password', () => {
      const user = User.create({
        email: Email.create('json@example.com'),
        name: 'JSON User',
        password: Password.create(STRONG_PASSWORD),
        role: 'user',
      });
      
      const json = user.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email', 'json@example.com');
      expect(json).toHaveProperty('name', 'JSON User');
      expect(json).toHaveProperty('role', 'user');
      expect(json).not.toHaveProperty('password');
    });
  });

  describe('domain events', () => {
    it('should clear domain events', () => {
      const user = User.create({
        email: Email.create('test@example.com'),
        name: 'Test User',
        password: Password.create(STRONG_PASSWORD),
      });
      
      expect(user.getDomainEvents().length).toBeGreaterThan(0);
      
      user.clearDomainEvents();
      
      expect(user.getDomainEvents()).toHaveLength(0);
    });
  });
});
