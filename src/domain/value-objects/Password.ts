import * as bcrypt from 'bcrypt';

/**
 * Password Value Object
 *
 * Value Objects are:
 * - Immutable
 * - Compared by value, not identity
 * - Validate themselves
 * - No setters
 *
 * This implementation uses bcrypt for secure password hashing with salt rounds of 12.
 * See ADR-002 for algorithm selection rationale.
 */

export const MIN_PASSWORD_LENGTH = 12;
export const DEFAULT_SALT_ROUNDS = 12;

// Bcrypt hash format: $2[aby]$rounds$salthash
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$/;

export class Password {
  private readonly _hashedValue: string;

  private constructor(hashedValue: string) {
    this._hashedValue = hashedValue;
    this.validate();
  }

  /**
   * Creates a new Password from plaintext using bcrypt hashing.
   * @param plainPassword - The plaintext password (minimum 12 characters)
   * @returns Promise<Password> - The hashed password value object
   * @throws Error if password is too short
   */
  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword || plainPassword.trim().length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    }

    const saltRounds = parseInt(process.env.PASSWORD_SALT_ROUNDS || String(DEFAULT_SALT_ROUNDS), 10);
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    return new Password(hashed);
  }

  /**
   * Reconstructs a Password from an existing bcrypt hash.
   * @param hashedValue - The bcrypt hash string
   * @returns Password - The password value object
   */
  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  private validate(): void {
    if (!this._hashedValue) {
      throw new Error('Password cannot be empty');
    }

    if (!BCRYPT_HASH_REGEX.test(this._hashedValue)) {
      throw new Error(
        'Password must be hashed using bcrypt format ($2[aby]$rounds$...)'
      );
    }
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  /**
   * Securely compares plaintext password against the hashed value using bcrypt.
   * Uses constant-time comparison to prevent timing attacks.
   * @param plainPassword - The plaintext password to verify
   * @returns Promise<boolean> - True if passwords match
   */
  async matches(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this._hashedValue);
  }

  equals(other: Password): boolean {
    if (!(other instanceof Password)) {
      return false;
    }
    return this._hashedValue === other._hashedValue;
  }
}
