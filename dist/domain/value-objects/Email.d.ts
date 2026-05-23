/**
 * Email Value Object
 *
 * Value Objects are:
 * - Immutable
 * - Compared by value, not identity
 * - Validate themselves
 * - No setters
 */
export declare const EMAIL_REGEX: {};
export declare const MAX_EMAIL_LENGTH = 255;
export declare const BLOCKED_DOMAINS: any;
export declare class Email {
    private readonly _value;
    private constructor();
    static create(email: string): Email;
    private validate;
    private ensureNotEmpty;
    private ensureBasicFormat;
    private extractParts;
    private validateLocalPart;
    private validateDomain;
    private ensureDomainNotBlocked;
    get value(): string;
    equals(other: Email): boolean;
    toString(): string;
    toJSON(): string;
}
//# sourceMappingURL=Email.d.ts.map