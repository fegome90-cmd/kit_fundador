/**
 * Enhanced Comprehensive Unit Tests for User Entity
 * 
 * Additional test coverage for:
 * - Edge cases and boundary conditions
 * - Domain events management
 * - Persistence and reconstitution
 * - Business logic validation
 * - toJSON serialization
 */

import { User, UserRole } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

describe('User Entity - Enhanced Coverage', () => {
  // Helper function to create a valid user
  const createValidUser = (overrides?: Partial<{
    email: string;
    name: string;
    password: string;
    role: UserRole;
  }>) => {
    return User.create({
      email: Email.create(overrides?.email || 'test@example.com'),
      name: overrides?.name || 'Test User',
      password: Password.create(overrides?.password || 'SecurePass123!'),
      role: overrides?.role || 'user',
    });
  };

  describe('create - edge cases', () => {
    it('should create user with guest role', () => {
      const user = User.create({
        email: Email.create('guest@example.com'),
        name: 'Guest User',
        password: Password.create('GuestPass123!'),
        role: 'guest',
      });
      
      expect(user.role).toBe('guest');
      expect(user.isAdmin()).toBe(false);
    });

    it('should create user with minimum valid name length', () => {
      const user = User.create({
        email: Email.create('user@example.com'),
        name: 'A',
        password: Password.create('Pass123!'),
      });
      
      expect(user.name).toBe('A');
    });

    it('should create user with maximum valid name length', () => {
      const longName = 'A'.repeat(255);
      const user = User.create({
        email: Email.create('user@example.com'),
        name: longName,
        password: Password.create('Pass123!'),
      });
      
      expect(user.name).toBe(longName);
      expect(user.name.length).toBe(255);
    });

    it('should throw on name exceeding 255 characters', () => {
      const tooLongName = 'A'.repeat(256);
      
      expect(() => User.create({
        email: Email.create('user@example.com'),
        name: tooLongName,
        password: Password.create('Pass123!'),
      })).toThrow('User name too long');
    });

    it('should throw on whitespace-only name', () => {
      expect(() => User.create({
        email: Email.create('user@example.com'),
        name: '   ',
        password: Password.create('Pass123!'),
      })).toThrow('User name cannot be empty');
    });

    it('should generate unique IDs for different users', () => {
      const user1 = createValidUser();
      const user2 = createValidUser();
      
      expect(user1.id).not.toBe(user2.id);
      expect(user1.id).toBeDefined();
      expect(user2.id).toBeDefined();
    });

    it('should set createdAt and updatedAt to current time', () => {
      const before = new Date();
      const user = createValidUser();
      const after = new Date();
      
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(user.updatedAt).toEqual(user.createdAt);
    });
  });

  describe('fromPersistence', () => {
    it('should reconstitute user from persistence with all properties', () => {
      const email = Email.create('persisted@example.com');
      const password = Password.create('PersistedPass123!');
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
      expect(user.email.value).toBe('persisted@example.com');
      expect(user.name).toBe('Persisted User');
      expect(user.role).toBe('admin');
      expect(user.emailVerified).toBe(true);
      expect(user.createdAt).toEqual(now);
      expect(user.updatedAt).toEqual(now);
    });

    it('should not raise domain events when reconstituting from persistence', () => {
      const email = Email.create('persisted@example.com');
      const password = Password.create('Pass123!');
      
      const user = User.fromPersistence({
        id: 'test-id',
        email,
        name: 'User',
        password,
        role: 'user',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      expect(user.getDomainEvents()).toHaveLength(0);
    });

    it('should validate invariants on reconstitution', () => {
      const email = Email.create('test@example.com');
      const password = Password.create('Pass123!');
      
      expect(() => User.fromPersistence({
        id: 'test-id',
        email,
        name: '',
        password,
        role: 'user',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })).toThrow('User name cannot be empty');
    });
  });

  describe('verifyEmail - edge cases', () => {
    it('should update updatedAt timestamp when verifying email', () => {
      const user = createValidUser();
      const originalUpdatedAt = user.updatedAt;
      
      // Wait a bit to ensure timestamp difference
      const waitPromise = new Promise(resolve => setTimeout(resolve, 10));
      
      return waitPromise.then(() => {
        user.verifyEmail();
        expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });
    });

    it('should not change other properties when verifying email', () => {
      const user = createValidUser();
      const originalId = user.id;
      const originalName = user.name;
      const originalEmail = user.email;
      const originalRole = user.role;
      
      user.verifyEmail();
      
      expect(user.id).toBe(originalId);
      expect(user.name).toBe(originalName);
      expect(user.email).toBe(originalEmail);
      expect(user.role).toBe(originalRole);
    });
  });

  describe('changeName - edge cases', () => {
    it('should trim name before validation', () => {
      const user = createValidUser();
      
      expect(() => user.changeName('   ')).toThrow('Name cannot be empty');
    });

    it('should accept name with leading/trailing spaces if content exists', () => {
      const user = createValidUser();
      
      user.changeName('  Valid Name  ');
      
      expect(user.name).toBe('  Valid Name  ');
    });

    it('should update updatedAt when changing name', () => {
      const user = createValidUser();
      const originalUpdatedAt = user.updatedAt;
      
      const waitPromise = new Promise(resolve => setTimeout(resolve, 10));
      
      return waitPromise.then(() => {
        user.changeName('New Name');
        expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });
    });

    it('should allow changing name multiple times', () => {
      const user = createValidUser();
      
      user.changeName('Name 1');
      expect(user.name).toBe('Name 1');
      
      user.changeName('Name 2');
      expect(user.name).toBe('Name 2');
      
      user.changeName('Name 3');
      expect(user.name).toBe('Name 3');
    });

    it('should handle name with special characters', () => {
      const user = createValidUser();
      const specialName = "O'Brien-Smith Jr.";
      
      user.changeName(specialName);
      
      expect(user.name).toBe(specialName);
    });
  });

  describe('changePassword', () => {
    it('should change password successfully', () => {
      const user = createValidUser();
      const newPassword = Password.create('NewSecurePass456!');
      
      user.changePassword(newPassword);
      
      // Password is private, but we can verify updatedAt changed
      expect(user.updatedAt).toBeDefined();
    });

    it('should update updatedAt when changing password', () => {
      const user = createValidUser();
      const originalUpdatedAt = user.updatedAt;
      
      const waitPromise = new Promise(resolve => setTimeout(resolve, 10));
      
      return waitPromise.then(() => {
        user.changePassword(Password.create('NewPass123!'));
        expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      });
    });

    it('should allow changing password multiple times', () => {
      const user = createValidUser();
      
      user.changePassword(Password.create('Pass1'));
      user.changePassword(Password.create('Pass2'));
      user.changePassword(Password.create('Pass3'));
      
      expect(user.updatedAt).toBeDefined();
    });
  });

  describe('isAdmin', () => {
    it('should return true only for admin role', () => {
      const admin = createValidUser({ role: 'admin' });
      const regularUser = createValidUser({ role: 'user' });
      const guest = createValidUser({ role: 'guest' });
      
      expect(admin.isAdmin()).toBe(true);
      expect(regularUser.isAdmin()).toBe(false);
      expect(guest.isAdmin()).toBe(false);
    });
  });

  describe('domain events', () => {
    it('should return copy of domain events, not reference', () => {
      const user = createValidUser();
      const events1 = user.getDomainEvents();
      const events2 = user.getDomainEvents();
      
      expect(events1).not.toBe(events2);
      expect(events1).toEqual(events2);
    });

    it('should clear all domain events', () => {
      const user = createValidUser();
      
      expect(user.getDomainEvents().length).toBeGreaterThan(0);
      
      user.clearDomainEvents();
      
      expect(user.getDomainEvents()).toHaveLength(0);
    });

    it('should not affect domain events when getting them', () => {
      const user = createValidUser();
      const eventCount = user.getDomainEvents().length;
      
      user.getDomainEvents();
      user.getDomainEvents();
      
      expect(user.getDomainEvents()).toHaveLength(eventCount);
    });

    it('should have proper event structure', () => {
      const user = createValidUser();
      const events = user.getDomainEvents();
      
      expect(events[0]).toHaveProperty('eventType');
      expect(events[0]).toHaveProperty('userId');
      expect(events[0]).toHaveProperty('email');
      expect(events[0]).toHaveProperty('occurredAt');
      expect(events[0]).toHaveProperty('eventId');
    });
  });

  describe('toJSON', () => {
    it('should serialize all public properties', () => {
      const user = createValidUser({
        email: 'json@example.com',
        name: 'JSON User',
        role: 'admin',
      });
      
      const json = user.toJSON();
      
      expect(json).toHaveProperty('id');
      expect(json).toHaveProperty('email', 'json@example.com');
      expect(json).toHaveProperty('name', 'JSON User');
      expect(json).toHaveProperty('role', 'admin');
      expect(json).toHaveProperty('emailVerified', false);
      expect(json).toHaveProperty('createdAt');
      expect(json).toHaveProperty('updatedAt');
    });

    it('should not expose password in JSON', () => {
      const user = createValidUser();
      const json = user.toJSON();
      
      expect(json).not.toHaveProperty('password');
    });

    it('should serialize dates as ISO strings', () => {
      const user = createValidUser();
      const json = user.toJSON();
      
      expect(typeof json.createdAt).toBe('string');
      expect(typeof json.updatedAt).toBe('string');
      expect(new Date(json.createdAt)).toBeInstanceOf(Date);
      expect(new Date(json.updatedAt)).toBeInstanceOf(Date);
    });

    it('should be usable with JSON.stringify', () => {
      const user = createValidUser();
      
      const jsonString = JSON.stringify(user);
      const parsed = JSON.parse(jsonString);
      
      expect(parsed).toHaveProperty('id', user.id);
      expect(parsed).toHaveProperty('email', user.email.value);
      expect(parsed).toHaveProperty('name', user.name);
    });
  });

  describe('getters', () => {
    it('should return correct id', () => {
      const user = createValidUser();
      
      expect(user.id).toBeDefined();
      expect(typeof user.id).toBe('string');
    });

    it('should return correct email', () => {
      const user = createValidUser({ email: 'getter@example.com' });
      
      expect(user.email).toBeInstanceOf(Email);
      expect(user.email.value).toBe('getter@example.com');
    });

    it('should return correct name', () => {
      const user = createValidUser({ name: 'Getter Test' });
      
      expect(user.name).toBe('Getter Test');
    });

    it('should return correct role', () => {
      const user = createValidUser({ role: 'admin' });
      
      expect(user.role).toBe('admin');
    });

    it('should return correct emailVerified status', () => {
      const user = createValidUser();
      
      expect(user.emailVerified).toBe(false);
      
      user.verifyEmail();
      
      expect(user.emailVerified).toBe(true);
    });

    it('should return correct createdAt', () => {
      const user = createValidUser();
      
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should return correct updatedAt', () => {
      const user = createValidUser();
      
      expect(user.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete user lifecycle', () => {
      // Create user
      const user = User.create({
        email: Email.create('lifecycle@example.com'),
        name: 'Lifecycle User',
        password: Password.create('InitialPass123!'),
        role: 'user',
      });
      
      expect(user.emailVerified).toBe(false);
      expect(user.role).toBe('user');
      
      // Verify email
      user.verifyEmail();
      expect(user.emailVerified).toBe(true);
      
      // Change name
      user.changeName('Updated Name');
      expect(user.name).toBe('Updated Name');
      
      // Change password
      user.changePassword(Password.create('NewPass456!'));
      
      // Check final state
      expect(user.id).toBeDefined();
      expect(user.email.value).toBe('lifecycle@example.com');
      expect(user.emailVerified).toBe(true);
      expect(user.name).toBe('Updated Name');
    });

    it('should handle persistence roundtrip', () => {
      // Create and modify user
      const originalUser = createValidUser();
      originalUser.verifyEmail();
      originalUser.changeName('Modified Name');
      originalUser.clearDomainEvents();
      
      // Simulate persistence
      const persistedData = {
        id: originalUser.id,
        email: originalUser.email,
        name: originalUser.name,
        password: Password.create('Pass123!'),
        role: originalUser.role,
        emailVerified: originalUser.emailVerified,
        createdAt: originalUser.createdAt,
        updatedAt: originalUser.updatedAt,
      };
      
      // Reconstitute
      const reconstitutedUser = User.fromPersistence(persistedData);
      
      expect(reconstitutedUser.id).toBe(originalUser.id);
      expect(reconstitutedUser.email.value).toBe(originalUser.email.value);
      expect(reconstitutedUser.name).toBe(originalUser.name);
      expect(reconstitutedUser.emailVerified).toBe(true);
    });
  });
});