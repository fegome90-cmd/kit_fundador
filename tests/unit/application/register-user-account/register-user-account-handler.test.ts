import { RegisterUserAccountHandler } from '@application/use-cases/register-user-account/RegisterUserAccountHandler';
import {
  buildRegisterUserAccountCommand,
  RegisterUserAccountCommandProps,
} from '@application/use-cases/register-user-account/RegisterUserAccountCommand';
import {
  UserAccountAlreadyExistsError,
  UserAccountRepository,
} from '@application/ports/UserAccountRepository';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

class InMemoryUserAccountRepository implements UserAccountRepository {
  private readonly store = new Map<string, User>();

  async findByEmail(email: Email): Promise<User | null> {
    const key = email.value.toLowerCase();
    return this.store.get(key) ?? null;
  }

  async save(user: User): Promise<void> {
    this.store.set(user.email.value.toLowerCase(), user);
  }

  seed(user: User): void {
    this.store.set(user.email.value.toLowerCase(), user);
  }

  get values(): User[] {
    return [...this.store.values()];
  }
}

describe('RegisterUserAccountHandler', () => {
  function buildCommand(
    overrides: Partial<RegisterUserAccountCommandProps> = {}
  ) {
    return buildRegisterUserAccountCommand({
      email: 'user@example.com',
      name: 'Ada Lovelace',
      password: 'super-secure-pass',
      role: 'user',
      ...overrides,
    });
  }

  function buildHandler(repository = new InMemoryUserAccountRepository()) {
    return {
      handler: new RegisterUserAccountHandler({ userAccountRepository: repository }),
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
    const existingUser = User.create({
      email: Email.create('user@example.com'),
      name: 'Existing',
      password: Password.create('another-secure-pass'),
      role: 'user',
    });
    repository.seed(existingUser);
    const { handler } = buildHandler(repository);

    await expect(handler.execute(buildCommand())).rejects.toBeInstanceOf(
      UserAccountAlreadyExistsError
    );
  });

  it('propagates domain validation errors for invalid emails', async () => {
    const { handler } = buildHandler();

    await expect(
      handler.execute(buildCommand({ email: 'invalid-email' }))
    ).rejects.toThrow('Invalid email format');
  });

  it('delegates password rules to the Password value object', async () => {
    const { handler } = buildHandler();

    await expect(
      handler.execute(buildCommand({ password: 'tiny-pass' }))
    ).rejects.toThrow('Password must be at least');
  });
});
