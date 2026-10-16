/**
 * DTO que encapsula los datos de entrada para el use case RegisterUserAccount.
 * Mantiene la capa de aplicación aislada de detalles HTTP o de persistencia.
 */
export interface RegisterUserAccountCommand {
  email: string;
  name: string;
  password: string;
}

export interface RegisterUserAccountCommandProps {
  email: string;
  name: string;
  password: string;
}

/**
 * Normaliza/valida los datos de entrada y retorna un command inmutable.
 */
export function buildRegisterUserAccountCommand(
  props: RegisterUserAccountCommandProps
): RegisterUserAccountCommand {
  const normalizedEmail = normalizeEmail(props.email);
  const normalizedName = normalizeName(props.name);
  const normalizedPassword = normalizePassword(props.password);

  return Object.freeze({
    email: normalizedEmail,
    name: normalizedName,
    password: normalizedPassword,
  });
}

function ensureNonEmpty(value: string, field: string): string {
  if (!value) {
    throw new Error(`${field} cannot be empty`);
  }

  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${field} cannot be blank`);
  }

  return trimmed;
}

function normalizeEmail(email: string): string {
  const normalized = ensureNonEmpty(email, 'email').toLowerCase();
  return normalized;
}

function normalizeName(name: string): string {
  const normalized = ensureNonEmpty(name, 'name');
  if (normalized.length > 255) {
    throw new Error('name is too long (max 255 characters)');
  }

  return normalized;
}

function normalizePassword(password: string): string {
  // Passwords are opaque: reject blank input without trimming meaningful spaces.
  if (!password) {
    throw new Error('password cannot be empty');
  }
  if (typeof password !== 'string' || !password.trim()) {
    throw new Error('password cannot be blank');
  }
  return password;
}
