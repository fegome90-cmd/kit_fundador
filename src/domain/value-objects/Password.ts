/**
 * Password Value Object
 *
 * Value Objects are:
 * - Immutable
 * - Compared by value, not identity
 * - Validate themselves
 * - No setters
 *
 * 👉 Replace the placeholder hashing strategy (`HASH_PLACEHOLDER_PREFIX`)
 *    with your application's password hasher service.
 */

export const HASH_PLACEHOLDER_PREFIX = 'hashed_';
export const MIN_PASSWORD_LENGTH = 12;

export class Password {
  private readonly _hashedValue: string;

  private constructor(hashedValue: string) {
    this._hashedValue = hashedValue;
    this.validate();
  }

  static create(plainPassword: string): Password {
    if (!plainPassword || plainPassword.trim().length < MIN_PASSWORD_LENGTH) {
      throw new Error(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      );
    }

    // In production, use bcrypt/argon2 for hashing
    // This is just for demonstration
    const hashed = `${HASH_PLACEHOLDER_PREFIX}${plainPassword}`;
    return new Password(hashed);
  }

  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  private validate(): void {
    if (!this._hashedValue) {
      throw new Error('Password cannot be empty');
    }

    if (!this._hashedValue.startsWith(HASH_PLACEHOLDER_PREFIX)) {
      throw new Error(
        'Password must be hashed using the configured hashing service'
      );
    }
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  // For testing purposes only - never expose in production
  matches(plainPassword: string): boolean {
    return this._hashedValue === `${HASH_PLACEHOLDER_PREFIX}${plainPassword}`;
  }

  equals(other: Password): boolean {
    if (!(other instanceof Password)) {
      return false;
    }
    return this._hashedValue === other._hashedValue;
  }
}