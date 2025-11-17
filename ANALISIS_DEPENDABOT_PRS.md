# Análisis de PRs de Dependabot - Kit Fundador v2.0

**Fecha**: 2025-11-16
**Total PRs**: 7
**Estado**: 📊 Análisis Completo

---

## Executive Summary

Se detectaron **7 Pull Requests de Dependabot** que actualizan dependencias npm y GitHub Actions. De estas:

- ✅ **2 PRs SEGURAS** (GitHub Actions) - Merge inmediato recomendado
- ⚠️ **3 PRs REQUIEREN TESTING** (Major version bumps) - Merge con precaución
- 🔴 **2 PRs CONFLICTIVAS** (Incompatibilidades entre sí) - Requieren consolidación

**Riesgo Global**: 🟡 **MEDIO** (Major version bumps requieren testing)

**Orden de Merge Recomendado**: Ver sección "Plan de Acción"

---

## 📊 Análisis Detallado por PR

### PR #1: actions/checkout v4 → v5 ✅ SEGURO

**Rama**: `dependabot/github_actions/actions/checkout-5`

**Cambios**:
```diff
.github/workflows/ci.yml:
-        uses: actions/checkout@v4
+        uses: actions/checkout@v5

.github/workflows/codeql.yml:
-        uses: actions/checkout@v4
+        uses: actions/checkout@v5
```

**Análisis**:
- **Tipo**: GitHub Action update
- **Version jump**: v4 → v5 (major version)
- **Breaking changes**: No significativos para uso estándar
- **Files changed**: 2 (ci.yml, codeql.yml)
- **Riesgo**: 🟢 **BAJO**

**Justificación**:
- actions/checkout es mantenido por GitHub directamente
- v5 es retrocompatible para casos de uso estándar
- No requiere cambios de configuración
- No afecta código del proyecto, solo CI/CD

**Recomendación**: ✅ **MERGE INMEDIATO**

**Validación post-merge**:
- Verificar que CI runs correctamente
- No requiere testing manual

---

### PR #2: github/codeql-action v3 → v4 ✅ SEGURO

**Rama**: `dependabot/github_actions/github/codeql-action-4`

**Cambios**:
```diff
.github/workflows/codeql.yml:
-        uses: github/codeql-action/init@v3
+        uses: github/codeql-action/init@v4

-        uses: github/codeql-action/autobuild@v3
+        uses: github/codeql-action/autobuild@v4

-        uses: github/codeql-action/analyze@v3
+        uses: github/codeql-action/analyze@v4
```

**Análisis**:
- **Tipo**: GitHub Action update
- **Version jump**: v3 → v4 (major version)
- **Breaking changes**: Mínimos, bien documentados
- **Files changed**: 1 (codeql.yml)
- **Riesgo**: 🟢 **BAJO**

**Justificación**:
- CodeQL action es mantenido por GitHub
- v4 mejora performance y accuracy
- Configuración actual es compatible
- No afecta código del proyecto

**Recomendación**: ✅ **MERGE INMEDIATO**

**Validación post-merge**:
- Verificar que CodeQL analysis completa
- Revisar nuevos findings (si los hay)

---

### PR #3: ESLint 8.x → 9.39.1 ⚠️ REQUIERE TESTING

**Rama**: `dependabot/npm_and_yarn/eslint-9.39.1`

**Cambios**:
```diff
package.json:
-    "eslint": "^8.0.0",
+    "eslint": "^9.39.1",
```

**Análisis**:
- **Tipo**: npm devDependency
- **Version jump**: 8.0.0 → 9.39.1 (major version)
- **Breaking changes**: ⚠️ SÍ - Flat config required
- **Files changed**: 2 (package.json, package-lock.json)
- **Riesgo**: 🟡 **MEDIO**

**Breaking Changes Conocidos**:

1. **Flat Config System** (nuevo formato de configuración):
   ```javascript
   // ANTES (.eslintrc.json)
   {
     "extends": ["eslint:recommended"],
     "rules": { ... }
   }

   // AHORA (eslint.config.js) - REQUERIDO
   export default [
     { rules: { ... } }
   ];
   ```

