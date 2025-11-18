"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RegisterUserAccountHandler_1 = require("@application/use-cases/register-user-account/RegisterUserAccountHandler");
const RegisterUserAccountCommand_1 = require("@application/use-cases/register-user-account/RegisterUserAccountCommand");
const UserAccountRepository_1 = require("@application/ports/UserAccountRepository");
const InMemoryUserAccountRepository_1 = require("@infrastructure/_stubs/InMemoryUserAccountRepository");
const User_1 = require("@domain/entities/User");
const Email_1 = require("@domain/value-objects/Email");
const Password_1 = require("@domain/value-objects/Password");
function buildCommand(overrides = {}) {
    return (0, RegisterUserAccountCommand_1.buildRegisterUserAccountCommand)({
        email: overrides.email ?? 'ada@example.com',
        name: overrides.name ?? 'Ada Lovelace',
        password: overrides.password ?? 'super-secure-pass',
        role: overrides.role,
    });
}
function buildHandler(seed = []) {
    const repository = new InMemoryUserAccountRepository_1.InMemoryUserAccountRepository(seed);
    const handler = new RegisterUserAccountHandler_1.RegisterUserAccountHandler({ userAccountRepository: repository });
    return { handler, repository };
}
describe('integration | RegisterUserAccount', () => {
    it('persists a brand new user and exposes snapshot + domain events', async () => {
        const { handler, repository } = buildHandler();
        const command = buildCommand();
        const result = await handler.execute(command);
        expect(repository.list()).toHaveLength(1);
        const persisted = repository.list()[0];
        expect(persisted.email.value).toBe('ada@example.com');
        expect(persisted.name).toBe('Ada Lovelace');
        expect(persisted.role).toBe('user');
        expect(result.userSnapshot).toMatchObject({
            email: 'ada@example.com',
            name: 'Ada Lovelace',
            role: 'user',
            emailVerified: false,
        });
        expect(result.domainEvents).toHaveLength(1);
        expect(result.domainEvents[0]).toHaveProperty('eventType', 'UserCreated');
    });
    it('rejects the command when the repository already tracks the email', async () => {
        const existingUser = User_1.User.create({
            email: Email_1.Email.create('ada@example.com'),
            name: 'Existing User',
            password: Password_1.Password.create('another-secure-pass'),
            role: 'user',
        });
        const { handler } = buildHandler([existingUser]);
        await expect(handler.execute(buildCommand())).rejects.toBeInstanceOf(UserAccountRepository_1.UserAccountAlreadyExistsError);
    });
});
//# sourceMappingURL=register-user-account.integration.test.js.map