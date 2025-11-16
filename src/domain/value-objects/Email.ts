/**
 * Email Value Object
 *
 * Value Objects are:
 * - Immutable
 * - Compared by value, not identity
 * - Validate themselves
 * - No setters
 */

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MAX_EMAIL_LENGTH = 255;
export const BLOCKED_DOMAINS = Object.freeze([
  'tempmail.com',
  'throwaway.email',
]);

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
    this.ensureNotEmpty();
    this.ensureBasicFormat();
    const { localPart, domainPart } = this.extractParts();
    this.validateLocalPart(localPart);
    this.validateDomain(domainPart);
    this.ensureDomainNotBlocked(domainPart);
  }

  private ensureNotEmpty(): void {
    if (!this._value) {
      throw new Error('Email cannot be empty');
    }

    if (!this._value.trim()) {
      throw new Error('Invalid email format');
    }

    if (this._value.length > MAX_EMAIL_LENGTH) {
      throw new Error('Email too long');
    }
  }

  private ensureBasicFormat(): void {
    if (!EMAIL_REGEX.test(this._value)) {
      throw new Error(`Invalid email format: ${this._value}`);
    }
  }

  private extractParts(): { localPart: string; domainPart: string } {
    const [localPart, domainPart] = this._value.split('@');
    if (!localPart || !domainPart) {
      throw new Error('Invalid email format');
    }

    return { localPart, domainPart };
  }

  private validateLocalPart(localPart: string): void {
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      throw new Error('Invalid email format');
    }
  }

  private validateDomain(domainPart: string): void {
    if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
      throw new Error('Invalid email format');
    }

    const domainLabels = domainPart.split('.');
    const hasInvalidLabel = domainLabels.some(
      (label) => !label || label.startsWith('-') || label.endsWith('-')
    );

    if (hasInvalidLabel) {
      throw new Error('Invalid email format');
    }
  }

  private ensureDomainNotBlocked(domainPart: string): void {
    if (BLOCKED_DOMAINS.includes(domainPart)) {
      throw new Error(`Email domain not allowed: ${domainPart}`);
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