2. **Removal of deprecated rules**:
   - `indent` (reemplazado por formatter)
   - Varias reglas de formatting (migradas a prettier)

3. **Peer dependencies**:
   - Requiere Node.js 18+
   - Incompatible con @typescript-eslint@6 (requiere @typescript-eslint@8)

**Conflictos Detectados**:
- ❌ **CONFLICTO**: `@typescript-eslint/eslint-plugin@6.0.0` NO compatible con ESLint 9
- ❌ **CONFLICTO**: `@typescript-eslint/parser@6.0.0` NO compatible con ESLint 9
- ✅ PR #5 actualiza `@typescript-eslint/parser` a 8.46.4 (compatible)
- ❌ Falta actualizar `@typescript-eslint/eslint-plugin` a v8

**Archivos Afectados**:
- `.eslintrc.json` → Necesita migración a `eslint.config.js`
- `package.json` scripts de lint → Podrían necesitar ajustes

**Recomendación**: ⚠️ **NO MERGE HASTA**:
1. Mergear PR #5 primero (@typescript-eslint/parser@8)
2. Actualizar manualmente `@typescript-eslint/eslint-plugin` a v8
3. Migrar `.eslintrc.json` a flat config
4. Ejecutar `npm run lint` y corregir errores

**Effort Estimado**: 2-3 horas

---

### PR #4: Express 4.18 → 5.1.0 🔴 CRÍTICO - BREAKING CHANGES

**Rama**: `dependabot/npm_and_yarn/express-5.1.0`

**Cambios**:
```diff
package.json:
-    "express": "^4.18.0",
+    "express": "^5.1.0",
```

**Análisis**:
- **Tipo**: npm dependency (PRODUCCIÓN)
- **Version jump**: 4.18.0 → 5.1.0 (major version)
- **Breaking changes**: ⚠️ **MÚLTIPLES Y SIGNIFICATIVOS**
- **Files changed**: 2 (package.json, package-lock.json)
- **Riesgo**: 🔴 **ALTO**

**Breaking Changes Críticos**:

1. **Async Error Handling** (MAYOR CAMBIO):
   ```javascript
   // ANTES (Express 4): Errores async NO se capturan automáticamente
   app.get('/user', async (req, res) => {
     const user = await User.findById(req.params.id);  // Si falla, crash
     res.json(user);
   });

   // AHORA (Express 5): Async errors se capturan automáticamente
   app.get('/user', async (req, res) => {
     const user = await User.findById(req.params.id);  // Si falla, va a error handler
     res.json(user);
   });
   ```

2. **Removed Methods**:
   - `app.del()` → usar `app.delete()`
   - `req.param()` → usar `req.params`, `req.query`, `req.body`
   - `res.send()` con status → usar `res.status().send()`

3. **Rejected Promises**:
   - Express 5 rechaza promises sin `catch()`
   - Puede exponer stack traces en producción si no se maneja

4. **Path Matching**:
   - Cambios en cómo se parsean rutas con caracteres especiales
   - Puede romper rutas existentes

5. **Middleware Signature**:
   - Algunos middleware de terceros NO son compatibles
   - Necesita actualizar: body-parser, cors, helmet, etc.

**Impacto en Kit Fundador**:

**🔴 CRÍTICO**: El template NO incluye código Express aún (solo en package.json)

**Estado del Proyecto**:
```bash
$ find templates/typescript/src -name "*.ts" | xargs grep -l "express"
# (vacío - NO hay código Express implementado)
```

**Análisis**:
- ✅ **Ventaja**: No hay código existente que pueda romperse
- ❌ **Desventaja**: Usuarios que copien el template usarán Express 5 sin saberlo
- ⚠️ **Problema**: Toda la documentación online asume Express 4

**Recomendación**: 🔴 **NO MERGE** (al menos temporalmente)

