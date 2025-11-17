/**
 * Email Value Object
 * 
 * Value Objects are:
 * - Immutable
 * - Compared by value, not identity
 * - Validate themselves
 * - No setters
 */

export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    this.validate();
  }

  static create(email: string): Email {
    return new Email(email);
  }

  private validate(): void {
    if (!this._value) {
      throw new Error('Email cannot be empty');
    }

    // Basic email validation
    // In production, use a proper library or more comprehensive regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this._value)) {
      throw new Error(`Invalid email format: ${this._value}`);
    }

    // Additional business rules
    if (this._value.length > 255) {
      throw new Error('Email too long');
    }

    // Example: Block certain domains
    const blockedDomains = ['tempmail.com', 'throwaway.email'];
    const domain = this._value.split('@')[1];
    if (blockedDomains.includes(domain)) {
      throw new Error(`Email domain not allowed: ${domain}`);
    }
  }

  get value(): string {
    return this._value;
  }

  // Value objects are compared by value
  equals(other: Email): boolean {
    if (!(other instanceof Email)) {
      return false;
    }
    return this._value.toLowerCase() === other._value.toLowerCase();
  }

  // For use in collections (Set, Map)
  toString(): string {
    return this._value;
  }

  toJSON(): string {
    return this._value;
  }
}
