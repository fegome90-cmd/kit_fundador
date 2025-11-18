"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterUserAccountCommand_1 = require("@application/use-cases/register-user-account/RegisterUserAccountCommand");
function buildPayload(overrides = {}) {
    return {
        email: 'USER@example.com',
        name: '  Ada Lovelace  ',
        password: 'super-secure-pass',
        role: 'user',
        ...overrides,
    };
}
describe('RegisterUserAccountCommand', () => {
    it('normalizes whitespace, casing and defaults role to user', () => {
        const command = (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(buildPayload({ role: undefined }));
        expect(command.email).toBe('user@example.com');
        expect(command.name).toBe('Ada Lovelace');
        expect(command.password).toBe('super-secure-pass');
        expect(command.role).toBe('user');
        expect(Object.isFrozen(command)).toBe(true);
    });
    it('respects explicit role when it is allowed', () => {
        const command = (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(buildPayload({ role: 'admin' }));
        expect(command.role).toBe('admin');
    });
    it('throws when email is empty', () => {
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(buildPayload({ email: '   ' }))).toThrow('email cannot be blank');
    });
    it('throws when name exceeds the allowed length', () => {
        const longName = 'a'.repeat(256);
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(buildPayload({ name: longName }))).toThrow('name is too long');
    });
    it('throws when password is empty', () => {
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(buildPayload({ password: ' ' }))).toThrow('password cannot be blank');
    });
    it('throws when role is not supported', () => {
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(buildPayload({ role: 'manager' }))).toThrow('role must be one of');
    });
    // MCQS Prevention: Test edge case for null/undefined values
    it('throws when email is null', () => {
        const payload = buildPayload();
        // @ts-expect-error - Testing runtime validation
        payload.email = null;
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(payload)).toThrow('email cannot be empty');
    });
    it('throws when name is null', () => {
        const payload = buildPayload();
        // @ts-expect-error - Testing runtime validation
        payload.name = null;
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(payload)).toThrow('name cannot be empty');
    });
    it('throws when password is null', () => {
        const payload = buildPayload();
        // @ts-expect-error - Testing runtime validation
        payload.password = null;
        expect(() => (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)(payload)).toThrow('password cannot be empty');
    });
});
//# sourceMappingURL=register-user-account-command.test.js.map