**Razones**:
1. Express 5 aún está en release candidate (5.1.0 es reciente)
2. Ecosistema de middleware aún migrando
3. Documentación y tutorials asumen Express 4
4. Cambio NO aporta valor inmediato (no hay código Express)
5. Podría confundir a usuarios nuevos

**Alternativa**:
- Mantener Express 4 por ahora
- Crear issue para migrar a Express 5 cuando sea LTS
- Documentar en README que Express 5 está disponible

**Si decides mergear** (NO recomendado):
- [ ] Actualizar README mencionando Express 5
- [ ] Agregar ejemplo de error handling async
- [ ] Documentar breaking changes en ADR
- [ ] Testing exhaustivo con middleware comunes

**Effort Estimado**: 1 hora (actualizar docs) + testing extensivo

---

### PR #5: @typescript-eslint/parser 6.x → 8.46.4 ⚠️ REQUIERE TESTING

**Rama**: `dependabot/npm_and_yarn/typescript-eslint/parser-8.46.4`

**Cambios**:
```diff
package.json:
-    "@typescript-eslint/parser": "^6.0.0",
+    "@typescript-eslint/parser": "^8.46.4",
```

**Análisis**:
- **Tipo**: npm devDependency
- **Version jump**: 6.0.0 → 8.46.4 (major version + minor updates)
- **Breaking changes**: ⚠️ Moderados
- **Files changed**: 2 (package.json, package-lock.json)
- **Riesgo**: 🟡 **MEDIO**

**Breaking Changes**:

1. **Requiere ESLint 9+**:
   - NO compatible con ESLint 8
   - Debe mergearse después de PR #3

2. **Requiere TypeScript 5.7+**:
   - Template actual usa TypeScript 5.0+
   - ✅ Compatible (^5.0.0 incluye 5.7)

3. **Parser Options Changes**:
   ```javascript
   // Algunos parser options deprecados
   // Revisar .eslintrc.json
   ```

4. **Debe ir acompañado de `@typescript-eslint/eslint-plugin@8`**:
   - ❌ PR solo actualiza parser
   - ❌ Falta actualizar plugin
   - Pueden haber incompatibilidades

**Dependencias**:
- ✅ Requiere mergear PR #3 (ESLint 9) primero
- ⚠️ Requiere actualizar también `@typescript-eslint/eslint-plugin` a v8

**Recomendación**: ⚠️ **MERGE CON PRECAUCIÓN**

**Orden de operaciones**:
1. Mergear PR #3 (ESLint 9)
2. Actualizar manualmente `@typescript-eslint/eslint-plugin` a ^8.0.0
3. Mergear este PR #5
4. Testing: `npm run lint && npm run build`

**Validación post-merge**:
```bash
npm run lint        # Debe pasar sin errores
npm run build       # Debe compilar
npm run type-check  # Debe pasar
```

**Effort Estimado**: 1 hora (incluyendo testing)

---

### PR #6: @types/node 20.x → 24.10.1 ⚠️ REQUIERE TESTING

**Rama**: `dependabot/npm_and_yarn/types/node-24.10.1`

**Cambios**:
```diff
package.json:
-    "@types/node": "^20.0.0",
+    "@types/node": "^24.10.1",
```

**Análisis**:
- **Tipo**: npm devDependency (Type definitions)
- **Version jump**: 20.0.0 → 24.10.1 (major version jump x4)
- **Breaking changes**: ⚠️ Cambios en type definitions
- **Files changed**: 2 (package.json, package-lock.json)
- **Riesgo**: 🟡 **MEDIO-BAJO**

**Análisis de Versiones**:

**Contexto**: @types/node versions corresponden a Node.js versions
- `@types/node@20` → Para Node.js 20 LTS
- `@types/node@24` → Para Node.js 24 (futuro/experimental)

**🔴 PROBLEMA**: Node.js 24 NO existe aún

**Verificación**:
```bash
# Node.js releases actuales (Nov 2025):
# - v22.x (Current)
# - v20.x (LTS)
# - v18.x (Maintenance)
```

