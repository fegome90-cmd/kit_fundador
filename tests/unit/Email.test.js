"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Email_1 = require("@domain/value-objects/Email");
const VALID_EMAIL_CASES = [
    'user@example.com',
    'john.doe@sub.domain.co',
    'alias+tag@company.io',
];
const INVALID_EMAIL_CASES = [
    {
        description: 'empty string rejects early',
        candidate: '',
        expectedMessage: 'Email cannot be empty',
    },
    {
        description: 'whitespace only rejects',
        candidate: '   ',
        expectedMessage: /Invalid email format/,
    },
    {
        description: 'missing @ symbol',
        candidate: 'userexample.com',
        expectedMessage: /Invalid email format/,
    },
    {
        description: 'domain label starting with hyphen',
        candidate: 'user@-example.com',
        expectedMessage: /Invalid email format/,
    },
    {
        description: 'longer than MAX_EMAIL_LENGTH',
        candidate: `${'a'.repeat(Email_1.MAX_EMAIL_LENGTH)}@example.com`,
        expectedMessage: 'Email too long',
    },
];
describe('Email Value Object', () => {
    describe('create', () => {
        it.each(VALID_EMAIL_CASES)('accepts %s', (candidate) => {
            expect(Email_1.Email.create(candidate).value).toBe(candidate);
        });
        it.each(INVALID_EMAIL_CASES)('$description', ({ candidate, expectedMessage }) => {
            expect(() => Email_1.Email.create(candidate)).toThrow(expectedMessage);
        });
        it('rejects every blocked disposable domain', () => {
            Email_1.BLOCKED_DOMAINS.forEach((domain) => {
                expect(() => Email_1.Email.create(`user@${domain}`)).toThrow(`Email domain not allowed: ${domain}`);
            });
        });
        it('allows emails right at the MAX_EMAIL_LENGTH boundary', () => {
            const suffix = '@example.com';
            const allowedLocalPart = 'a'.repeat(Email_1.MAX_EMAIL_LENGTH - suffix.length);
            const candidate = `${allowedLocalPart}${suffix}`;
            expect(candidate.length).toBe(Email_1.MAX_EMAIL_LENGTH);
            expect(() => Email_1.Email.create(candidate)).not.toThrow();
        });
    });
    describe('value semantics', () => {
        it('compares instances by value ignoring case', () => {
            const emailA = Email_1.Email.create('User@Example.com');
            const emailB = Email_1.Email.create('user@example.com');
            expect(emailA.equals(emailB)).toBe(true);
        });
        it('serializes through toString/toJSON helpers', () => {
            const email = Email_1.Email.create('serializable@example.com');
            expect(email.toString()).toBe('serializable@example.com');
            expect(email.toJSON()).toBe('serializable@example.com');
        });
    });
});
//# sourceMappingURL=Email.test.js.map