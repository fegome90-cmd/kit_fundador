"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterUserAccountHandler_1 = require("@application/use-cases/register-user-account/RegisterUserAccountHandler");
const RegisterUserAccountCommand_1 = require("@application/use-cases/register-user-account/RegisterUserAccountCommand");
const UserAccountRepository_1 = require("@application/ports/UserAccountRepository");
const User_1 = require("@domain/entities/User");
const Email_1 = require("@domain/value-objects/Email");
const Password_1 = require("@domain/value-objects/Password");
class InMemoryUserAccountRepository {
    store = new Map();
    async findByEmail(email) {
        const key = email.value.toLowerCase();
        return this.store.get(key) ?? null;
    }
    async save(user) {
        this.store.set(user.email.value.toLowerCase(), user);
    }
    seed(user) {
        this.store.set(user.email.value.toLowerCase(), user);
    }
    get values() {
        return [...this.store.values()];
    }
}
describe('RegisterUserAccountHandler', () => {
    function buildCommand(overrides = {}) {
        return (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)({
            email: 'user@example.com',
            name: 'Ada Lovelace',
            password: 'super-secure-pass',
            role: 'user',
            ...overrides,
        });
    }
    function buildHandler(repository = new InMemoryUserAccountRepository()) {
        return {
            handler: new RegisterUserAccountHandler_1.RegisterUserAccountHandler({ userAccountRepository: repository }),
            repository,
        };
    }
    it('persists a new user and returns a snapshot with domain events', async () => {
        const { handler, repository } = buildHandler();
        const command = buildCommand();
        const result = await handler.execute(command);
        expect(repository.values).toHaveLength(1);
        expect(result.userSnapshot.email).toBe('user@example.com');
        expect(result.userSnapshot.name).toBe('Ada Lovelace');
        expect(result.userSnapshot.role).toBe('user');
        expect(result.domainEvents).toHaveLength(1);
        expect(result.domainEvents[0].eventType).toBe('UserCreated');
    });
    it('throws when the email already exists', async () => {
        const repository = new InMemoryUserAccountRepository();
        const existingUser = User_1.User.create({
            email: Email_1.Email.create('user@example.com'),
            name: 'Existing',
            password: Password_1.Password.create('another-secure-pass'),
            role: 'user',
        });
        repository.seed(existingUser);
        const { handler } = buildHandler(repository);
        await expect(handler.execute(buildCommand())).rejects.toBeInstanceOf(UserAccountRepository_1.UserAccountAlreadyExistsError);
    });
    it('propagates domain validation errors for invalid emails', async () => {
        const { handler } = buildHandler();
        await expect(handler.execute(buildCommand({ email: 'invalid-email' }))).rejects.toThrow('Invalid email format');
    });
    it('delegates password rules to the Password value object', async () => {
        const { handler } = buildHandler();
        await expect(handler.execute(buildCommand({ password: 'tiny-pass' }))).rejects.toThrow('Password must be at least');
    });
});
//# sourceMappingURL=register-user-account-handler.test.js.map