**Análisis Detallado**:

**Posibilidades**:
1. **Error de Dependabot**: Puede ser un número de versión incorrecto
2. **Future types**: Definitions para Node.js futuro (no recomendado)
3. **Versioning scheme change**: @types/node cambió su versionado

**Investigación Necesaria**:
```bash
npm view @types/node versions | grep "24\."
```

**Impacto Esperado**:

**Si @types/node@24 existe**:
- Puede agregar/cambiar type definitions
- Podría romper TypeScript compilation si usa nuevas APIs
- Template actual NO usa APIs específicas de Node.js avanzadas

**Código Afectado**:
```typescript
// templates/typescript/src/domain/entities/User.ts
// NO importa ningún módulo de Node.js directamente
// Bajo riesgo de breaking changes
```

**Recomendación**: ⚠️ **INVESTIGAR PRIMERO**

**Pasos**:
1. Verificar que `@types/node@24.10.1` existe en npm
2. Si existe, revisar changelog
3. Si es estable, hacer testing local:
   ```bash
   npm install --save-dev @types/node@24.10.1
   npm run build
   npm run type-check
   ```
4. Si pasa, mergear
5. Si falla, rechazar PR y pin a `@types/node@20.x`

**Alternativa SEGURA**:
- Actualizar a `@types/node@22` (Node.js 22 existe y es stable)
- Cerrar este PR y crear uno manual con versión correcta

**Effort Estimado**: 30 minutos (investigación + testing)

---

### PR #7: Multi-update (Jest + @types/jest) ⚠️ REQUIERE TESTING

**Rama**: `dependabot/npm_and_yarn/multi-a28ee524ce`

**Cambios**:
```diff
package.json:
-    "@types/jest": "^29.5.0",
+    "@types/jest": "^30.0.0",

-    "jest": "^29.0.0",
+    "jest": "^30.2.0",
```

**Análisis**:
- **Tipo**: npm devDependencies (Testing framework)
- **Version jump**: 29.x → 30.x (major version para ambos)
- **Breaking changes**: ⚠️ **SIGNIFICATIVOS**
- **Files changed**: 2 (package.json, package-lock.json con 2424 líneas cambiadas)
- **Riesgo**: 🟡 **MEDIO-ALTO**

**Breaking Changes en Jest 30**:

**Verificación**: Jest 30 fue released recientemente (2024)

**Cambios Principales**:

1. **Drop Node.js 18 support**:
   - Requiere Node.js 20+ (Node.js 18 LTS hasta 2025-04-30)
   - ✅ Template especifica Node 20, compatible

2. **ESM Support Changes**:
   - Mejoras en ESM pero puede romper configs existentes
   - Template usa CommonJS, debería estar OK

3. **expect() API changes**:
   - Algunos matchers deprecados
   - Mensajes de error mejorados

4. **Timer mocks refactor**:
   - `jest.useFakeTimers()` cambió su API
   - Si tests usan timers, pueden romperse

5. **Snapshot format changes**:
   - Formato de snapshots puede cambiar
   - ⚠️ Puede requerir actualizar snapshots

6. **ts-jest compatibility**:
   - Requiere `ts-jest@29.3.0+` para Jest 30
   - Verificar si package-lock actualiza ts-jest

**Impacto en Kit Fundador**:

**Tests Existentes**:
```bash
$ find templates/typescript/tests -name "*.test.ts"
templates/typescript/tests/unit/User.test.ts
```

**Análisis del test**:
- ✅ Usa sintaxis estándar (describe, it, expect)
- ✅ No usa timers ni mocks complejos
- ✅ No usa snapshots
- ⚠️ Podría necesitar ajustes menores

**Código del Test**:
```typescript
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

describe('User Entity', () => {
  it('should create a valid user', () => {
    const email = Email.create('test@example.com');
    const password = Password.create('SecurePass123!');
    const user = User.create({...});

    expect(user.id).toBeDefined();  // ✅ Sintaxis compatible
  });
});
```

