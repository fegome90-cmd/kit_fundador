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
export const BLOCKED_DOMAINS = Object.freeze(['tempmail.com', 'throwaway.email']);
export class Email {
    _value;
    constructor(value) {
        this._value = value;
        this.validate();
    }
    static create(email) {
        return new Email(email);
    }
    validate() {
        this.ensureNotEmpty();
        this.ensureBasicFormat();
        const { localPart, domainPart } = this.extractParts();
        this.validateLocalPart(localPart);
        this.validateDomain(domainPart);
        this.ensureDomainNotBlocked(domainPart);
    }
    ensureNotEmpty() {
        if (!this._value) {
            throw new Error('Email cannot be empty');
        }
        if (!this._value.trim()) {
            throw new Error('Invalid email format');
        }
        // Basic email validation
        // In production, use a proper library or more comprehensive regex
        if (!EMAIL_REGEX.test(this._value)) {
            throw new Error(`Invalid email format: ${this._value}`);
        }
        // Additional business rules
        if (this._value.length > MAX_EMAIL_LENGTH) {
            throw new Error('Email too long');
        }
    }
    ensureBasicFormat() {
        if (!EMAIL_REGEX.test(this._value)) {
            throw new Error(`Invalid email format: ${this._value}`);
        }
    }
    extractParts() {
        const [localPart, domainPart] = this._value.split('@');
        if (!localPart || !domainPart) {
            throw new Error('Invalid email format');
        }
        return { localPart, domainPart };
    }
    validateLocalPart(localPart) {
        if (localPart.startsWith('.') || localPart.endsWith('.')) {
            throw new Error('Invalid email format');
        }
    }
    validateDomain(domainPart) {
        if (domainPart.startsWith('-') || domainPart.endsWith('-')) {
            throw new Error('Invalid email format');
        }
        const domainLabels = domainPart.split('.');
        const hasInvalidLabel = domainLabels.some((label) => {
            return !label || label.startsWith('-') || label.endsWith('-');
        });
        if (hasInvalidLabel) {
            throw new Error('Invalid email format');
        }
    }
    ensureDomainNotBlocked(domainPart) {
        if (BLOCKED_DOMAINS.some((d) => domainPart.toLowerCase() === d.toLowerCase())) {
            throw new Error(`Email domain not allowed: ${domainPart}`);
        }
    }
    get value() {
        return this._value;
    }
    // Value objects are compared by value
    equals(other) {
        if (!(other instanceof Email)) {
            return false;
        }
        return this._value.toLowerCase() === other._value.toLowerCase();
    }
    // For use in collections (Set, Map)
    toString() {
        return this._value;
    }
    toJSON() {
        return this._value;
    }
}
//# sourceMappingURL=Email.js.map