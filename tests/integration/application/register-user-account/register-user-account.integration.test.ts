import { RegisterUserAccountHandler } from '@application/use-cases/register-user-account/RegisterUserAccountHandler';
import {
  buildRegisterUserAccountCommand,
  RegisterUserAccountCommandProps,
} from '@application/use-cases/register-user-account/RegisterUserAccountCommand';
import { UserAccountAlreadyExistsError } from '@application/ports/UserAccountRepository';
import { InMemoryUserAccountRepository } from '@infrastructure/_stubs/InMemoryUserAccountRepository';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

function buildCommand(overrides: Partial<RegisterUserAccountCommandProps> = {}) {
  return buildRegisterUserAccountCommand({
    email: overrides.email ?? 'ada@example.com',
    name: overrides.name ?? 'Ada Lovelace',
    password: overrides.password ?? 'super-secure-pass',
    role: overrides.role,
  });
}

function buildHandler(seed: Iterable<User> = []) {
  const repository = new InMemoryUserAccountRepository(seed);
  const handler = new RegisterUserAccountHandler({ userAccountRepository: repository });

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
    const existingUser = User.create({
      email: Email.create('ada@example.com'),
      name: 'Existing User',
      password: Password.create('another-secure-pass'),
      role: 'user',
    });
    const { handler } = buildHandler([existingUser]);

    await expect(handler.execute(buildCommand())).rejects.toBeInstanceOf(
      UserAccountAlreadyExistsError
    );
  });
});
