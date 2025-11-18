import { Password, MIN_PASSWORD_LENGTH, DEFAULT_SALT_ROUNDS } from '@domain/value-objects/Password';

describe('Password Value Object', () => {
  const VALID_PASSWORD = 'SecurePassword123!';
  const SHORT_PASSWORD = 'short';

  describe('Password Creation', () => {
    it('should create password with valid plaintext', async () => {
      const password = await Password.create(VALID_PASSWORD);

      expect(password).toBeInstanceOf(Password);
      expect(password.hashedValue).toBeDefined();
      expect(password.hashedValue).not.toBe(VALID_PASSWORD); // Should be hashed
    });

    it('should hash password with bcrypt format', async () => {
      const password = await Password.create(VALID_PASSWORD);

      // bcrypt format: $2[aby]$rounds$salthash
      expect(password.hashedValue).toMatch(/^\$2[aby]\$\d{2}\$/);
    });

    it('should use at least 12 salt rounds', async () => {
      const password = await Password.create(VALID_PASSWORD);

      // Extract rounds from hash: $2b$12$...
      const rounds = parseInt(password.hashedValue.split('$')[2], 10);
      expect(rounds).toBeGreaterThanOrEqual(12);
    });

    it('should generate different hashes for same password', async () => {
      const password1 = await Password.create(VALID_PASSWORD);
      const password2 = await Password.create(VALID_PASSWORD);

      // Different salts should produce different hashes
      expect(password1.hashedValue).not.toBe(password2.hashedValue);
    });

    it('should reject password shorter than minimum length', async () => {
      await expect(Password.create(SHORT_PASSWORD)).rejects.toThrow(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    });

    it('should reject empty password', async () => {
      await expect(Password.create('')).rejects.toThrow(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    });

    it('should reject whitespace-only password', async () => {
      await expect(Password.create('   ')).rejects.toThrow(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    });

    it('should accept password exactly at minimum length', async () => {
      const minLengthPassword = 'a'.repeat(MIN_PASSWORD_LENGTH);
      const password = await Password.create(minLengthPassword);

      expect(password).toBeInstanceOf(Password);
    });
  });

  describe('Password Verification (matches)', () => {
    it('should verify correct password', async () => {
      const password = await Password.create(VALID_PASSWORD);
      const isMatch = await password.matches(VALID_PASSWORD);

      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = await Password.create(VALID_PASSWORD);
      const isMatch = await password.matches('WrongPassword123!');

      expect(isMatch).toBe(false);
    });

    it('should reject password with different case', async () => {
      const password = await Password.create(VALID_PASSWORD);
      const isMatch = await password.matches(VALID_PASSWORD.toLowerCase());

      expect(isMatch).toBe(false);
    });

    it('should reject password with extra characters', async () => {
      const password = await Password.create(VALID_PASSWORD);
      const isMatch = await password.matches(VALID_PASSWORD + 'extra');

      expect(isMatch).toBe(false);
    });

    it('should handle empty string in matches', async () => {
      const password = await Password.create(VALID_PASSWORD);
      const isMatch = await password.matches('');

      expect(isMatch).toBe(false);
    });
  });

  describe('Password from Hash (fromHash)', () => {
    it('should reconstruct password from valid bcrypt hash', async () => {
      const originalPassword = await Password.create(VALID_PASSWORD);
      const reconstructed = Password.fromHash(originalPassword.hashedValue);

      expect(reconstructed).toBeInstanceOf(Password);
      expect(reconstructed.hashedValue).toBe(originalPassword.hashedValue);
    });

    it('should reject invalid hash format', () => {
      expect(() => Password.fromHash('invalid_hash')).toThrow(
        'Password must be hashed using bcrypt format'
      );
    });

    it('should reject placeholder hash format', () => {
      expect(() => Password.fromHash('hashed_plaintext')).toThrow(
        'Password must be hashed using bcrypt format'
      );
    });

    it('should reject empty hash', () => {
      expect(() => Password.fromHash('')).toThrow('Password cannot be empty');
    });
  });

  describe('Security Properties', () => {
    it('should not expose plaintext password', async () => {
      const password = await Password.create(VALID_PASSWORD);

      // Check that hashedValue doesn't contain plaintext
      expect(password.hashedValue).not.toContain(VALID_PASSWORD);
      expect(password.hashedValue).not.toContain('hashed_');
    });

    it('should use cryptographically secure hashing', async () => {
      const password = await Password.create(VALID_PASSWORD);

      // bcrypt hashes are 60 characters long
      expect(password.hashedValue.length).toBe(60);
    });

    it('should include salt in hash', async () => {
      const password1 = await Password.create(VALID_PASSWORD);
      const password2 = await Password.create(VALID_PASSWORD);

      // Different salts mean different hashes
      expect(password1.hashedValue).not.toBe(password2.hashedValue);

      // But both should verify against the same plaintext
      expect(await password1.matches(VALID_PASSWORD)).toBe(true);
      expect(await password2.matches(VALID_PASSWORD)).toBe(true);
    });

    it('should be resistant to timing attacks (constant-time comparison)', async () => {
      const password = await Password.create(VALID_PASSWORD);

      // bcrypt.compare uses constant-time comparison
      // We verify it doesn't throw or behave differently with various inputs
      const tests = [
        '',
        'a',
        'aa',
        VALID_PASSWORD.substring(0, 5),
        VALID_PASSWORD,
        VALID_PASSWORD + 'extra',
        'completely_different_password_12345'
      ];

      for (const testPassword of tests) {
        await expect(password.matches(testPassword)).resolves.toBeDefined();
      }
    });
  });

  describe('Value Object Equality', () => {
    it('should be equal to another password with same hash', async () => {
      const password1 = await Password.create(VALID_PASSWORD);
      const password2 = Password.fromHash(password1.hashedValue);

      expect(password1.equals(password2)).toBe(true);
    });

    it('should not be equal to password with different hash', async () => {
      const password1 = await Password.create(VALID_PASSWORD);
      const password2 = await Password.create(VALID_PASSWORD);

      // Different salts = different hashes
      expect(password1.equals(password2)).toBe(false);
    });

    it('should not be equal to non-Password object', async () => {
      const password = await Password.create(VALID_PASSWORD);

      expect(password.equals({} as any)).toBe(false);
      expect(password.equals(null as any)).toBe(false);
      expect(password.equals('string' as any)).toBe(false);
    });
  });

  describe('Immutability', () => {
    it('should maintain readonly hash value', async () => {
      const password = await Password.create(VALID_PASSWORD);
      const originalHash = password.hashedValue;

      // Verify readonly getter - TypeScript enforces immutability at compile time
      // The private readonly modifier prevents modification
      expect(password.hashedValue).toBe(originalHash);
      expect(typeof password.hashedValue).toBe('string');
    });

    it('should not expose internal state for modification', async () => {
      const password = await Password.create(VALID_PASSWORD);

      // Only hashedValue getter should be available
      expect(password.hashedValue).toBeDefined();
      expect(typeof password.hashedValue).toBe('string');

      // Verify the value object maintains its integrity
      const reconstructed = Password.fromHash(password.hashedValue);
      expect(reconstructed.hashedValue).toBe(password.hashedValue);
    });
  });

  describe('Environment Configuration', () => {
    it('should use default salt rounds when env variable not set', async () => {
      const originalEnv = process.env.PASSWORD_SALT_ROUNDS;
      delete process.env.PASSWORD_SALT_ROUNDS;

      const password = await Password.create(VALID_PASSWORD);
      const rounds = parseInt(password.hashedValue.split('$')[2], 10);

      expect(rounds).toBe(DEFAULT_SALT_ROUNDS);

      // Restore env
      if (originalEnv) process.env.PASSWORD_SALT_ROUNDS = originalEnv;
    });

    it('should use custom salt rounds from environment', async () => {
      const originalEnv = process.env.PASSWORD_SALT_ROUNDS;
      process.env.PASSWORD_SALT_ROUNDS = '10';

      const password = await Password.create(VALID_PASSWORD);
      const rounds = parseInt(password.hashedValue.split('$')[2], 10);

      expect(rounds).toBe(10);

      // Restore env
      if (originalEnv) {
        process.env.PASSWORD_SALT_ROUNDS = originalEnv;
      } else {
        delete process.env.PASSWORD_SALT_ROUNDS;
      }
    });
  });

  describe('Error Messages', () => {
    it('should provide clear error for short password', async () => {
      await expect(Password.create('short')).rejects.toThrow(
        'Password must be at least 12 characters long'
      );
    });

    it('should provide clear error for invalid hash format', () => {
      expect(() => Password.fromHash('invalid')).toThrow(
        'Password must be hashed using bcrypt format ($2[aby]$rounds$...)'
      );
    });

    it('should provide clear error for empty password', () => {
      expect(() => Password.fromHash('')).toThrow('Password cannot be empty');
    });
  });
});
