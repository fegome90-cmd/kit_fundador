import {
  buildRegisterUserAccountCommand,
  RegisterUserAccountCommandProps,
} from '@application/use-cases/register-user-account/RegisterUserAccountCommand';

describe('RegisterUserAccountCommand', () => {
  function buildPayload(
    overrides: Partial<RegisterUserAccountCommandProps> = {}
  ): RegisterUserAccountCommandProps {
    return {
      email: 'USER@example.com',
      name: '  Ada Lovelace  ',
      password: 'super-secure-pass',
      role: 'user',
      ...overrides,
    };
  }

  it('normalizes whitespace, casing and defaults role to user', () => {
    const command = buildRegisterUserAccountCommand(
      buildPayload({ role: undefined })
    );

    expect(command.email).toBe('user@example.com');
    expect(command.name).toBe('Ada Lovelace');
    expect(command.password).toBe('super-secure-pass');
    expect(command.role).toBe('user');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('respects explicit role when it is allowed', () => {
    const command = buildRegisterUserAccountCommand(
      buildPayload({ role: 'admin' })
    );

    expect(command.role).toBe('admin');
  });

  it('throws when email is empty', () => {
    expect(() =>
      buildRegisterUserAccountCommand(buildPayload({ email: '   ' }))
    ).toThrow('email cannot be blank');
  });

  it('throws when name exceeds the allowed length', () => {
    const longName = 'a'.repeat(256);
    expect(() =>
      buildRegisterUserAccountCommand(buildPayload({ name: longName }))
    ).toThrow('name is too long');
  });

  it('throws when password is empty', () => {
    expect(() =>
      buildRegisterUserAccountCommand(buildPayload({ password: ' ' }))
    ).toThrow('password cannot be blank');
  });

  it('throws when role is not supported', () => {
    expect(() =>
      buildRegisterUserAccountCommand(buildPayload({ role: 'manager' as any }))
    ).toThrow('role must be one of');
  });
});
