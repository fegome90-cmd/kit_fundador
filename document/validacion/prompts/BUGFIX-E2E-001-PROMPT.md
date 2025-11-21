---
meta:
  id: "BUGFIX-E2E-001"
  version: "1.0.0"
  created_at: "2025-11-19"
  updated_at: "2025-11-19"
  type: "bug-fix"
  severity: "critical"
  estimated_duration: "1h"
---

# PROMPT: Corrección Crítica - Test E2E Roto por Métodos Faltantes

## 1. Resumen del Bug

**Ticket/ID**: BUGFIX-E2E-001
**Severidad**: Crítica
**Módulo Afectado**: tests/e2e/user-registration.e2e.test.ts
**Reportado por**: VALIDADOR v2.1

### Comportamiento Observado (El Problema)
```
FAIL tests/e2e/user-registration.e2e.test.ts
Test Suites: 1 failed, 1 total
Tests: 0 total (No se ejecutaron por errores de compilación)
```

**Errores TypeScript específicos**:
- ❌ `Property 'findById' does not exist on type 'InMemoryUserAccountRepository'`
- ❌ `Property 'findAll' does not exist on type 'InMemoryUserAccountRepository'` 
- ❌ `Parameter 'user' implicitly has an 'any' type`
- ❌ `'index' is declared but its value is never read`

### Comportamiento Esperado
El test E2E debería compilar sin errores TypeScript y ejecutarse completamente, validando el flujo end-to-end de registro de usuarios.

### Pasos para Reproducir
1. `npm test tests/e2e/user-registration.e2e.test.ts`
2. **Resultado**: FAIL por errores de compilación TypeScript

---

## 2. Análisis de la Causa Raíz (Root Cause Analysis)

### Investigación Realizada
He analizado el test E2E y el repository stub. El problema es que el test intenta usar métodos que NO EXISTEN en `InMemoryUserAccountRepository`.

### Causa Raíz Identificada
**PROBLEMA PRINCIPAL**: El test E2E requiere métodos `findById()` y `findAll()` que están **completamente ausentes** del repository stub. El test está intentando acceder a funcionalidad que no fue implementada en el stub base.

**PROBLEMAS SECUNDARIOS**:
- Parámetros sin tipos explícitos (`user: any`)
- Variables no utilizadas (`index`)

---

## 3. Solución Propuesta

### Descripción de la Solución
**FASE 1: Implementar Métodos Faltantes en Repository**
- Agregar `findById(userId: string): Promise<User | null>` al repository
- Agregar `findAll(): Promise<User[]>` al repository  
- Asegurar que ambos métodos respeten el repository pattern

**FASE 2: Corregir Errores TypeScript**
- Agregar tipos explícitos a parámetros (`user: User`)
- Remover o usar variables no utilizadas (`index`)

**FASE 3: Validar Implementación**
- Verificar que todos los tests E2E compilen
- Verificar que todos los tests E2E pasen
- Asegurar que no hay regression en otros tests

### Archivos a Modificar
1. **`src/infrastructure/_stubs/InMemoryUserAccountRepository.ts`**
   - Agregar `findById(userId: string): Promise<User | null>`
   - Agregar `findAll(): Promise<User[]>`

2. **`tests/e2e/user-registration.e2e.test.ts`**
   - Corregir tipos de parámetros: `user: User`
   - Usar variable `index` o removerla
   - Validar que tests compilen

### Impacto de la Solución
- **Funcional**: Tests E2E funcionan correctamente
- **Técnico**: Repository stub con funcionalidad completa
- **Riesgos**: Bajo - Solo afecta al stub de testing

---

## 4. Plan de Verificación

### Pruebas a Realizar
- **Test Compilación**: `npm test tests/e2e/user-registration.e2e.test.ts` debe compilar sin errores
- **Test Ejecución**: Todos los tests E2E deben pasar
- **Test Regression**: Todos los tests existentes deben seguir pasando
- **Validación Manual**: Verificar que métodos funcionan correctamente

### Criterios de Aceptación (Definition of Done)
- [ ] Los métodos `findById` y `findAll` están implementados
- [ ] Todos los tests E2E compilan sin errores TypeScript
- [ ] Todos los tests E2E se ejecutan y pasan
- [ ] No hay regression en tests existentes (8/8 suites siguen pasando)
- [ ] El código sigue las guías de estilo y patrones del proyecto

### Detalles Específicos de Implementación

#### En `InMemoryUserAccountRepository.ts`:
```typescript
// AGREGAR ESTOS MÉTODOS:
async findById(userId: string): Promise<User | null> {
  const user = this.users.find(u => u.getId() === userId);
  return user || null;
}

async findAll(): Promise<User[]> {
  return [...this.users]; // Retornar copia para evitar mutación externa
}
```

#### En `user-registration.e2e.test.ts`:
```typescript
// CORREGIR TIPOS:
allUsers.forEach((user: User) => { // ← Agregar tipo explícito

// USAR INDEX O REMOVER:
concurrentUsers.forEach((expectedUser, index) => { // ← Usar index o remover
  const storedUser = allUsers.find((user: User) => user.getEmail() === expectedUser.email);
```

---

## 5. Prioridad y Timing

**PRIORIDAD**: 🔴 **CRÍTICA** - Bloquea Phase 3 completion
**TIMING**: Inmediato - Requiere corrección antes de validación final
**BLOCKING**: Sin estos fixes, Phase 3 no puede completarse

---

## 6. Archivos de Referencia

- **`tests/e2e/user-registration.e2e.test.ts`** - Test que falla
- **`src/infrastructure/_stubs/InMemoryUserAccountRepository.ts`** - Repository stub
- **`src/domain/entities/User.ts`** - User entity para tipos
- **`package.json`** - Scripts de test
- **`tsconfig.json`** - Configuración TypeScript

---

**Asignado a**: EJECUTOR
**Revisor**: VALIDADOR v2.1  
**Fecha**: 2025-11-19
**Estado**: Listo para Implementación CRÍTICA

**PRÓXIMO PASO**: EJECUTOR debe implementar los fixes y reportar cuando esté listo para revalidación.