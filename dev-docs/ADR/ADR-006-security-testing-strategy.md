# ADR-006: Security Testing Strategy in Clean Architecture

## Status
✅ Accepted (2024-01-XX)

## Context
Necesitamos implementar pruebas de seguridad en un proyecto con arquitectura Clean Architecture + DDD, donde:
- La capa de dominio no tiene dependencias externas
- Los repositorios son interfaces en la capa de aplicación
- La infraestructura real (DB, APIs) puede ser stubbed en testing
- Debemos prevenir falsos positivos en tests de seguridad

## Problem
¿Cómo testear vulnerabilidades de seguridad (SQL Injection, XSS, etc.) cuando:
1. Los repositorios son in-memory en testing?
2. No hay una base de datos real que pueda ser inyectada?
3. Los tests pueden pasar incorrectamente dando falsa sensación de seguridad?

## Decision

### Principios Fundamentales

1. **Testear en el Validation Layer, no en el Repository**
   - Las pruebas de inyección deben validar que el input es rechazado ANTES de llegar al repository
   - El validation layer (domain/application) debe sanitizar/rechazar inputs maliciosos
   - Status esperado: 400 Bad Request o 422 Unprocessable Entity

2. **No depender de infraestructura real para security testing**
   - Los tests de seguridad son E2E desde la perspectiva HTTP
   - Pero validan comportamiento del validation layer, no de la DB
   - Esto permite tests rápidos y determinísticos

3. **Prevenir Falsos Positivos**
   - Un test pasa solo si el payload malicioso es RECHAZADO o SANITIZADO
   - Nunca asumir que un test pasó porque "no hubo error"
   - Validar explícitamente status codes y respuestas

### Arquitectura de Tests de Seguridad

```
tests/
├── e2e/
│   └── security/
│       ├── input-validation.e2e.test.ts    # SQL Injection, XSS
│       ├── injection-prevention.e2e.test.ts # NoSQL, Path Traversal
│       └── auth-bypass.e2e.test.ts         # Authentication tests
├── helpers/
│   └── security-test-helpers.ts            # Utilidades reutilizables
```

### Patrones de Implementación

#### Patrón 1: SQL Injection Prevention Test
```typescript
test('rechaza emails con SQL injection', async () => {
  const maliciousEmail = "'; DROP TABLE users; --";
  const response = await request(app)
    .post('/api/users/register')
    .send({ email: maliciousEmail, password: 'Pass123!', name: 'Test' });
  
  // El validation layer debe rechazar esto
  expect(response.status).toBe(400);
  expect(response.body.error).toMatch(/invalid.*email/i);
});
```

#### Patrón 2: XSS Prevention Test
```typescript
test('sanitiza nombres con XSS', async () => {
  const maliciousName = '<script>alert("XSS")</script>';
  const response = await request(app)
    .post('/api/users/register')
    .send({ email: 'valid@test.com', password: 'Pass123!', name: maliciousName });
  
  // Opción A: Rechazo completo (recomendado)
  expect(response.status).toBe(400);
  
  // Opción B: Sanitización (si esa es la política)
  // expect(response.body.data.name).not.toContain('<script>');
});
```

#### Patrón 3: Helper Reutilizable
```typescript
export async function testSqlInjectionPrevention(
  endpoint: string,
  basePayload: { password: string; name: string },
  app: express.Application
): Promise<SecurityTestResult[]> {
  // Implementación genérica para testear múltiples payloads
}
```

### Herramientas

- **supertest**: Para requests HTTP
- **Jest**: Para assertions y test runner
- **@faker-js/faker**: Para generar datos de test válidos
- **Helpers custom**: Para reutilizar lógica de testing

### Criterios de Aceptación

✅ Todos los payloads de SQL Injection son rechazados (400/422)
✅ Todos los payloads XSS son rechazados o sanitizados
✅ Los mensajes de error no revelan detalles internos (no SQL, table, database)
✅ Tests son determinísticos y no dependen de DB real
✅ Helpers de seguridad documentados y reutilizables

## Consequences

### Positivas
- ✅ Tests de seguridad rápidos (< 100ms por test)
- ✅ Sin dependencia de infraestructura real
- ✅ Prevención de falsos positivos
- ✅ Cobertura temprana en el ciclo de desarrollo
- ✅ Documentación viva de comportamientos de seguridad

### Negativas
- ⚠️ No detecta vulnerabilidades en queries SQL reales (requiere DB real)
- ⚠️ Requiere disciplina para mantener tests actualizados
- ⚠️ Puede dar falsa confianza si no se complementa con penetration testing

### Riesgos Mitigados
- 🔒 Falsos positivos: Mitigado con validación explícita de status codes
- 🔒 Vulnerabilidades reales: Mitigado con complemento de penetration testing en staging
- 🔒 Mantenimiento: Mitigado con helpers reutilizables y documentación

## Compliance

Este ADR cumple con:
- ✅ ADR-003: Test Isolation Strategy
- ✅ ADR-004: Integration Test Structure Standards
- ✅ Clean Architecture principles
- ✅ OWASP Testing Guide v4

## References

- OWASP Testing Guide: https://owasp.org/www-project-testing-guide/
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- ADR-003: Test Isolation Strategy
- ADR-004: Integration Test Structure Standards
