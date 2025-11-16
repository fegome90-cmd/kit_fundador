/**
 * Comprehensive Unit Tests for Email Value Object
 * 
 * Testing Strategy:
 * - Happy path: valid email creation
 * - Edge cases: various email formats
 * - Failure cases: invalid formats, blocked domains, length limits
 * - Value object behavior: immutability, equality, serialization
 */

import { Email } from '@domain/value-objects/Email';

describe('Email Value Object', () => {
  describe('create', () => {
    describe('happy path', () => {
      it('should create email with valid format', () => {
        const email = Email.create('user@example.com');
        
        expect(email.value).toBe('user@example.com');
      });

      it('should create email with subdomain', () => {
        const email = Email.create('user@mail.example.com');
        
        expect(email.value).toBe('user@mail.example.com');
      });

      it('should create email with numbers', () => {
        const email = Email.create('user123@example.com');
        
        expect(email.value).toBe('user123@example.com');
      });

      it('should create email with dots in local part', () => {
        const email = Email.create('first.last@example.com');
        
        expect(email.value).toBe('first.last@example.com');
      });

      it('should create email with plus sign', () => {
        const email = Email.create('user+tag@example.com');
        
        expect(email.value).toBe('user+tag@example.com');
      });

      it('should create email with hyphen in domain', () => {
        const email = Email.create('user@my-company.com');
        
        expect(email.value).toBe('user@my-company.com');
      });

      it('should create email with numbers in domain', () => {
        const email = Email.create('user@company123.com');
        
        expect(email.value).toBe('user@company123.com');
      });
    });

    describe('edge cases', () => {
      it('should handle email at minimum length', () => {
        const email = Email.create('a@b.c');
        
        expect(email.value).toBe('a@b.c');
      });

      it('should handle email with long local part', () => {
        const longLocal = 'a'.repeat(60);
        const email = Email.create(`${longLocal}@example.com`);
        
        expect(email.value).toBe(`${longLocal}@example.com`);
      });

      it('should handle email with long domain', () => {
        const longDomain = 'a'.repeat(50);
        const email = Email.create(`user@${longDomain}.com`);
        
        expect(email.value).toBe(`user@${longDomain}.com`);
      });

      it('should handle email with multiple subdomains', () => {
        const email = Email.create('user@mail.corp.example.com');
        
        expect(email.value).toBe('user@mail.corp.example.com');
      });

      it('should handle email with uppercase letters', () => {
        const email = Email.create('User@Example.COM');
        
        expect(email.value).toBe('User@Example.COM');
      });

      it('should handle email near max length (255 chars)', () => {
        const longEmail = 'a'.repeat(240) + '@example.com';
        const email = Email.create(longEmail);
        
        expect(email.value).toBe(longEmail);
      });
    });

    describe('validation failures', () => {
      it('should throw on empty email', () => {
        expect(() => Email.create('')).toThrow('Email cannot be empty');
      });

      it('should throw on null email', () => {
        expect(() => Email.create(null as any)).toThrow('Email cannot be empty');
      });

      it('should throw on undefined email', () => {
        expect(() => Email.create(undefined as any)).toThrow('Email cannot be empty');
      });

      it('should throw on email without @', () => {
        expect(() => Email.create('userexample.com')).toThrow('Invalid email format');
      });

      it('should throw on email without domain', () => {
        expect(() => Email.create('user@')).toThrow('Invalid email format');
      });

      it('should throw on email without local part', () => {
        expect(() => Email.create('@example.com')).toThrow('Invalid email format');
      });

      it('should throw on email without TLD', () => {
        expect(() => Email.create('user@example')).toThrow('Invalid email format');
      });

      it('should throw on email with spaces', () => {
        expect(() => Email.create('user @example.com')).toThrow('Invalid email format');
        expect(() => Email.create('user@ example.com')).toThrow('Invalid email format');
        expect(() => Email.create('user@example .com')).toThrow('Invalid email format');
      });

      it('should throw on email with multiple @', () => {
        expect(() => Email.create('user@@example.com')).toThrow('Invalid email format');
        expect(() => Email.create('user@name@example.com')).toThrow('Invalid email format');
      });

      it('should throw on email too long (> 255 chars)', () => {
        const tooLongEmail = 'a'.repeat(250) + '@example.com';
        expect(() => Email.create(tooLongEmail)).toThrow('Email too long');
      });

      it('should throw on blocked domain tempmail.com', () => {
        expect(() => Email.create('user@tempmail.com')).toThrow('Email domain not allowed: tempmail.com');
      });

      it('should throw on blocked domain throwaway.email', () => {
        expect(() => Email.create('user@throwaway.email')).toThrow('Email domain not allowed: throwaway.email');
      });

      it('should throw on email with only whitespace', () => {
        expect(() => Email.create('   ')).toThrow('Invalid email format');
      });

      it('should throw on email starting with dot', () => {
        expect(() => Email.create('.user@example.com')).toThrow('Invalid email format');
      });

      it('should throw on email ending with dot', () => {
        expect(() => Email.create('user.@example.com')).toThrow('Invalid email format');
      });

      it('should throw on domain starting with hyphen', () => {
        expect(() => Email.create('user@-example.com')).toThrow('Invalid email format');
      });

      it('should throw on domain ending with hyphen', () => {
        expect(() => Email.create('user@example-.com')).toThrow('Invalid email format');
      });
    });
  });

  describe('equals', () => {
    it('should return true for same email value', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return true for emails with different case', () => {
      const email1 = Email.create('User@Example.com');
      const email2 = Email.create('user@example.com');
      
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different emails', () => {
      const email1 = Email.create('user1@example.com');
      const email2 = Email.create('user2@example.com');
      
      expect(email1.equals(email2)).toBe(false);
    });

    it('should return false when comparing with non-Email object', () => {
      const email = Email.create('user@example.com');
      
      expect(email.equals('user@example.com' as any)).toBe(false);
      expect(email.equals(null as any)).toBe(false);
      expect(email.equals(undefined as any)).toBe(false);
      expect(email.equals({} as any)).toBe(false);
    });

    it('should handle equality for emails with different domains', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@different.com');
      
      expect(email1.equals(email2)).toBe(false);
    });
  });

  describe('immutability', () => {
    it('should not allow modification of internal value', () => {
      const email = Email.create('user@example.com');
      const originalValue = email.value;
      
      // Try to modify (should not work in TypeScript)
      // email.value = 'modified@example.com'; // This won't compile
      
      expect(email.value).toBe(originalValue);
    });

    it('should return same value on multiple accesses', () => {
      const email = Email.create('user@example.com');
      
      expect(email.value).toBe('user@example.com');
      expect(email.value).toBe('user@example.com');
      expect(email.value).toBe('user@example.com');
    });
  });

  describe('toString', () => {
    it('should return email string value', () => {
      const email = Email.create('user@example.com');
      
      expect(email.toString()).toBe('user@example.com');
    });

    it('should return same value as .value property', () => {
      const email = Email.create('test@example.com');
      
      expect(email.toString()).toBe(email.value);
    });
  });

  describe('toJSON', () => {
    it('should return email string for JSON serialization', () => {
      const email = Email.create('user@example.com');
      
      expect(email.toJSON()).toBe('user@example.com');
    });

    it('should serialize correctly in JSON.stringify', () => {
      const email = Email.create('user@example.com');
      const obj = { email };
      
      expect(JSON.stringify(obj)).toBe('{"email":"user@example.com"}');
    });

    it('should handle serialization in arrays', () => {
      const emails = [
        Email.create('user1@example.com'),
        Email.create('user2@example.com'),
      ];
      
      expect(JSON.stringify(emails)).toBe('["user1@example.com","user2@example.com"]');
    });
  });

  describe('value object characteristics', () => {
    it('should be created through factory method, not constructor', () => {
      // Constructor is private, can only use create()
      const email = Email.create('user@example.com');
      
      expect(email).toBeInstanceOf(Email);
    });

    it('should validate on creation', () => {
      // Invalid emails should throw immediately
      expect(() => Email.create('invalid')).toThrow();
    });

    it('should maintain identity through value equality', () => {
      const email1 = Email.create('user@example.com');
      const email2 = Email.create('user@example.com');
      
      // Not the same object reference
      expect(email1).not.toBe(email2);
      
      // But equal by value
      expect(email1.equals(email2)).toBe(true);
    });

    it('should be usable as object key representation', () => {
      const email = Email.create('user@example.com');
      const map = new Map<string, any>();
      
      map.set(email.toString(), 'value');
      
      expect(map.get(email.toString())).toBe('value');
    });
  });

  describe('business rules', () => {
    it('should enforce maximum length constraint', () => {
      const email255 = 'a'.repeat(240) + '@example.com'; // exactly 255
      const email256 = 'a'.repeat(241) + '@example.com'; // 256
      
      expect(() => Email.create(email255)).not.toThrow();
      expect(() => Email.create(email256)).toThrow('Email too long');
    });

    it('should block all configured blocked domains', () => {
      const blockedDomains = ['tempmail.com', 'throwaway.email'];
      
      blockedDomains.forEach(domain => {
        expect(() => Email.create(`user@${domain}`)).toThrow(`Email domain not allowed: ${domain}`);
      });
    });

    it('should allow legitimate domains', () => {
      const legitimateDomains = [
        'gmail.com',
        'yahoo.com',
        'outlook.com',
        'company.com',
        'my-company.co.uk',
        'university.edu',
      ];
      
      legitimateDomains.forEach(domain => {
        expect(() => Email.create(`user@${domain}`)).not.toThrow();
      });
    });
  });

  describe('real-world email formats', () => {
    it('should accept common email providers', () => {
      const validEmails = [
        'user@gmail.com',
        'user@yahoo.com',
        'user@outlook.com',
        'user@hotmail.com',
        'user@protonmail.com',
      ];
      
      validEmails.forEach(emailStr => {
        const email = Email.create(emailStr);
        expect(email.value).toBe(emailStr);
      });
    });

    it('should accept corporate email formats', () => {
      const corporateEmails = [
        'john.doe@company.com',
        'j.doe@my-company.co.uk',
        'admin@startup.io',
        'support@service.tech',
      ];
      
      corporateEmails.forEach(emailStr => {
        const email = Email.create(emailStr);
        expect(email.value).toBe(emailStr);
      });
    });

    it('should accept email aliases with plus addressing', () => {
      const aliasEmails = [
        'user+tag@gmail.com',
        'user+newsletter@example.com',
        'john+work@company.com',
      ];
      
      aliasEmails.forEach(emailStr => {
        const email = Email.create(emailStr);
        expect(email.value).toBe(emailStr);
      });
    });
  });
});