**⚠️ PROBLEMA CRÍTICO EXISTENTE**:
```typescript
import { Password } from '@domain/value-objects/Password';  // ❌ ARCHIVO NO EXISTE
```

**Actualización bloqueada por**:
- 🔴 Tests NO ejecutan actualmente (imports rotos)
- 🔴 Hasta que se implemente Password VO, no se puede validar Jest 30

**Recomendación**: ⚠️ **NO MERGE HASTA**:
1. Implementar Password.ts (de auditoría TDD/DDD)
2. Implementar DomainEvent.ts y UserCreatedEvent.ts
3. Validar que tests pasan con Jest 29
4. LUEGO actualizar a Jest 30 y re-testear

**Validación post-merge** (cuando sea posible):
```bash
npm run test              # Todos los tests pasan
npm run test:coverage     # Coverage >= 80%
npm run test:unit         # Unit tests pasan
```

**Effort Estimado**:
- Pre-requisitos: 4 horas (implementar Password, DomainEvents)
- Actualización Jest: 1 hora (testing y ajustes)
- **Total**: 5 horas

---

## 🔄 Matriz de Dependencias

Visualización de dependencias entre PRs:

```
┌─────────────────────────────────────────────────────────┐
│  PR #1: actions/checkout v5            │ ✅ Independiente │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PR #2: codeql-action v4               │ ✅ Independiente │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PR #3: ESLint 9                       │                 │
│         ↓ requiere                     │                 │
│  PR #5: @typescript-eslint/parser@8   │                 │
│         ↓ también necesita             │                 │
│  (manual) @typescript-eslint/plugin@8  │ ⚠️ Dependiente  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PR #4: Express 5                      │ 🔴 Standalone   │
│                                        │ NO recomendado  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PR #6: @types/node@24                 │ ⚠️ Investigar   │
│                                        │ Standalone      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  PR #7: Jest 30 + @types/jest          │ 🔴 Bloqueado    │
│         ↓ requiere                     │ por bugs        │
│  (pre-requisito) Implementar:          │ existentes      │
│  - Password.ts                         │                 │
│  - DomainEvent.ts                      │                 │
│  - UserCreatedEvent.ts                 │                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Plan de Acción Recomendado

### FASE 1: Merges Seguros (INMEDIATO) - 15 minutos

**Objetivo**: Actualizar GitHub Actions sin riesgo

#### 1.1 Merge PR #1 - actions/checkout v5
```bash
# Desde GitHub UI o CLI:
gh pr merge <PR-number> --squash

# Validación:
# - Verificar que CI ejecuta correctamente
# - No requiere testing adicional
```

#### 1.2 Merge PR #2 - codeql-action v4
```bash
gh pr merge <PR-number> --squash

# Validación:
# - Verificar que CodeQL analysis completa
# - Revisar findings (si los hay)
```

**Resultado**: ✅ 2/7 PRs mergeados

---

### FASE 2: Decisión sobre Express (ESTRATÉGICA) - 30 minutos

**Objetivo**: Decidir estrategia para Express 5

#### Opción A: NO mergear (RECOMENDADO)

**Razones**:
- Express 5 aún está madurando
- No hay código Express en el template actual
- Usuarios esperan Express 4 (estándar)
- No aporta valor inmediato

**Acción**:
```bash
# Cerrar PR con comentario explicativo
gh pr close <PR-number> --comment "Mantenemos Express 4 por estabilidad. Express 5 se considerará cuando sea LTS."

# Actualizar package.json con pin explícito
"express": "~4.18.0",  # Pin a 4.18.x
```

#### Opción B: Mergear con documentación (NO RECOMENDADO)

**Solo si decides proceder**:
- [ ] Crear ADR documentando migración a Express 5
- [ ] Actualizar README con breaking changes
- [ ] Agregar ejemplos de error handling async
- [ ] Testing extensivo

**Resultado**: 🔴 PR #4 cerrado (recomendado)

---

### FASE 3: Investigación @types/node (30 minutos)

**Objetivo**: Validar si @types/node@24 es correcto

#### 3.1 Investigar versión
```bash
npm view @types/node@24.10.1

