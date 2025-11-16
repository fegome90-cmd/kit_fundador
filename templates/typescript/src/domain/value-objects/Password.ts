/**
 * Password Value Object
 * 
 * Value Objects are:
 * - Immutable
 * - Compared by value, not identity
 * - Validate themselves
 * - No setters
 */

export class Password {
  private readonly _hashedValue: string;

  private constructor(hashedValue: string) {
    this._hashedValue = hashedValue;
    this.validate();
  }

  static create(plainPassword: string): Password {
    // In production, use bcrypt/argon2 for hashing
    // This is just for demonstration
    const hashed = `hashed_${plainPassword}`;
    return new Password(hashed);
  }

  static fromHash(hashedValue: string): Password {
    return new Password(hashedValue);
  }

  private validate(): void {
    if (!this._hashedValue) {
      throw new Error('Password cannot be empty');
    }
  }

  get hashedValue(): string {
    return this._hashedValue;
  }

  // For testing purposes only - never expose in production
  matches(plainPassword: string): boolean {
    return this._hashedValue === `hashed_${plainPassword}`;
  }

  equals(other: Password): boolean {
    if (!(other instanceof Password)) {
      return false;
    }
    return this._hashedValue === other._hashedValue;
  }
}