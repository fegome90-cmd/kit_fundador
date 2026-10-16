import {
  buildRegisterUserAccountCommand,
  RegisterUserAccountCommandProps,
} from '@application/use-cases/register-user-account/RegisterUserAccountCommand';

function buildPayload(
  overrides: Partial<RegisterUserAccountCommandProps> = {}
): RegisterUserAccountCommandProps {
  return {
    email: 'USER@example.com',
    name: '  Ada Lovelace  ',
    password: 'super-secure-pass',
    ...overrides,
  };
}

describe('RegisterUserAccountCommand', () => {

  it('normalizes email and name but keeps the public command free of roles', () => {
    const command = buildRegisterUserAccountCommand(
      buildPayload()
    );

    expect(command.email).toBe('user@example.com');
    expect(command.name).toBe('Ada Lovelace');
    expect(command.password).toBe('super-secure-pass');
    expect(command).not.toHaveProperty('role');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('ignores an administrative role supplied at runtime', () => {
    const untrustedInput = { ...buildPayload(), role: 'admin' };
    const command = buildRegisterUserAccountCommand(untrustedInput);
    expect(command).not.toHaveProperty('role');
  });

  it('does not retain caller-supplied role in the public command', () => {
    const untrustedInput = { ...buildPayload(), role: 'user' };
    const command = buildRegisterUserAccountCommand(untrustedInput);
    expect(command).not.toHaveProperty('role');
  });

  it('does not trim meaningful whitespace from a password', () => {
    const rawPassword = '  SecurePass123!  ';
    const command = buildRegisterUserAccountCommand(buildPayload({ password: rawPassword }));
    expect(command.password).toBe(rawPassword);
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

  it('does not retain arbitrary role values supplied at runtime', () => {
    const untrustedInput = { ...buildPayload(), role: 'manager' };
    const command = buildRegisterUserAccountCommand(untrustedInput);
    expect(command).not.toHaveProperty('role');
  });

  // MCQS Prevention: Test edge case for null/undefined values
  it('throws when email is null', () => {
    const payload = buildPayload();
    // @ts-expect-error - Testing runtime validation
    payload.email = null;
    expect(() => buildRegisterUserAccountCommand(payload)).toThrow('email cannot be empty');
  });

  it('throws when name is null', () => {
    const payload = buildPayload();
    // @ts-expect-error - Testing runtime validation
    payload.name = null;
    expect(() => buildRegisterUserAccountCommand(payload)).toThrow('name cannot be empty');
  });

  it('throws when password is null', () => {
    const payload = buildPayload();
    // @ts-expect-error - Testing runtime validation
    payload.password = null;
    expect(() => buildRegisterUserAccountCommand(payload)).toThrow('password cannot be empty');
  });
});