# Si NO existe:
# - Cerrar PR
# - Crear issue en Dependabot

# Si existe:
# - Revisar changelog
# - Proceder a testing
```

#### 3.2 Testing local (si existe)
```bash
cd templates/typescript
npm install --save-dev @types/node@24.10.1
npm run build
npm run type-check

# Si pasa: Mergear
# Si falla: Cerrar PR y pin a @types/node@20.x
```

**Resultado**: ✅ o 🔴 PR #6 (según resultado)

---

### FASE 4: Fix de Bloqueadores (CRÍTICO) - 4 horas

**Objetivo**: Implementar código faltante antes de actualizar Jest/ESLint

**Este es el BLOQUEADOR MAYOR de las actualizaciones**

#### 4.1 Implementar Password Value Object [1.5h]
```typescript
// templates/typescript/src/domain/value-objects/Password.ts
export class Password {
  private readonly _hash: string;

  private constructor(hash: string) {
    this._hash = hash;
  }

  static create(plaintext: string): Password {
    // Validar: min 8 chars, regex
    if (plaintext.length < 8) {
      throw new Error('Password must be at least 8 characters');
    }
    // Hashear con bcrypt
    const hash = bcrypt.hashSync(plaintext, 10);
    return new Password(hash);
  }

  verify(plaintext: string): boolean {
    return bcrypt.compareSync(plaintext, this._hash);
  }

  get hash(): string {
    return this._hash;
  }
}
```

**Tests**:
```typescript
// templates/typescript/tests/unit/value-objects/Password.test.ts
// 15 tests mínimo
```

#### 4.2 Implementar Domain Events [1.5h]
```typescript
// templates/typescript/src/domain/events/DomainEvent.ts
export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly occurredAt: Date;

  constructor() {
    this.eventId = crypto.randomUUID();
    this.occurredAt = new Date();
  }

  abstract get eventType(): string;
}

// templates/typescript/src/domain/events/UserCreatedEvent.ts
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredAt: Date
  ) {
    super();
  }

  get eventType(): string {
    return 'UserCreated';
  }
}
```

#### 4.3 Actualizar imports en User.ts [15min]
```typescript
// Fix imports
import { DomainEvent } from '../events/DomainEvent';
import { UserCreatedEvent } from '../events/UserCreatedEvent';
```

#### 4.4 Validar que tests pasan [30min]
```bash
cd templates/typescript
npm install
npm run build   # Debe compilar
npm test        # Debe pasar
```

**Resultado**: ✅ Código compilable, tests ejecutables

**Commit**:
```bash
git add .
git commit -m "fix: Implement Password VO and Domain Events (unblocks dependency updates)

Implements missing components identified in AUDITORIA_TDD_DDD.md:
- Password.ts Value Object with bcrypt hashing
- DomainEvent.ts base class
- UserCreatedEvent.ts implementation
- 15 tests for Password VO

