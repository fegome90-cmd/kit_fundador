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
 * This implementation uses bcrypt for secure password hashing.
 * Default: 12 salt rounds (configurable via PASSWORD_SALT_ROUNDS env variable).
 * See ADR-002 for algorithm selection rationale.
 */

export const MIN_PASSWORD_LENGTH = 12;
export const DEFAULT_SALT_ROUNDS = 12;
export const MIN_SALT_ROUNDS = 4;
export const MAX_SALT_ROUNDS = 31;

// Bcrypt hash format: $2[aby]$rounds$salthash (60 chars total)
// Example: $2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
const BCRYPT_HASH_REGEX = /^\$2[aby]\$\d{2}\$.{53}$/;

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
   * @throws Error if password is too short or salt rounds invalid
   */
  static async create(plainPassword: string): Promise<Password> {
    if (!plainPassword || plainPassword.trim().length < MIN_PASSWORD_LENGTH) {
      throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }

    const saltRounds = this.getSaltRounds();
    const hashed = await bcrypt.hash(plainPassword, saltRounds);
    return new Password(hashed);
  }

  /**
   * Gets validated salt rounds from environment or default.
   * @private
   * @returns number - Valid salt rounds between 4-31
   * @throws Error if PASSWORD_SALT_ROUNDS is invalid
   */
  private static getSaltRounds(): number {
    const envValue = process.env.PASSWORD_SALT_ROUNDS;
    if (!envValue) {
      return DEFAULT_SALT_ROUNDS;
    }

    const saltRounds = this.validateSaltRoundsFormat(envValue);
    this.validateSaltRoundsRange(saltRounds);
    return saltRounds;
  }

  /**
   * Validates salt rounds format and converts to number.
   * @private
   */
  private static validateSaltRoundsFormat(envValue: string): number {
    if (envValue.includes('.')) {
      const parsed = parseFloat(envValue);
      throw new Error(`Invalid PASSWORD_SALT_ROUNDS: ${Math.floor(parsed)} must be an integer`);
    }

    const saltRounds = parseInt(envValue, 10);
    if (isNaN(saltRounds)) {
      throw new Error(`Invalid PASSWORD_SALT_ROUNDS: "${envValue}" is not a valid number`);
    }

    return saltRounds;
  }

  /**
   * Validates salt rounds is within acceptable range.
   * @private
   */
  private static validateSaltRoundsRange(saltRounds: number): void {
    if (saltRounds < MIN_SALT_ROUNDS || saltRounds > MAX_SALT_ROUNDS) {
      throw new Error(
        `Invalid PASSWORD_SALT_ROUNDS: ${saltRounds} must be between ${MIN_SALT_ROUNDS} and ${MAX_SALT_ROUNDS}`
      );
    }
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
      throw new Error('Password must be hashed using bcrypt format ($2[aby]$rounds$...)');
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
