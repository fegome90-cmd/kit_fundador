/**
 * Test Data Factories
 * Generadores de datos de prueba para tests de seguridad y rendimiento
 */

export interface UserData {
  email: string;
  password: string;
  name: string;
}

/**
 * Genera datos de usuario válidos para testing
 */
export function createValidUser(overrides?: Partial<UserData>): UserData {
  const randomId = Math.random().toString(36).substring(2, 10);
  return {
    email: `user_${randomId}@example.com`,
    password: 'SecurePass123!',
    name: `Test User ${randomId}`,
    ...overrides,
  };
}

/**
 * Genera email malicioso para tests de SQL injection
 */
export function createMaliciousEmail(type: 'sql' | 'xss' | 'nosql'): string {
  const sqlInjectionEmails = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "'; DELETE FROM users WHERE '1'='1",
    "' UNION SELECT * FROM users --",
  ];

  const xssEmails = [
    '<script>alert("XSS")</script>@example.com',
    '<img src=x onerror=alert("XSS")>@example.com',
    'javascript:alert("XSS")@example.com',
  ];

  switch (type) {
    case 'sql':
      return sqlInjectionEmails[Math.floor(Math.random() * sqlInjectionEmails.length)];
    case 'xss':
      return xssEmails[Math.floor(Math.random() * xssEmails.length)];
    case 'nosql':
      // Los emails NoSQL injection son objetos, no strings
      throw new Error('NoSQL injection requires object payload, not string email');
    default:
      const randomId = Math.random().toString(36).substring(2, 10);
      return `user_${randomId}@example.com`;
  }
}

/**
 * Genera nombre malicioso para tests XSS
 */
export function createMaliciousName(): string {
  const xssNames = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
    `Test User ${Math.random().toString(36).substring(2, 10)}<script>alert("XSS")</script>`,
  ];

  return xssNames[Math.floor(Math.random() * xssNames.length)];
}

/**
 * Genera payload de inyección NoSQL
 */
export function createNoSqlInjectionPayload(field: 'email' | 'password'): object {
  const payloads = [
    { $ne: null },
    { $gt: '' },
    { $regex: '.*' },
    { $where: 'this.password == "hacked"' },
  ];

  return {
    [field]: payloads[Math.floor(Math.random() * payloads.length)],
  };
}

/**
 * Genera múltiples usuarios para load testing
 */
export function createBulkUsers(count: number): UserData[] {
  return Array.from({ length: count }, (_, i) => ({
    email: `test_${i}_${Date.now()}@example.com`,
    password: 'SecurePass123!',
    name: `Test User ${i}`,
  }));
}

/**
 * Genera credenciales de administrador para testing
 */
export function createAdminUser(overrides?: Partial<UserData>): UserData {
  const randomId = Math.random().toString(36).substring(2, 10);
  return {
    email: `admin_${randomId}@admin.test`,
    password: 'AdminSecurePass123!',
    name: `Admin User ${randomId}`,
    ...overrides,
  };
}

/**
 * Genera usuario con edge cases
 */
export function createEdgeCaseUser(scenario: 'long-email' | 'short-password' | 'special-chars'): UserData {
  const randomId = Math.random().toString(36).substring(2, 10);
  switch (scenario) {
    case 'long-email':
      return {
        email: `${'a'.repeat(200)}@example.com`,
        password: 'SecurePass123!',
        name: `Test User ${randomId}`,
      };
    case 'short-password':
      return {
        email: `user_${randomId}@example.com`,
        password: 'Aa1!', // Mínimo válido
        name: `Test User ${randomId}`,
      };
    case 'special-chars':
      return {
        email: `user_${randomId}@example.com`,
        password: 'P@$$w0rd!#$%^&*()',
        name: 'José María García-López Ñoño',
      };
    default:
      return createValidUser();
  }
}