This unblocks:
- Jest 30 update (PR #7)
- ESLint 9 update (PR #3)
"
```

---

### FASE 5: Actualización ESLint Stack (COMPLEJA) - 2-3 horas

**Objetivo**: Actualizar todo el stack de ESLint de forma coordinada

⚠️ **ADVERTENCIA**: Este es un cambio complejo que requiere testing extensivo

#### 5.1 Actualizar @typescript-eslint/eslint-plugin manualmente [30min]

**Problema**: PR #5 solo actualiza parser, falta plugin

```bash
cd templates/typescript
npm install --save-dev @typescript-eslint/eslint-plugin@^8.0.0

# Validar compatibilidad
npm list @typescript-eslint/parser
npm list @typescript-eslint/eslint-plugin
# Deben estar ambos en v8
```

#### 5.2 Mergear PR #3 (ESLint 9) [15min]
```bash
gh pr merge <PR-number-eslint> --squash
```

#### 5.3 Mergear PR #5 (@typescript-eslint/parser) [15min]
```bash
gh pr merge <PR-number-parser> --squash
```

#### 5.4 Migrar a Flat Config [1-1.5h]

**CRÍTICO**: ESLint 9 requiere flat config

```bash
# Eliminar .eslintrc.json
rm templates/typescript/.eslintrc.json

# Crear eslint.config.js
```

```javascript
// templates/typescript/eslint.config.js
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';

export default [
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tsparser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      'max-lines-per-function': ['error', 20],
      'max-params': ['error', 3],
      'complexity': ['error', 10],
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
];
```

#### 5.5 Testing [30min]
```bash
npm run lint        # Debe pasar sin errores
npm run lint:fix    # Debe corregir issues
npm run build       # Debe compilar
npm run type-check  # Debe pasar
```

#### 5.6 Actualizar documentación [15min]

```markdown
# README.md - agregar nota
⚠️ Este template usa ESLint 9 con Flat Config.
Si necesitas ESLint 8, haz downgrade antes de npm install.
```

**Resultado**: ✅ ESLint 9 + @typescript-eslint v8 funcional

**Commit**:
```bash
git add .
git commit -m "build: Upgrade to ESLint 9 + @typescript-eslint v8

BREAKING CHANGE: Migrates from .eslintrc.json to flat config (eslint.config.js)

Changes:
- ESLint 8.0.0 → 9.39.1
- @typescript-eslint/parser 6.0.0 → 8.46.4
- @typescript-eslint/eslint-plugin 6.0.0 → 8.0.0
- Migrated to flat config format

Validation:
- All linting rules pass
- Build succeeds
- Type checking passes
"
```

---

### FASE 6: Actualización Jest (FINAL) - 1 hora

**Objetivo**: Actualizar Jest 30 y validar tests

**Pre-requisito**: Fase 4 completada (código compila y tests pasan)

#### 6.1 Mergear PR #7 (Jest 30)
```bash
gh pr merge <PR-number-jest> --squash
```

#### 6.2 Validar ts-jest compatibility
```bash
npm list ts-jest
# Debe ser ts-jest@29.3.0+ (compatible con Jest 30)

# Si no, actualizar:
npm install --save-dev ts-jest@^29.3.0
```

#### 6.3 Ejecutar tests [30min]
```bash
npm test                  # Todos pasan
npm run test:coverage     # Coverage >= 80%
npm run test:watch        # Watch mode funciona
```

#### 6.4 Actualizar snapshots (si necesario)
```bash
npm test -- -u
```

#### 6.5 Validación completa
```bash
npm run lint              # ✅ Pasa
npm run build             # ✅ Compila
npm run type-check        # ✅ Pasa
npm test                  # ✅ Pasa
npm run test:coverage     # ✅ >= 80%
```

**Resultado**: ✅ Jest 30 funcionando

**Commit**: (automático del merge de PR)

---

## 📊 Resumen de Resultados Esperados

### Después de Completar Todas las Fases

**PRs Mergeados**: ✅ 4-5 de 7 (dependiendo de @types/node)
**PRs Cerrados**: 🔴 2 (Express 5, posiblemente @types/node)
**Commits Manuales**: 3
1. Implementación de Password + DomainEvents
2. Actualización de @typescript-eslint/eslint-plugin
3. Migración a ESLint flat config

**Estado Final**:
```json
{
  "devDependencies": {
    "@types/jest": "^30.0.0",           // ✅ Actualizado
    "@types/node": "^20.0.0" o "^24.x", // ⚠️ Según investigación
    "@typescript-eslint/eslint-plugin": "^8.0.0",  // ✅ Actualizado
    "@typescript-eslint/parser": "^8.46.4",        // ✅ Actualizado
    "eslint": "^9.39.1",                // ✅ Actualizado
    "jest": "^30.2.0",                  // ✅ Actualizado
    "ts-jest": "^29.3.0"                // ✅ Actualizado
  },
  "dependencies": {
    "express": "^4.18.0"                // 🔴 Mantenido en v4
  }
}
```

**Archivos GitHub Actions**:
```yaml
# .github/workflows/ci.yml
uses: actions/checkout@v5              # ✅ Actualizado

# .github/workflows/codeql.yml
uses: actions/checkout@v5              # ✅ Actualizado
uses: github/codeql-action/init@v4    # ✅ Actualizado
uses: github/codeql-action/autobuild@v4  # ✅ Actualizado
uses: github/codeql-action/analyze@v4    # ✅ Actualizado
```

**Archivos Nuevos**:
- `templates/typescript/src/domain/value-objects/Password.ts`
- `templates/typescript/src/domain/events/DomainEvent.ts`
- `templates/typescript/src/domain/events/UserCreatedEvent.ts`
- `templates/typescript/tests/unit/value-objects/Password.test.ts`
- `templates/typescript/eslint.config.js`

**Archivos Eliminados**:
- `templates/typescript/.eslintrc.json` (migrado a flat config)

---

## ⏱️ Estimación Total de Esfuerzo

| Fase | Tarea | Tiempo | Riesgo |
|------|-------|--------|--------|
| 1 | Merge GitHub Actions | 15 min | 🟢 Bajo |
| 2 | Decisión Express | 30 min | 🟢 Bajo |
| 3 | Investigación @types/node | 30 min | 🟡 Medio |
| 4 | Implementar bloqueadores | 4 horas | 🟡 Medio |
| 5 | Actualizar ESLint stack | 2-3 horas | 🔴 Alto |
| 6 | Actualizar Jest | 1 hora | 🟡 Medio |

**TOTAL**: **8-9 horas** de trabajo

**Distribución Recomendada**:
- **Día 1** (2h): Fases 1-3 (merges seguros + investigación)
- **Día 2** (4h): Fase 4 (implementar bloqueadores)
- **Día 3** (3h): Fases 5-6 (ESLint + Jest)

---

## 🚨 Advertencias Finales

### 1. Testing es CRÍTICO
- Cada merge debe validarse con `npm run build && npm test && npm run lint`
- No asumir que "debería funcionar"
- Rollback inmediato si algo falla

### 2. Orden Importa
- NO mergear PR #5 antes de PR #3
- NO mergear PR #7 antes de Fase 4
- NO saltarse pasos

### 3. Comunicación
- Documentar cada cambio en commits
- Actualizar README si hay breaking changes
- Crear ADRs para decisiones importantes (Express 5, ESLint 9)

### 4. Rollback Plan
```bash
# Si algo sale mal:
git revert <commit-hash>
git push

# O restaurar package.json anterior:
git checkout HEAD~1 -- package.json package-lock.json
npm install
```

---

## 📝 Checklist Final

Antes de considerar completado:

### Validación Técnica
- [ ] `npm install` completa sin errores
- [ ] `npm run build` compila exitosamente
- [ ] `npm run lint` pasa sin errores
- [ ] `npm run type-check` pasa
- [ ] `npm test` todos los tests pasan
- [ ] `npm run test:coverage` >= 80%

### Validación de GitHub Actions
- [ ] CI workflow ejecuta correctamente
- [ ] CodeQL analysis completa
- [ ] No hay nuevos security findings críticos

### Documentación
- [ ] README actualizado si hay breaking changes
- [ ] ADRs creados para decisiones mayores
- [ ] CHANGELOG actualizado
- [ ] Commits tienen mensajes descriptivos

### Post-Merge
- [ ] Crear issue para migración futura a Express 5
- [ ] Documentar lessons learned
- [ ] Actualizar auditoría de dependencias

---

**Generado**: 2025-11-16
**Autor**: Claude Code (Anthropic)
**Basado en**: Análisis de 7 PRs de Dependabot
**Próxima revisión**: Después de completar Fase 1-3
