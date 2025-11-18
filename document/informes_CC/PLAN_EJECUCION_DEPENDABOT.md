# Plan de Ejecución Detallado - Actualización Dependabot PRs

**Fecha de Creación**: 2025-11-16
**Proyecto**: Kit Fundador v2.0
**Objetivo**: Actualizar 7 PRs de Dependabot con validación exhaustiva
**Tiempo Total Estimado**: 8-9 horas
**Documento Base**: ANALISIS_DEPENDABOT_PRS.md

---

## 📋 Índice

1. [Pre-requisitos y Setup](#pre-requisitos-y-setup)
2. [FASE 1: Merges Seguros](#fase-1-merges-seguros)
3. [FASE 2: Decisión Express](#fase-2-decisión-express)
4. [FASE 3: Investigación @types/node](#fase-3-investigación-typesnode)
5. [FASE 4: Fix Bloqueadores](#fase-4-fix-bloqueadores)
6. [FASE 5: Actualización ESLint Stack](#fase-5-actualización-eslint-stack)
7. [FASE 6: Actualización Jest](#fase-6-actualización-jest)
8. [Post-Ejecución](#post-ejecución)
9. [Rollback Procedures](#rollback-procedures)

---

## Pre-requisitos y Setup

### ✅ GATE 0: Validación Inicial

**Objetivo**: Asegurar que el entorno está listo para ejecutar todas las fases

#### Checklist Pre-Flight

- [ ] **ENV-01**: Git working directory está limpio
  ```bash
  git status
  # Expected: "nothing to commit, working tree clean"
  ```

- [ ] **ENV-02**: Estás en la rama correcta
  ```bash
  git branch --show-current
  # Expected: claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
  ```

- [ ] **ENV-03**: Node.js versión correcta
  ```bash
  node --version
  # Expected: v20.x.x o superior
  ```

- [ ] **ENV-04**: npm funcional
  ```bash
  npm --version
  # Expected: 9.x.x o superior
  ```

- [ ] **ENV-05**: GitHub CLI instalado (opcional pero recomendado)
  ```bash
  gh --version
  # Expected: gh version 2.x.x o "command not found" (continuarás sin gh)
  ```

- [ ] **ENV-06**: Baseline funcional
  ```bash
  cd templates/typescript
  npm install
  npm run build 2>&1 | tee build.log
  # Expected: Puede fallar (esperado por imports rotos), pero npm install debe pasar
  ```

- [ ] **ENV-07**: Backups creados
  ```bash
  # Crear branch de backup
  git branch backup/pre-dependabot-updates-$(date +%Y%m%d)

  # Backup de archivos críticos
  cp templates/typescript/package.json templates/typescript/package.json.backup
  cp templates/typescript/package-lock.json templates/typescript/package-lock.json.backup
  ```

- [ ] **ENV-08**: Documento de tracking creado
  ```bash
  # Crear log de ejecución
  echo "# Execution Log - Dependabot Updates" > EXECUTION_LOG.md
  echo "Started: $(date)" >> EXECUTION_LOG.md
  ```

#### 🚨 Si algún check falla

- ENV-01 falla → Hacer commit o stash de cambios
- ENV-02 falla → Checkout a la rama correcta
- ENV-03/04 fallan → Instalar Node.js 20+ y npm
- ENV-06 falla con npm install → STOP, investigar antes de continuar
- ENV-07 falla → Crear backups manualmente

#### ✅ GATE 0 PASS Criteria

```bash
# Comando de validación rápida
[[ $(git status --porcelain | wc -l) -eq 0 ]] && \
[[ $(node --version | grep -o "v[0-9]*" | grep -o "[0-9]*") -ge 20 ]] && \
echo "✅ GATE 0 PASSED" || echo "❌ GATE 0 FAILED"
```

**Output esperado**: `✅ GATE 0 PASSED`

**Tiempo estimado**: 10 minutos
**Rollback**: N/A (no hay cambios aún)

---

## FASE 1: Merges Seguros

**Duración**: 15 minutos
**Riesgo**: 🟢 BAJO
**Objetivo**: Mergear actualizaciones de GitHub Actions sin riesgo

### Mini-Tarea 1.1: Merge actions/checkout v5

#### Subtareas

**1.1.1** Verificar rama de Dependabot existe
```bash
git fetch origin dependabot/github_actions/actions/checkout-5
# Expected: rama descargada correctamente
```

**1.1.2** Revisar diff específico
```bash
git diff origin/claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS...origin/dependabot/github_actions/actions/checkout-5 -- .github/workflows/
```

**Expected Output**:
```diff
-.github/workflows/ci.yml:        uses: actions/checkout@v4
+.github/workflows/ci.yml:        uses: actions/checkout@v5
-.github/workflows/codeql.yml:        uses: actions/checkout@v4
+.github/workflows/codeql.yml:        uses: actions/checkout@v5
```

**1.1.3** Validar que solo cambian versiones (no lógica)
```bash
git diff origin/claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS...origin/dependabot/github_actions/actions/checkout-5 -- .github/workflows/ | grep -v "checkout@" | grep "^[+-]" | grep -v "^---" | grep -v "^+++" | wc -l
# Expected: 0 (solo cambian las versiones)
```

**1.1.4** Merge la rama
```bash
git merge origin/dependabot/github_actions/actions/checkout-5 --no-ff -m "build: Update actions/checkout from v4 to v5

Merged Dependabot PR for GitHub Actions update.
- actions/checkout@v4 → actions/checkout@v5
- No breaking changes for standard use case
- CI workflows should continue working

Validated: Only version changes, no logic changes
Risk: LOW
"
```

**1.1.5** Verificar merge exitoso
```bash
git log -1 --oneline
# Expected: commit message contiene "actions/checkout"
```

**1.1.6** Validar archivos modificados
```bash
git diff HEAD~1 HEAD -- .github/workflows/ci.yml | grep "checkout@v5"
git diff HEAD~1 HEAD -- .github/workflows/codeql.yml | grep "checkout@v5"
# Expected: Ambos comandos retornan líneas con @v5
```

#### ✅ GATE 1.1: Validación Post-Merge

**Criterios de Aceptación**:

- [ ] **TEST-1.1.1**: Commit existe en git log
  ```bash
  git log -1 --grep="actions/checkout"
  # Expected: Muestra el commit
  ```

- [ ] **TEST-1.1.2**: Archivos modificados correctos
  ```bash
  git diff HEAD~1 HEAD --name-only | sort
  # Expected:
  # .github/workflows/ci.yml
  # .github/workflows/codeql.yml
  ```

- [ ] **TEST-1.1.3**: No hay conflictos
  ```bash
  git status | grep "Unmerged"
  # Expected: Sin output (no hay conflictos)
  ```

**GATE PASS Command**:
```bash
[[ $(git log -1 --grep="actions/checkout" | wc -l) -gt 0 ]] && \
[[ $(git status | grep "Unmerged" | wc -l) -eq 0 ]] && \
echo "✅ GATE 1.1 PASSED" || echo "❌ GATE 1.1 FAILED"
```

**Rollback si falla**:
```bash
git reset --hard HEAD~1
```

---

### Mini-Tarea 1.2: Merge github/codeql-action v4

#### Subtareas

**1.2.1** Fetch rama
```bash
git fetch origin dependabot/github_actions/github/codeql-action-4
```

**1.2.2** Revisar diff
```bash
git diff origin/claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS...origin/dependabot/github_actions/github/codeql-action-4 -- .github/workflows/codeql.yml
```

**Expected**: Solo cambios de v3 → v4 en codeql-action/{init,autobuild,analyze}

**1.2.3** Merge
```bash
git merge origin/dependabot/github_actions/github/codeql-action-4 --no-ff -m "build: Update github/codeql-action from v3 to v4

Merged Dependabot PR for CodeQL action update.
- codeql-action/init@v3 → @v4
- codeql-action/autobuild@v3 → @v4
- codeql-action/analyze@v3 → @v4

Improvements: Better performance and accuracy
Risk: LOW
"
```

**1.2.4** Validar merge
```bash
git diff HEAD~1 HEAD -- .github/workflows/codeql.yml | grep "@v4" | wc -l
# Expected: 3 (tres instancias de @v4)
```

#### ✅ GATE 1.2: Validación Post-Merge

- [ ] **TEST-1.2.1**: Commit existe
  ```bash
  git log -1 --grep="codeql-action"
  ```

- [ ] **TEST-1.2.2**: Tres cambios a v4
  ```bash
  git diff HEAD~1 HEAD -- .github/workflows/codeql.yml | grep -c "@v4"
  # Expected: 3
  ```

- [ ] **TEST-1.2.3**: No conflictos
  ```bash
  git status --porcelain | wc -l
  # Expected: 0
  ```

**GATE PASS Command**:
```bash
[[ $(git diff HEAD~1 HEAD -- .github/workflows/codeql.yml | grep -c "@v4") -eq 3 ]] && \
echo "✅ GATE 1.2 PASSED" || echo "❌ GATE 1.2 FAILED"
```

---

### Mini-Tarea 1.3: Push cambios de Fase 1

**1.3.1** Revisar commits locales
```bash
git log origin/claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS..HEAD --oneline
# Expected: 2 commits (checkout, codeql)
```

**1.3.2** Push
```bash
git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

**1.3.3** Verificar push exitoso
```bash
git log origin/claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS..HEAD --oneline
# Expected: Sin output (todo pusheado)
```

**1.3.4** Documentar en log
```bash
echo "## FASE 1 Completed - $(date)" >> EXECUTION_LOG.md
echo "- ✅ actions/checkout@v5 merged" >> EXECUTION_LOG.md
echo "- ✅ codeql-action@v4 merged" >> EXECUTION_LOG.md
echo "- ✅ Changes pushed to remote" >> EXECUTION_LOG.md
```

#### ✅ GATE 1.3: Fase 1 Completa

**Criterios**:
- [ ] 2 commits pusheados
- [ ] GitHub Actions workflows actualizados
- [ ] No conflictos ni errores

**Tiempo real**: ______ minutos
**Issues encontrados**: __________

---

## FASE 2: Decisión Express

**Duración**: 30 minutos
**Riesgo**: 🟢 BAJO (decisión estratégica)
**Objetivo**: Decidir si mergear Express 5 o mantener Express 4

### Mini-Tarea 2.1: Análisis de Impacto

**2.1.1** Verificar uso actual de Express
```bash
cd templates/typescript
find src -name "*.ts" -type f -exec grep -l "express" {} \;
# Expected: Vacío o muy poco uso
```

**2.1.2** Revisar package.json actual
```bash
grep -A2 -B2 "express" templates/typescript/package.json
```

**2.1.3** Investigar breaking changes en documentación
```bash
# Manual research:
# 1. Visitar https://expressjs.com/en/guide/migrating-5.html
# 2. Listar breaking changes críticos
# 3. Evaluar impacto en template vacío
```

**2.1.4** Documentar decisión
```bash
cat > DECISION_EXPRESS_5.md << 'EOF'
# Decisión: Express 4 vs Express 5

## Contexto
- Template actualmente no tiene código Express implementado
- Express 5 tiene breaking changes significativos en error handling
- Comunidad aún migrando, documentación asume Express 4

## Análisis

### Pros de migrar a Express 5
- [ ] Async error handling automático
- [ ] Performance improvements
- [ ] Future-proofing

### Contras de migrar a Express 5
- [ ] Breaking changes pueden confundir usuarios
- [ ] Middleware ecosystem aún migrando
- [ ] No hay código existente que beneficie
- [ ] Documentación online asume Express 4

## Decisión Final

**MANTENER EXPRESS 4**

### Razones
1. No hay código Express implementado aún
2. Usuarios esperan Express 4 (estándar de facto)
3. Express 5 aún madurando
4. No aporta valor inmediato al template

### Plan Futuro
- Crear issue para migración a Express 5 cuando sea LTS
- Documentar en README que Express 5 está disponible
- Re-evaluar en Q2 2026

## Acciones
- Cerrar PR de Dependabot para Express 5
- Pin Express a ~4.18.x en package.json
- Crear issue de seguimiento

---
Fecha: $(date)
Decisor: [Tu nombre/Claude]
EOF
```

### Mini-Tarea 2.2: Cerrar PR de Express 5

**2.2.1** Documentar en log
```bash
echo "## FASE 2 - Express Decision - $(date)" >> EXECUTION_LOG.md
echo "Decision: MANTENER EXPRESS 4" >> EXECUTION_LOG.md
echo "Reason: No código implementado, breaking changes innecesarios" >> EXECUTION_LOG.md
```

**2.2.2** Agregar nota en package.json (opcional)
```bash
cd templates/typescript
# Agregar comentario explicativo en package.json si el formato lo permite
```

**2.2.3** Crear issue de seguimiento (opcional)
```bash
cat > /tmp/express5-issue.md << 'EOF'
# Future: Migrate to Express 5

## Context
Dependabot PR for Express 5.1.0 was intentionally not merged during dependency updates (Nov 2025).

## Reasons for deferring
- Template has no Express code implemented yet
- Express 5 breaking changes in async error handling
- Ecosystem still migrating
- No immediate value

## When to revisit
- Q2 2026 or when Express 5 becomes LTS
- When template implements Express-based examples
- When middleware ecosystem fully migrated

## Resources
- Express 5 migration guide: https://expressjs.com/en/guide/migrating-5.html
- Dependabot PR: [link]
- Decision doc: DECISION_EXPRESS_5.md
EOF

# Si tienes gh CLI:
# gh issue create --title "Future: Migrate to Express 5" --body-file /tmp/express5-issue.md

# Si no, crear manualmente en GitHub UI
```

#### ✅ GATE 2: Decisión Documentada

**Criterios**:
- [ ] **DOC-2.1**: Decisión documentada en DECISION_EXPRESS_5.md
- [ ] **DOC-2.2**: Razones claras y justificadas
- [ ] **DOC-2.3**: Plan futuro definido
- [ ] **LOG-2.1**: Decisión registrada en EXECUTION_LOG.md

**GATE PASS**: Manual review

**Tiempo real**: ______ minutos

---

## FASE 3: Investigación @types/node

**Duración**: 30 minutos
**Riesgo**: 🟡 MEDIO
**Objetivo**: Validar si @types/node@24 es correcto y seguro

### Mini-Tarea 3.1: Investigación de Versión

**3.1.1** Verificar existencia en npm
```bash
npm view @types/node@24.10.1 version
# Expected: "24.10.1" o error si no existe
```

**3.1.2** Revisar versiones disponibles
```bash
npm view @types/node versions --json | jq '.[-20:]'
# Ver últimas 20 versiones
```

**3.1.3** Verificar Node.js releases
```bash
# Manual check:
# https://nodejs.org/en/about/releases/
# Verificar si Node.js 24 existe
```

**3.1.4** Documentar hallazgos
```bash
cat > INVESTIGATION_TYPES_NODE.md << 'EOF'
# Investigación: @types/node@24.10.1

## Fecha
$(date)

## Comando de verificación
npm view @types/node@24.10.1

## Resultado
[COPIAR OUTPUT AQUÍ]

## Node.js Releases Actuales
- v22.x (Current)
- v20.x (LTS)
- v18.x (Maintenance)

## Análisis
- [ ] @types/node@24.10.1 existe en npm: SÍ/NO
- [ ] Node.js 24 existe: SÍ/NO
- [ ] Versión corresponde a Node.js release: SÍ/NO

## Decisión
[A completar después del testing]
EOF
```

### Mini-Tarea 3.2: Testing Local

**3.2.1** Crear ambiente de prueba
```bash
cd templates/typescript
cp package.json package.json.test-backup
cp package-lock.json package-lock.json.test-backup
```

**3.2.2** Instalar versión de prueba
```bash
npm install --save-dev @types/node@24.10.1 2>&1 | tee /tmp/types-node-install.log
# Capturar output completo
```

**3.2.3** Intentar build
```bash
npm run build 2>&1 | tee /tmp/types-node-build.log
# Puede fallar por otros motivos (imports rotos), pero revisar errores específicos de @types/node
```

**3.2.4** Revisar errores de tipo
```bash
npm run type-check 2>&1 | tee /tmp/types-node-typecheck.log
# Buscar errores relacionados con Node.js types
```

**3.2.5** Analizar logs
```bash
# Si build/typecheck fallan, determinar si es por @types/node o por imports ya rotos
grep -i "node_modules/@types/node" /tmp/types-node-build.log
grep -i "node_modules/@types/node" /tmp/types-node-typecheck.log
```

### Mini-Tarea 3.3: Decisión

**3.3.1** Restaurar archivos
```bash
cd templates/typescript
mv package.json.test-backup package.json
mv package-lock.json.test-backup package-lock.json
npm install
```

**3.3.2** Completar documentación de investigación
```bash
# Editar INVESTIGATION_TYPES_NODE.md con resultados
cat >> INVESTIGATION_TYPES_NODE.md << 'EOF'

## Testing Results

### Instalación
[EXITOSA/FALLIDA]

### Build
[LOGS RELEVANTES]

### Type Check
[LOGS RELEVANTES]

## Decisión Final

**OPCIÓN ELEGIDA**: [MERGEAR @types/node@24 / MANTENER @types/node@20 / ACTUALIZAR A @types/node@22]

### Justificación
[RAZONES]

### Acción
[COMANDOS A EJECUTAR]

---
EOF
```

#### ✅ GATE 3: Decisión @types/node

**Opciones de decisión**:

**OPCIÓN A**: Mergear @types/node@24 (si existe y tests pasan)
```bash
git fetch origin dependabot/npm_and_yarn/types/node-24.10.1
git merge origin/dependabot/npm_and_yarn/types/node-24.10.1 --no-ff -m "build: Update @types/node to 24.10.1

Validated with local testing.
No breaking changes detected.
"
```

**OPCIÓN B**: Cerrar PR y pin a @types/node@20
```bash
cd templates/typescript
# Editar package.json manualmente
# "devDependencies": {
#   "@types/node": "~20.0.0"
# }
git add package.json
git commit -m "build: Pin @types/node to 20.x

@types/node@24 is premature (Node.js 24 doesn't exist yet).
Staying on Node.js 20 LTS types.
"
```

**OPCIÓN C**: Actualizar a @types/node@22 (Node.js 22 Current)
```bash
cd templates/typescript
npm install --save-dev @types/node@^22.0.0
git add package.json package-lock.json
git commit -m "build: Update @types/node to 22.x

Node.js 22 is Current release.
More appropriate than @types/node@24 (doesn't exist).
"
```

**Criterios de validación**:
- [ ] **DECISION-3.1**: Decisión tomada y documentada
- [ ] **DECISION-3.2**: Tests ejecutados si procede
- [ ] **DECISION-3.3**: Commit creado
- [ ] **LOG-3.1**: Registrado en EXECUTION_LOG.md

**Tiempo real**: ______ minutos

---

## FASE 4: Fix Bloqueadores

**Duración**: 4 horas
**Riesgo**: 🟡 MEDIO
**Objetivo**: Implementar Password.ts y Domain Events para desbloquear Jest/ESLint updates

### Mini-Tarea 4.1: Implementar Password Value Object

**Duración**: 1.5 horas

#### 4.1.1: Setup y dependencias

```bash
cd templates/typescript

# Instalar bcrypt
npm install --save bcrypt
npm install --save-dev @types/bcrypt

# Verificar instalación
npm list bcrypt @types/bcrypt
```

**Expected**: Ambos paquetes instalados

#### 4.1.2: Crear estructura de directorios

```bash
# Verificar que directorio existe
ls -la src/domain/value-objects/
# Expected: Email.ts existe

# Si no existe directorio de tests para VOs
mkdir -p tests/unit/value-objects
```

#### 4.1.3: Implementar Password.ts

```bash
cat > src/domain/value-objects/Password.ts << 'EOF'
import * as bcrypt from 'bcrypt';

/**
 * Password Value Object
 *
 * Representa una contraseña hasheada de forma segura.
 * Sigue principios de DDD: Inmutable, validación en construcción, sin setters.
 *
 * @see AUDITORIA_TDD_DDD.md - Requerimiento identificado
 */
export class Password {
  private static readonly MIN_LENGTH = 8;
  private static readonly MAX_LENGTH = 128;
  private static readonly SALT_ROUNDS = 10;

  // Regex: Al menos 1 mayúscula, 1 minúscula, 1 número, 1 caracter especial
  private static readonly PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]/;

  private readonly _hash: string;

  /**
   * Constructor privado - usar factory methods
   */
  private constructor(hash: string) {
    this._hash = hash;
  }

  /**
   * Crear Password desde texto plano (hashea automáticamente)
   *
   * @param plaintext - Contraseña en texto plano
   * @returns Password hasheada
   * @throws Error si validación falla
   */
  static create(plaintext: string): Password {
    Password.validate(plaintext);
    const hash = bcrypt.hashSync(plaintext, Password.SALT_ROUNDS);
    return new Password(hash);
  }

  /**
   * Crear Password desde hash existente (para recuperar de DB)
   *
   * @param hash - Hash bcrypt
   * @returns Password
   */
  static fromHash(hash: string): Password {
    if (!hash || hash.trim().length === 0) {
      throw new Error('Password hash cannot be empty');
    }
    return new Password(hash);
  }

  /**
   * Validar contraseña en texto plano
   *
   * @param plaintext - Contraseña a validar
   * @throws Error si no cumple requisitos
   */
  private static validate(plaintext: string): void {
    if (!plaintext) {
      throw new Error('Password cannot be null or undefined');
    }

    if (plaintext.length < Password.MIN_LENGTH) {
      throw new Error(`Password must be at least ${Password.MIN_LENGTH} characters long`);
    }

    if (plaintext.length > Password.MAX_LENGTH) {
      throw new Error(`Password must be at most ${Password.MAX_LENGTH} characters long`);
    }

    if (!Password.PASSWORD_REGEX.test(plaintext)) {
      throw new Error(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&#)'
      );
    }
  }

  /**
   * Verificar si texto plano coincide con hash
   *
   * @param plaintext - Contraseña en texto plano
   * @returns true si coincide
   */
  verify(plaintext: string): boolean {
    return bcrypt.compareSync(plaintext, this._hash);
  }

  /**
   * Obtener hash (para persistencia)
   */
  get hash(): string {
    return this._hash;
  }

  /**
   * Comparación de igualdad (compara hashes)
   */
  equals(other: Password): boolean {
    if (!(other instanceof Password)) {
      return false;
    }
    return this._hash === other._hash;
  }

  /**
   * Prevenir toString() de exponer el hash
   */
  toString(): string {
    return '[Password:REDACTED]';
  }
}
EOF
```

#### 4.1.4: Crear tests para Password

```bash
cat > tests/unit/value-objects/Password.test.ts << 'EOF'
import { Password } from '@domain/value-objects/Password';

describe('Password Value Object', () => {
  describe('create()', () => {
    it('should create a valid password', () => {
      const plaintext = 'SecurePass123!';
      const password = Password.create(plaintext);

      expect(password).toBeDefined();
      expect(password.hash).toBeDefined();
      expect(password.hash).not.toBe(plaintext); // Debe estar hasheada
    });

    it('should hash the password with bcrypt', () => {
      const plaintext = 'SecurePass123!';
      const password = Password.create(plaintext);

      // Bcrypt hashes start with $2b$ or $2a$
      expect(password.hash).toMatch(/^\$2[ab]\$/);
    });

    it('should throw error if password is too short', () => {
      expect(() => Password.create('Short1!')).toThrow('must be at least 8 characters');
    });

    it('should throw error if password is too long', () => {
      const longPassword = 'A1!' + 'a'.repeat(130);
      expect(() => Password.create(longPassword)).toThrow('must be at most 128 characters');
    });

    it('should throw error if password lacks uppercase', () => {
      expect(() => Password.create('securepass123!')).toThrow('must contain at least one uppercase');
    });

    it('should throw error if password lacks lowercase', () => {
      expect(() => Password.create('SECUREPASS123!')).toThrow('must contain at least one lowercase');
    });

    it('should throw error if password lacks number', () => {
      expect(() => Password.create('SecurePass!')).toThrow('must contain at least one number');
    });

    it('should throw error if password lacks special character', () => {
      expect(() => Password.create('SecurePass123')).toThrow('must contain at least one special character');
    });

    it('should throw error if password is null', () => {
      expect(() => Password.create(null as any)).toThrow('cannot be null or undefined');
    });

    it('should throw error if password is undefined', () => {
      expect(() => Password.create(undefined as any)).toThrow('cannot be null or undefined');
    });
  });

  describe('fromHash()', () => {
    it('should create password from existing hash', () => {
      const originalPassword = Password.create('SecurePass123!');
      const reconstructed = Password.fromHash(originalPassword.hash);

      expect(reconstructed.hash).toBe(originalPassword.hash);
    });

    it('should throw error if hash is empty', () => {
      expect(() => Password.fromHash('')).toThrow('hash cannot be empty');
    });

    it('should throw error if hash is null', () => {
      expect(() => Password.fromHash(null as any)).toThrow('hash cannot be empty');
    });
  });

  describe('verify()', () => {
    it('should verify correct password', () => {
      const plaintext = 'SecurePass123!';
      const password = Password.create(plaintext);

      expect(password.verify(plaintext)).toBe(true);
    });

    it('should reject incorrect password', () => {
      const password = Password.create('SecurePass123!');

      expect(password.verify('WrongPass123!')).toBe(false);
    });

    it('should reject password with different case', () => {
      const password = Password.create('SecurePass123!');

      expect(password.verify('securepass123!')).toBe(false);
    });
  });

  describe('equals()', () => {
    it('should return true for same hash', () => {
      const hash = Password.create('SecurePass123!').hash;
      const pwd1 = Password.fromHash(hash);
      const pwd2 = Password.fromHash(hash);

      expect(pwd1.equals(pwd2)).toBe(true);
    });

    it('should return false for different passwords', () => {
      const pwd1 = Password.create('SecurePass123!');
      const pwd2 = Password.create('DifferentPass123!');

      expect(pwd1.equals(pwd2)).toBe(false);
    });

    it('should return false for non-Password objects', () => {
      const password = Password.create('SecurePass123!');

      expect(password.equals({} as any)).toBe(false);
    });
  });

  describe('toString()', () => {
    it('should not expose the hash', () => {
      const password = Password.create('SecurePass123!');
      const str = password.toString();

      expect(str).not.toContain(password.hash);
      expect(str).toContain('REDACTED');
    });
  });

  describe('Immutability', () => {
    it('should not allow hash modification', () => {
      const password = Password.create('SecurePass123!');
      const originalHash = password.hash;

      // Intentar modificar (TypeScript debería prevenir esto, pero validamos runtime)
      // @ts-expect-error - Testing immutability
      password._hash = 'modified';

      // En TypeScript con readonly, esto no debería afectar
      // pero el getter siempre debe retornar el original
      expect(password.hash).toBe(originalHash);
    });
  });
});
EOF
```

#### 4.1.5: Ejecutar tests de Password

```bash
# Solo tests de Password
npm test -- Password.test.ts 2>&1 | tee /tmp/password-tests.log

# Verificar que pasan
grep "PASS" /tmp/password-tests.log
grep "Tests:.*passed" /tmp/password-tests.log
```

**Expected**:
```
PASS tests/unit/value-objects/Password.test.ts
Tests: 21 passed, 21 total
```

#### ✅ GATE 4.1: Password VO Implementado

**Criterios**:
- [ ] **CODE-4.1.1**: Password.ts existe y compila
  ```bash
  test -f src/domain/value-objects/Password.ts && echo "✅ File exists"
  npm run build 2>&1 | grep -i "password" | grep -i "error" && echo "❌ Build errors" || echo "✅ Builds OK"
  ```

- [ ] **CODE-4.1.2**: Tests existen
  ```bash
  test -f tests/unit/value-objects/Password.test.ts && echo "✅ Tests exist"
  ```

- [ ] **TEST-4.1.1**: Todos los tests pasan
  ```bash
  npm test -- Password.test.ts --passWithNoTests=false 2>&1 | grep "Tests:.*21 passed"
  # Expected: "Tests: 21 passed, 21 total"
  ```

- [ ] **TEST-4.1.2**: Coverage >= 90%
  ```bash
  npm test -- Password.test.ts --coverage --collectCoverageFrom="src/domain/value-objects/Password.ts" 2>&1 | grep "Password.ts" | grep -E "100|9[0-9]"
  # Expected: Coverage 90%+
  ```

**Rollback si falla**:
```bash
git checkout -- src/domain/value-objects/Password.ts tests/unit/value-objects/Password.test.ts
npm uninstall bcrypt @types/bcrypt
```

---

### Mini-Tarea 4.2: Implementar Domain Events

**Duración**: 1.5 horas

#### 4.2.1: Crear estructura

```bash
cd templates/typescript
mkdir -p src/domain/events
```

#### 4.2.2: Implementar DomainEvent.ts

```bash
cat > src/domain/events/DomainEvent.ts << 'EOF'
import { randomUUID } from 'crypto';

/**
 * Base class for all Domain Events
 *
 * Domain Events representan hechos que ya ocurrieron en el dominio.
 * Son inmutables y contienen toda la información necesaria para
 * ser procesados por event handlers.
 *
 * @see AUDITORIA_TDD_DDD.md - Patrón Domain Events
 */
export abstract class DomainEvent {
  /**
   * Identificador único del evento
   */
  public readonly eventId: string;

  /**
   * Timestamp de cuándo ocurrió el evento
   */
  public readonly occurredAt: Date;

  /**
   * Versión del evento (para event versioning)
   */
  public readonly eventVersion: number;

  constructor() {
    this.eventId = randomUUID();
    this.occurredAt = new Date();
    this.eventVersion = 1; // Default version
  }

  /**
   * Tipo del evento (ej: "UserCreated", "OrderPlaced")
   * Debe ser implementado por cada evento concreto
   */
  abstract get eventType(): string;

  /**
   * Payload del evento (datos específicos del evento)
   * Útil para serialización
   */
  abstract toPayload(): Record<string, any>;

  /**
   * Serializar evento completo (para event store, message bus, etc.)
   */
  toJSON(): Record<string, any> {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      eventVersion: this.eventVersion,
      occurredAt: this.occurredAt.toISOString(),
      payload: this.toPayload(),
    };
  }
}
EOF
```

#### 4.2.3: Implementar UserCreatedEvent.ts

```bash
cat > src/domain/events/UserCreatedEvent.ts << 'EOF'
import { DomainEvent } from './DomainEvent';

/**
 * Event disparado cuando se crea un nuevo User
 *
 * Este evento puede ser consumido por:
 * - Email service (enviar email de bienvenida)
 * - Analytics service (tracking de nuevos usuarios)
 * - Audit log (registrar creación)
 */
export class UserCreatedEvent extends DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly createdAt: Date = new Date()
  ) {
    super();
  }

  get eventType(): string {
    return 'UserCreated';
  }

  toPayload(): Record<string, any> {
    return {
      userId: this.userId,
      email: this.email,
      createdAt: this.createdAt.toISOString(),
    };
  }

  /**
   * Helper para debug/logging
   */
  toString(): string {
    return `UserCreatedEvent(userId=${this.userId}, email=${this.email})`;
  }
}
EOF
```

#### 4.2.4: Actualizar User.ts para usar Domain Events

```bash
# Primero leer el archivo actual
cat src/domain/entities/User.ts
```

Luego actualizar imports:

```bash
# Backup primero
cp src/domain/entities/User.ts src/domain/entities/User.ts.backup

# Editar imports (esto lo haremos con Edit tool en el siguiente paso)
```

**Expected change**:
```typescript
// ANTES:
import { DomainEvent } from './DomainEvent';  // ❌ Path incorrecto
import { UserCreatedEvent } from '../domain-events/UserCreatedEvent';  // ❌ Path incorrecto

// DESPUÉS:
import { DomainEvent } from '../events/DomainEvent';  // ✅ Correcto
import { UserCreatedEvent } from '../events/UserCreatedEvent';  // ✅ Correcto
```

#### 4.2.5: Crear tests para Domain Events

```bash
cat > tests/unit/events/DomainEvent.test.ts << 'EOF'
import { DomainEvent } from '@domain/events/DomainEvent';

// Evento concreto para testing
class TestEvent extends DomainEvent {
  constructor(public readonly testData: string) {
    super();
  }

  get eventType(): string {
    return 'TestEvent';
  }

  toPayload(): Record<string, any> {
    return { testData: this.testData };
  }
}

describe('DomainEvent Base Class', () => {
  it('should generate unique eventId', () => {
    const event1 = new TestEvent('data1');
    const event2 = new TestEvent('data2');

    expect(event1.eventId).toBeDefined();
    expect(event2.eventId).toBeDefined();
    expect(event1.eventId).not.toBe(event2.eventId);
  });

  it('should set occurredAt timestamp', () => {
    const before = new Date();
    const event = new TestEvent('data');
    const after = new Date();

    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });

  it('should have default eventVersion of 1', () => {
    const event = new TestEvent('data');
    expect(event.eventVersion).toBe(1);
  });

  it('should serialize to JSON correctly', () => {
    const event = new TestEvent('test-data');
    const json = event.toJSON();

    expect(json).toHaveProperty('eventId');
    expect(json).toHaveProperty('eventType', 'TestEvent');
    expect(json).toHaveProperty('eventVersion', 1);
    expect(json).toHaveProperty('occurredAt');
    expect(json).toHaveProperty('payload');
    expect(json.payload).toEqual({ testData: 'test-data' });
  });

  it('should have ISO string timestamp in JSON', () => {
    const event = new TestEvent('data');
    const json = event.toJSON();

    expect(typeof json.occurredAt).toBe('string');
    expect(json.occurredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/); // ISO format
  });
});
EOF
```

```bash
cat > tests/unit/events/UserCreatedEvent.test.ts << 'EOF'
import { UserCreatedEvent } from '@domain/events/UserCreatedEvent';

describe('UserCreatedEvent', () => {
  it('should create event with userId and email', () => {
    const userId = 'user-123';
    const email = 'test@example.com';
    const event = new UserCreatedEvent(userId, email);

    expect(event.userId).toBe(userId);
    expect(event.email).toBe(email);
    expect(event.createdAt).toBeInstanceOf(Date);
  });

  it('should have eventType "UserCreated"', () => {
    const event = new UserCreatedEvent('user-123', 'test@example.com');
    expect(event.eventType).toBe('UserCreated');
  });

  it('should include userId and email in payload', () => {
    const userId = 'user-123';
    const email = 'test@example.com';
    const event = new UserCreatedEvent(userId, email);
    const payload = event.toPayload();

    expect(payload.userId).toBe(userId);
    expect(payload.email).toBe(email);
    expect(payload.createdAt).toBeDefined();
  });

  it('should serialize to JSON correctly', () => {
    const event = new UserCreatedEvent('user-123', 'test@example.com');
    const json = event.toJSON();

    expect(json.eventType).toBe('UserCreated');
    expect(json.payload.userId).toBe('user-123');
    expect(json.payload.email).toBe('test@example.com');
  });

  it('should accept custom createdAt date', () => {
    const customDate = new Date('2025-01-01');
    const event = new UserCreatedEvent('user-123', 'test@example.com', customDate);

    expect(event.createdAt).toBe(customDate);
  });

  it('should have readable toString()', () => {
    const event = new UserCreatedEvent('user-123', 'test@example.com');
    const str = event.toString();

    expect(str).toContain('UserCreatedEvent');
    expect(str).toContain('user-123');
    expect(str).toContain('test@example.com');
  });

  it('should inherit eventId from DomainEvent', () => {
    const event = new UserCreatedEvent('user-123', 'test@example.com');
    expect(event.eventId).toBeDefined();
    expect(typeof event.eventId).toBe('string');
  });

  it('should inherit occurredAt from DomainEvent', () => {
    const event = new UserCreatedEvent('user-123', 'test@example.com');
    expect(event.occurredAt).toBeInstanceOf(Date);
  });

  it('should have eventVersion from DomainEvent', () => {
    const event = new UserCreatedEvent('user-123', 'test@example.com');
    expect(event.eventVersion).toBe(1);
  });
});
EOF
```

#### 4.2.6: Ejecutar tests de Domain Events

```bash
mkdir -p tests/unit/events

npm test -- events/ 2>&1 | tee /tmp/events-tests.log
```

**Expected**:
```
PASS tests/unit/events/DomainEvent.test.ts
PASS tests/unit/events/UserCreatedEvent.test.ts
Tests: 15 passed, 15 total
```

#### ✅ GATE 4.2: Domain Events Implementados

**Criterios**:
- [ ] **CODE-4.2.1**: DomainEvent.ts existe
- [ ] **CODE-4.2.2**: UserCreatedEvent.ts existe
- [ ] **CODE-4.2.3**: Archivos compilan
- [ ] **TEST-4.2.1**: Tests de DomainEvent pasan (6 tests)
- [ ] **TEST-4.2.2**: Tests de UserCreatedEvent pasan (9 tests)

---

### Mini-Tarea 4.3: Actualizar User.ts imports

**Duración**: 15 minutos

#### 4.3.1: Leer User.ts actual

```bash
cat src/domain/entities/User.ts | head -20
```

#### 4.3.2: Fix imports (usar Edit tool)

Cambiar:
```typescript
import { DomainEvent } from './DomainEvent';
import { UserCreatedEvent } from '../domain-events/UserCreatedEvent';
```

Por:
```typescript
import { DomainEvent } from '../events/DomainEvent';
import { UserCreatedEvent } from '../events/UserCreatedEvent';
```

#### 4.3.3: Verificar compilación

```bash
npm run build 2>&1 | tee /tmp/user-build.log
```

**Expected**: Build exitoso sin errores de imports

#### ✅ GATE 4.3: User.ts Fixed

- [ ] **CODE-4.3.1**: Imports corregidos
- [ ] **BUILD-4.3.1**: Build pasa sin errores

---

### Mini-Tarea 4.4: Validación Completa de Fase 4

**Duración**: 30 minutos

#### 4.4.1: Ejecutar TODOS los tests

```bash
cd templates/typescript
npm test 2>&1 | tee /tmp/all-tests-phase4.log
```

**Expected**:
```
PASS tests/unit/value-objects/Password.test.ts (21 tests)
PASS tests/unit/value-objects/Email.test.ts (X tests)
PASS tests/unit/events/DomainEvent.test.ts (6 tests)
PASS tests/unit/events/UserCreatedEvent.test.ts (9 tests)
PASS tests/unit/User.test.ts (X tests)

Tests: XX passed, XX total
```

#### 4.4.2: Verificar coverage

```bash
npm run test:coverage 2>&1 | tee /tmp/coverage-phase4.log

# Ver coverage de archivos nuevos
grep "Password.ts" /tmp/coverage-phase4.log
grep "DomainEvent.ts" /tmp/coverage-phase4.log
grep "UserCreatedEvent.ts" /tmp/coverage-phase4.log
```

**Expected**: Coverage >= 80% overall, >= 90% en archivos nuevos

#### 4.4.3: Build completo

```bash
npm run build 2>&1 | tee /tmp/build-phase4.log

# No debe haber errores
grep -i "error" /tmp/build-phase4.log && echo "❌ Build failed" || echo "✅ Build OK"
```

#### 4.4.4: Type check

```bash
npm run type-check 2>&1 | tee /tmp/typecheck-phase4.log

grep -i "error" /tmp/typecheck-phase4.log && echo "❌ Type errors" || echo "✅ Types OK"
```

#### 4.4.5: Lint

```bash
npm run lint 2>&1 | tee /tmp/lint-phase4.log

grep -i "error" /tmp/lint-phase4.log && echo "❌ Lint errors" || echo "✅ Lint OK"
```

#### ✅ GATE 4.4: Fase 4 Completa

**Criterios CRÍTICOS**:

- [ ] **BUILD-4.4.1**: `npm run build` pasa ✅
- [ ] **TEST-4.4.1**: `npm test` pasa ✅
- [ ] **TEST-4.4.2**: Coverage >= 80% ✅
- [ ] **TYPE-4.4.1**: `npm run type-check` pasa ✅
- [ ] **LINT-4.4.1**: `npm run lint` pasa ✅

**GATE PASS Command**:
```bash
cd templates/typescript && \
npm run build > /dev/null 2>&1 && \
npm test > /dev/null 2>&1 && \
npm run type-check > /dev/null 2>&1 && \
npm run lint > /dev/null 2>&1 && \
echo "✅ GATE 4.4 PASSED - ALL CHECKS OK" || echo "❌ GATE 4.4 FAILED"
```

**Si GATE falla**: NO CONTINUAR a Fase 5. Debugging obligatorio.

#### 4.4.6: Commit de Fase 4

```bash
cd /home/user/kit_fundador

git add templates/typescript/

git commit -m "fix: Implement Password VO and Domain Events (unblocks dependency updates)

Implements missing components identified in AUDITORIA_TDD_DDD.md:

New Files:
- src/domain/value-objects/Password.ts: Secure password VO with bcrypt
- src/domain/events/DomainEvent.ts: Base class for domain events
- src/domain/events/UserCreatedEvent.ts: User creation event
- tests/unit/value-objects/Password.test.ts: 21 tests, 100% coverage
- tests/unit/events/DomainEvent.test.ts: 6 tests
- tests/unit/events/UserCreatedEvent.test.ts: 9 tests

Fixed:
- src/domain/entities/User.ts: Corrected imports for domain events

Dependencies:
- bcrypt: Password hashing
- @types/bcrypt: TypeScript types

Validation:
✅ All tests pass (36 total)
✅ Coverage >= 80%
✅ Build succeeds
✅ Type check passes
✅ Lint passes

This unblocks:
- Jest 30 update (PR #7)
- ESLint 9 update (PR #3)

Closes: Blockers from ANALISIS_DEPENDABOT_PRS.md Phase 4
"

git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

#### 4.4.7: Documentar en log

```bash
echo "## FASE 4 Completed - $(date)" >> EXECUTION_LOG.md
echo "- ✅ Password.ts implemented (21 tests)" >> EXECUTION_LOG.md
echo "- ✅ DomainEvent.ts implemented (6 tests)" >> EXECUTION_LOG.md
echo "- ✅ UserCreatedEvent.ts implemented (9 tests)" >> EXECUTION_LOG.md
echo "- ✅ User.ts imports fixed" >> EXECUTION_LOG.md
echo "- ✅ All tests passing" >> EXECUTION_LOG.md
echo "- ✅ Coverage >= 80%" >> EXECUTION_LOG.md
echo "- ✅ Committed and pushed" >> EXECUTION_LOG.md
```

**Tiempo real**: ______ horas
**Issues encontrados**: __________

---

## FASE 5: Actualización ESLint Stack

**Duración**: 2-3 horas
**Riesgo**: 🔴 ALTO
**Objetivo**: Actualizar ESLint 9 + @typescript-eslint v8 + migrar a flat config

⚠️ **ADVERTENCIA**: Esta es la fase más compleja. Requiere atención a detalles.

### Mini-Tarea 5.1: Actualizar @typescript-eslint/eslint-plugin

**Duración**: 30 minutos

#### 5.1.1: Verificar versiones actuales

```bash
cd templates/typescript
npm list @typescript-eslint/eslint-plugin
npm list @typescript-eslint/parser
```

**Expected**: Ambos en v6.x

#### 5.1.2: Actualizar eslint-plugin manualmente

```bash
npm install --save-dev @typescript-eslint/eslint-plugin@^8.0.0
```

#### 5.1.3: Verificar compatibilidad

```bash
npm list @typescript-eslint/eslint-plugin
npm list @typescript-eslint/parser

# Ambos deben estar en v8 para ser compatibles con ESLint 9
```

**Expected**:
```
@typescript-eslint/eslint-plugin@8.x.x
@typescript-eslint/parser@6.x.x (aún, se actualizará después)
```

#### ✅ GATE 5.1: Plugin Actualizado

- [ ] **PKG-5.1.1**: eslint-plugin@8.x instalado
  ```bash
  npm list @typescript-eslint/eslint-plugin | grep "@8\."
  ```

---

### Mini-Tarea 5.2: Mergear PR #3 (ESLint 9)

**Duración**: 15 minutos

#### 5.2.1: Fetch PR

```bash
git fetch origin dependabot/npm_and_yarn/eslint-9.39.1
```

#### 5.2.2: Review diff

```bash
git diff HEAD...origin/dependabot/npm_and_yarn/eslint-9.39.1 -- templates/typescript/package.json
```

**Expected**: Solo cambio de eslint 8.x → 9.39.1

#### 5.2.3: Merge

```bash
git merge origin/dependabot/npm_and_yarn/eslint-9.39.1 --no-ff -m "build: Update ESLint to 9.39.1

Part of ESLint stack upgrade coordinated with @typescript-eslint v8.
Requires flat config migration (next step).

Breaking change: .eslintrc.json format deprecated
Migration: Will create eslint.config.js
"
```

#### 5.2.4: Verificar merge

```bash
git log -1 --oneline
grep '"eslint"' templates/typescript/package.json
```

**Expected**: "eslint": "^9.39.1"

#### ✅ GATE 5.2: ESLint 9 Merged

- [ ] **MERGE-5.2.1**: Commit existe
- [ ] **PKG-5.2.1**: package.json tiene eslint@9

---

### Mini-Tarea 5.3: Mergear PR #5 (@typescript-eslint/parser)

**Duración**: 15 minutos

#### 5.3.1: Fetch y merge

```bash
git fetch origin dependabot/npm_and_yarn/typescript-eslint/parser-8.46.4

git merge origin/dependabot/npm_and_yarn/typescript-eslint/parser-8.46.4 --no-ff -m "build: Update @typescript-eslint/parser to 8.46.4

Completes @typescript-eslint stack upgrade to v8.
Compatible with ESLint 9.
Paired with @typescript-eslint/eslint-plugin@8 (installed manually).
"
```

#### 5.3.2: npm install para sincronizar

```bash
cd templates/typescript
npm install 2>&1 | tee /tmp/npm-install-eslint9.log
```

**Expected**: Sin errores de peer dependencies

#### 5.3.3: Verificar stack completo

```bash
npm list eslint
npm list @typescript-eslint/parser
npm list @typescript-eslint/eslint-plugin
```

**Expected**:
```
eslint@9.39.1
@typescript-eslint/parser@8.46.4
@typescript-eslint/eslint-plugin@8.x.x
```

#### ✅ GATE 5.3: Parser Actualizado

- [ ] **PKG-5.3.1**: Todos los paquetes en versiones correctas
- [ ] **NPM-5.3.1**: npm install sin peer dependency warnings críticos

---

### Mini-Tarea 5.4: Migrar a Flat Config

**Duración**: 1-1.5 horas

⚠️ **CRÍTICO**: ESLint 9 requiere flat config

#### 5.4.1: Leer configuración actual

```bash
cat templates/typescript/.eslintrc.json | tee /tmp/eslintrc-old.json
```

#### 5.4.2: Crear eslint.config.js

```bash
cat > templates/typescript/eslint.config.js << 'EOF'
// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

/**
 * ESLint Flat Config para Kit Fundador v2.0
 *
 * Migrated from .eslintrc.json to flat config (ESLint 9+)
 *
 * @see https://eslint.org/docs/latest/use/configure/configuration-files
 * @see https://typescript-eslint.io/getting-started
 */
export default tseslint.config(
  // Base recommended configs
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Global settings
  {
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.json',
        ecmaVersion: 2022,
        sourceType: 'module',
      },
    },
  },

  // Rules for source code
  {
    files: ['src/**/*.ts'],
    rules: {
      // Complejidad
      'max-lines-per-function': ['error', { max: 20, skipBlankLines: true, skipComments: true }],
      'max-params': ['error', 3],
      'complexity': ['error', 10],
      'max-depth': ['error', 3],
      'max-nested-callbacks': ['error', 3],

      // Code quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-arrow-callback': 'warn',

      // TypeScript specific
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
    },
  },

  // Rules for test files
  {
    files: ['tests/**/*.ts', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      // Relax some rules in tests
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-nested-callbacks': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/**',
      'build/**',
      'node_modules/**',
      'coverage/**',
      '*.js', // Ignore non-TS files at root
      '!eslint.config.js', // Except this config file
    ],
  }
);
EOF
```

#### 5.4.3: Instalar dependencia necesaria

```bash
npm install --save-dev typescript-eslint
```

#### 5.4.4: Eliminar .eslintrc.json

```bash
# Backup primero
cp templates/typescript/.eslintrc.json templates/typescript/.eslintrc.json.backup

# Eliminar
rm templates/typescript/.eslintrc.json
```

#### 5.4.5: Testing de configuración

```bash
cd templates/typescript

# Test 1: Verificar que config carga sin errores
npx eslint --config eslint.config.js src/domain/entities/User.ts 2>&1 | tee /tmp/eslint-config-test.log

# Si hay error de sintaxis en config, arreglar antes de continuar
```

#### 5.4.6: Ejecutar lint en todo el código

```bash
npm run lint 2>&1 | tee /tmp/lint-flat-config.log

# Ver si hay errores nuevos
grep -i "error" /tmp/lint-flat-config.log
```

**Expected**: Posiblemente algunos errores de lint que necesitan fixing

#### 5.4.7: Fix lint errors (si los hay)

```bash
# Intentar auto-fix
npm run lint:fix

# Ver qué queda
npm run lint 2>&1 | tee /tmp/lint-after-fix.log
```

**Si hay errores manuales**: Revisar caso por caso y fix

Ejemplos comunes:
- `max-lines-per-function`: Refactor funciones largas
- `no-explicit-any`: Tipear correctamente
- `max-params`: Usar objects para agrupar params

#### ✅ GATE 5.4: Flat Config Migrado

**Criterios CRÍTICOS**:

- [ ] **CFG-5.4.1**: eslint.config.js existe
  ```bash
  test -f templates/typescript/eslint.config.js && echo "✅ Config exists"
  ```

- [ ] **CFG-5.4.2**: .eslintrc.json eliminado
  ```bash
  test ! -f templates/typescript/.eslintrc.json && echo "✅ Old config removed"
  ```

- [ ] **LINT-5.4.1**: `npm run lint` pasa sin errores
  ```bash
  cd templates/typescript && npm run lint 2>&1 | grep -i "error" | wc -l
  # Expected: 0
  ```

- [ ] **LINT-5.4.2**: Lint puede ejecutarse en archivos específicos
  ```bash
  npx eslint src/domain/entities/User.ts
  # Expected: Sin errores
  ```

**GATE PASS Command**:
```bash
cd templates/typescript && \
test -f eslint.config.js && \
test ! -f .eslintrc.json && \
npm run lint > /dev/null 2>&1 && \
echo "✅ GATE 5.4 PASSED - Flat config OK" || echo "❌ GATE 5.4 FAILED"
```

**Rollback si falla**:
```bash
rm eslint.config.js
cp .eslintrc.json.backup .eslintrc.json
git checkout -- package.json package-lock.json
npm install
```

---

### Mini-Tarea 5.5: Validación Completa Stack ESLint

**Duración**: 30 minutos

#### 5.5.1: Build completo

```bash
cd templates/typescript
npm run build 2>&1 | tee /tmp/build-phase5.log
```

**Expected**: Build exitoso

#### 5.5.2: Tests completos

```bash
npm test 2>&1 | tee /tmp/test-phase5.log
```

**Expected**: Todos los tests pasan

#### 5.5.3: Type check

```bash
npm run type-check 2>&1 | tee /tmp/typecheck-phase5.log
```

**Expected**: Sin errores de tipos

#### 5.5.4: Lint check

```bash
npm run lint 2>&1 | tee /tmp/lint-final-phase5.log
```

**Expected**: Sin errores de lint

#### ✅ GATE 5.5: Fase 5 Completa

**Criterios CRÍTICOS**:

- [ ] **STACK-5.5.1**: ESLint 9.39.1 instalado
- [ ] **STACK-5.5.2**: @typescript-eslint/parser@8.46.4 instalado
- [ ] **STACK-5.5.3**: @typescript-eslint/eslint-plugin@8.x instalado
- [ ] **CFG-5.5.1**: eslint.config.js funcional
- [ ] **BUILD-5.5.1**: Build pasa ✅
- [ ] **TEST-5.5.1**: Tests pasan ✅
- [ ] **TYPE-5.5.1**: Type check pasa ✅
- [ ] **LINT-5.5.1**: Lint pasa ✅

**GATE PASS Command**:
```bash
cd templates/typescript && \
npm run build > /dev/null 2>&1 && \
npm test > /dev/null 2>&1 && \
npm run type-check > /dev/null 2>&1 && \
npm run lint > /dev/null 2>&1 && \
[[ $(npm list eslint | grep -c "eslint@9") -eq 1 ]] && \
echo "✅ GATE 5.5 PASSED - ESLint Stack Upgraded Successfully" || echo "❌ GATE 5.5 FAILED"
```

**Si falla**: NO CONTINUAR. Debug obligatorio.

#### 5.5.5: Commit de Fase 5

```bash
cd /home/user/kit_fundador

git add templates/typescript/

git commit -m "build: Upgrade ESLint stack to v9 with flat config

BREAKING CHANGE: Migrates from .eslintrc.json to flat config (eslint.config.js)

Package Updates:
- eslint: 8.0.0 → 9.39.1
- @typescript-eslint/parser: 6.0.0 → 8.46.4
- @typescript-eslint/eslint-plugin: 6.0.0 → 8.x.x
- typescript-eslint: new dependency for flat config

Configuration Changes:
- Removed: .eslintrc.json (deprecated in ESLint 9)
- Added: eslint.config.js (new flat config format)
- Updated rules for complexity, code quality, TypeScript

Validation:
✅ All tests pass
✅ Build succeeds
✅ Type check passes
✅ Lint passes with new rules

Migration Notes:
- Flat config uses ES modules syntax
- Rules organized by file patterns
- Test files have relaxed rules
- Compatible with ESLint 9+ only

References:
- ANALISIS_DEPENDABOT_PRS.md Phase 5
- ESLint flat config: https://eslint.org/docs/latest/use/configure/configuration-files
- typescript-eslint v8: https://typescript-eslint.io/blog/announcing-typescript-eslint-v8
"

git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

#### 5.5.6: Documentar

```bash
echo "## FASE 5 Completed - $(date)" >> EXECUTION_LOG.md
echo "- ✅ ESLint upgraded to 9.39.1" >> EXECUTION_LOG.md
echo "- ✅ @typescript-eslint stack upgraded to v8" >> EXECUTION_LOG.md
echo "- ✅ Migrated to flat config (eslint.config.js)" >> EXECUTION_LOG.md
echo "- ✅ .eslintrc.json removed" >> EXECUTION_LOG.md
echo "- ✅ All validations passing" >> EXECUTION_LOG.md
echo "- ✅ Committed and pushed" >> EXECUTION_LOG.md
```

**Tiempo real**: ______ horas
**Issues encontrados**: __________

---

## FASE 6: Actualización Jest

**Duración**: 1 hora
**Riesgo**: 🟡 MEDIO
**Objetivo**: Actualizar Jest 29 → 30 y validar tests

### Mini-Tarea 6.1: Mergear PR #7 (Jest 30)

**Duración**: 15 minutos

#### 6.1.1: Verificar pre-requisitos

```bash
cd templates/typescript

# Verificar que Fase 4 se completó (código compila)
npm run build > /dev/null 2>&1 && echo "✅ Pre-req: Code compiles" || echo "❌ BLOCKER: Code doesn't compile"
```

**Expected**: ✅ Pre-req: Code compiles

**Si falla**: STOP. Volver a Fase 4.

#### 6.1.2: Fetch PR

```bash
git fetch origin dependabot/npm_and_yarn/multi-a28ee524ce
```

#### 6.1.3: Review diff

```bash
git diff HEAD...origin/dependabot/npm_and_yarn/multi-a28ee524ce -- templates/typescript/package.json | grep -E "(jest|@types/jest)"
```

**Expected**:
```diff
-"@types/jest": "^29.5.0",
+"@types/jest": "^30.0.0",
-"jest": "^29.0.0",
+"jest": "^30.2.0",
```

#### 6.1.4: Merge

```bash
git merge origin/dependabot/npm_and_yarn/multi-a28ee524ce --no-ff -m "build: Update Jest to 30.2.0 and @types/jest to 30.0.0

Major version upgrade for testing framework.
Depends on Password.ts and Domain Events implementation (Phase 4).

Changes:
- jest: 29.x → 30.2.0
- @types/jest: 29.5.0 → 30.0.0
- Includes 2424 lines of package-lock.json updates

Breaking Changes:
- Drops Node.js 18 support (requires Node 20+)
- Timer mocks API changes
- ESM support improvements

Validation pending in next steps.
"
```

#### 6.1.5: npm install

```bash
cd templates/typescript
npm install 2>&1 | tee /tmp/npm-install-jest30.log
```

**Expected**: Sin errores críticos

#### ✅ GATE 6.1: Jest 30 Merged

- [ ] **MERGE-6.1.1**: Commit existe
- [ ] **PKG-6.1.1**: package.json tiene jest@30 y @types/jest@30
- [ ] **NPM-6.1.1**: npm install completó

---

### Mini-Tarea 6.2: Verificar ts-jest Compatibility

**Duración**: 10 minutos

#### 6.2.1: Check ts-jest version

```bash
npm list ts-jest
```

**Expected**: ts-jest@29.3.0+ (compatible con Jest 30)

#### 6.2.2: Si ts-jest está desactualizado

```bash
# Solo si npm list muestra ts-jest < 29.3.0
npm install --save-dev ts-jest@^29.3.0
```

#### ✅ GATE 6.2: ts-jest Compatible

- [ ] **PKG-6.2.1**: ts-jest >= 29.3.0

---

### Mini-Tarea 6.3: Ejecutar Tests con Jest 30

**Duración**: 30 minutos

#### 6.3.1: Dry run

```bash
cd templates/typescript

# Test simple primero
npm test -- Password.test.ts 2>&1 | tee /tmp/jest30-dryrun.log
```

**Expected**: Tests pasan

#### 6.3.2: Tests completos

```bash
npm test 2>&1 | tee /tmp/jest30-all-tests.log
```

**Expected**: Todos los tests pasan

**Si hay fallos**: Revisar output para determinar si son por Jest 30 changes

#### 6.3.3: Coverage

```bash
npm run test:coverage 2>&1 | tee /tmp/jest30-coverage.log
```

**Expected**: Coverage >= 80%

#### 6.3.4: Watch mode test (opcional)

```bash
# Iniciar watch mode y cancelar después de verificar que arranca
timeout 10s npm run test:watch || true
```

**Expected**: Watch mode inicia correctamente

#### 6.3.5: Snapshots (si existen)

```bash
# Verificar si hay snapshots
find tests -name "*.snap" -type f

# Si hay snapshots, puede que necesiten update
# npm test -- -u
```

#### ✅ GATE 6.3: Tests con Jest 30

**Criterios**:

- [ ] **TEST-6.3.1**: `npm test` pasa sin errores
  ```bash
  cd templates/typescript && npm test > /dev/null 2>&1 && echo "✅ Tests pass"
  ```

- [ ] **TEST-6.3.2**: Todos los tests anteriores aún pasan
  ```bash
  npm test 2>&1 | grep "Tests:.*passed"
  # Expected: Same number or more tests passing
  ```

- [ ] **COV-6.3.1**: Coverage >= 80%
  ```bash
  npm run test:coverage 2>&1 | grep "All files" | grep -E "(8[0-9]|9[0-9]|100)"
  ```

---

### Mini-Tarea 6.4: Validación Completa Final

**Duración**: 15 minutos

#### 6.4.1: Full regression test

```bash
cd templates/typescript

echo "=== BUILD ===" && npm run build && \
echo "=== TYPE CHECK ===" && npm run type-check && \
echo "=== LINT ===" && npm run lint && \
echo "=== TESTS ===" && npm test && \
echo "=== COVERAGE ===" && npm run test:coverage && \
echo "✅ ALL CHECKS PASSED" || echo "❌ SOME CHECKS FAILED"
```

**Expected**: ✅ ALL CHECKS PASSED

#### 6.4.2: Verificar scripts de package.json

```bash
grep -A1 '"scripts"' package.json -A 10 | grep -E "(test|lint|build)"
```

**Expected**: Todos los scripts funcionan

#### ✅ GATE 6.4: Fase 6 Completa

**Criterios FINALES**:

- [ ] **JEST-6.4.1**: Jest 30.2.0 instalado
- [ ] **JEST-6.4.2**: @types/jest 30.0.0 instalado
- [ ] **JEST-6.4.3**: ts-jest compatible
- [ ] **BUILD-6.4.1**: Build pasa ✅
- [ ] **TEST-6.4.1**: Tests pasan ✅
- [ ] **COV-6.4.1**: Coverage >= 80% ✅
- [ ] **TYPE-6.4.1**: Type check pasa ✅
- [ ] **LINT-6.4.1**: Lint pasa ✅

**GATE PASS Command**:
```bash
cd templates/typescript && \
npm run build > /dev/null 2>&1 && \
npm run type-check > /dev/null 2>&1 && \
npm run lint > /dev/null 2>&1 && \
npm test > /dev/null 2>&1 && \
npm run test:coverage > /dev/null 2>&1 && \
[[ $(npm list jest | grep -c "jest@30") -eq 1 ]] && \
echo "✅ GATE 6.4 PASSED - Jest 30 Upgrade Complete" || echo "❌ GATE 6.4 FAILED"
```

#### 6.4.3: Commit final de Fase 6

```bash
cd /home/user/kit_fundador

git add templates/typescript/

# Solo commitear si hubo cambios adicionales (ej: ts-jest update)
git diff --cached --quiet && echo "No changes to commit" || git commit -m "build: Complete Jest 30 upgrade with validation

Jest stack fully upgraded and validated:
- jest: 29.x → 30.2.0
- @types/jest: 29.5.0 → 30.0.0
- ts-jest: Verified compatible version

Validation Results:
✅ All 36+ tests pass
✅ Coverage >= 80%
✅ Build succeeds
✅ Type check passes
✅ Lint passes
✅ Watch mode functional

Node.js requirement: 20+ (Jest 30 drops Node 18)

Completes: ANALISIS_DEPENDABOT_PRS.md Phase 6
"

git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

#### 6.4.4: Documentar

```bash
echo "## FASE 6 Completed - $(date)" >> EXECUTION_LOG.md
echo "- ✅ Jest upgraded to 30.2.0" >> EXECUTION_LOG.md
echo "- ✅ @types/jest upgraded to 30.0.0" >> EXECUTION_LOG.md
echo "- ✅ All tests passing" >> EXECUTION_LOG.md
echo "- ✅ Coverage >= 80%" >> EXECUTION_LOG.md
echo "- ✅ Full regression test passed" >> EXECUTION_LOG.md
echo "- ✅ Committed and pushed" >> EXECUTION_LOG.md
```

**Tiempo real**: ______ horas
**Issues encontrados**: __________

---

## Post-Ejecución

### Mini-Tarea POST-1: Documentación Final

#### POST-1.1: Actualizar README (si necesario)

```bash
# Si hay breaking changes que afectan usuarios
cat >> templates/typescript/README.md << 'EOF'

## ⚠️ Recent Updates (Nov 2025)

### Dependencies Upgraded
- **ESLint 9**: Now uses flat config (`eslint.config.js`). If you need ESLint 8, downgrade before npm install.
- **Jest 30**: Requires Node.js 20+. Drops Node.js 18 support.
- **@typescript-eslint v8**: Compatible with ESLint 9 only.

### Express Version
This template uses Express 4.18.x (intentional). Express 5 is available but not recommended yet for production.

EOF
```

#### POST-1.2: Actualizar CHANGELOG (si existe)

```bash
cat > templates/typescript/CHANGELOG.md << 'EOF'
# Changelog

## [Unreleased] - 2025-11-16

### Changed
- Upgraded ESLint from 8.x to 9.39.1 (BREAKING: requires flat config)
- Upgraded @typescript-eslint/parser from 6.x to 8.46.4
- Upgraded @typescript-eslint/eslint-plugin from 6.x to 8.x
- Upgraded Jest from 29.x to 30.2.0 (BREAKING: requires Node 20+)
- Upgraded @types/jest from 29.5 to 30.0
- Migrated from .eslintrc.json to eslint.config.js (flat config)

### Added
- Password Value Object with bcrypt hashing
- Domain Events system (DomainEvent base class, UserCreatedEvent)
- 36+ tests for new components
- Comprehensive test coverage (>80%)

### Fixed
- Missing Password.ts import in User.test.ts
- Broken Domain Events imports in User.ts
- TypeScript compilation errors

### Dependencies
- express: Kept at 4.18.x (Express 5 not adopted)
- @types/node: [Updated to 20.x/22.x/24.x based on Phase 3 decision]
- bcrypt: Added for password hashing

## [Previous versions]
...
EOF
```

#### POST-1.3: Crear ADR para decisiones mayores

```bash
mkdir -p dev-docs/adr

cat > dev-docs/adr/001-eslint-9-flat-config.md << 'EOF'
# ADR 001: Migrate to ESLint 9 with Flat Config

## Status
Accepted - Implemented 2025-11-16

## Context
ESLint 9 deprecated the old `.eslintrc.json` format in favor of the new flat config system (`eslint.config.js`). Dependabot opened PR to upgrade to ESLint 9.

## Decision
Adopt ESLint 9 with flat config.

## Consequences

### Positive
- Future-proof (flat config is the new standard)
- Better performance
- Simplified configuration
- Improved type safety with TypeScript ESLint v8

### Negative
- Breaking change for users on ESLint 8
- Migration effort required
- Existing documentation assumes old format

### Migration Notes
- Replaced `.eslintrc.json` with `eslint.config.js`
- Added `typescript-eslint` package for flat config support
- All rules validated and working

## References
- ANALISIS_DEPENDABOT_PRS.md Phase 5
- https://eslint.org/docs/latest/use/configure/configuration-files
EOF

cat > dev-docs/adr/002-express-4-not-5.md << 'EOF'
# ADR 002: Maintain Express 4, Defer Express 5 Upgrade

## Status
Accepted - 2025-11-16

## Context
Dependabot opened PR to upgrade Express from 4.18 to 5.1.0. Express 5 has significant breaking changes in async error handling and middleware.

## Decision
**Reject Express 5 upgrade. Maintain Express 4.18.x.**

## Rationale
1. Template has no Express code implemented yet
2. Express 5 breaking changes could confuse users
3. Ecosystem middleware still migrating
4. All documentation and tutorials assume Express 4
5. No immediate value from upgrade

## Future Review
Re-evaluate when:
- Q2 2026 or when Express 5 becomes LTS
- Template implements Express-based examples
- Middleware ecosystem fully migrated

## References
- DECISION_EXPRESS_5.md
- ANALISIS_DEPENDABOT_PRS.md Phase 2
EOF

cat > dev-docs/adr/003-jest-30-node-20-requirement.md << 'EOF'
# ADR 003: Adopt Jest 30 with Node.js 20+ Requirement

## Status
Accepted - Implemented 2025-11-16

## Context
Jest 30 released with Node.js 18 support dropped. Template was on Jest 29.

## Decision
Upgrade to Jest 30.2.0.

## Consequences

### Positive
- Better ESM support
- Improved performance
- Modern timer mocks API
- Better error messages

### Negative
- Requires Node.js 20+ (breaks Node 18 users)
- Potential timer mocks migration needed

### Mitigations
- Template already specifies Node 20 in package.json
- No timer mocks in current tests
- All tests validated passing

## References
- ANALISIS_DEPENDABOT_PRS.md Phase 6
EOF
```

### Mini-Tarea POST-2: Cleanup

#### POST-2.1: Remover archivos de backup

```bash
cd templates/typescript
rm -f package.json.backup package-lock.json.backup
rm -f package.json.test-backup package-lock.json.test-backup
rm -f .eslintrc.json.backup
rm -f src/domain/entities/User.ts.backup
```

#### POST-2.2: Verificar git status limpio

```bash
cd /home/user/kit_fundador
git status
```

**Expected**: Working tree clean

### Mini-Tarea POST-3: Final Validation

#### POST-3.1: Estado de PRs de Dependabot

**Resumen esperado**:
- ✅ PR #1 (actions/checkout@v5): MERGED
- ✅ PR #2 (codeql-action@v4): MERGED
- ✅ PR #3 (ESLint 9): MERGED
- 🔴 PR #4 (Express 5): CLOSED (decision not to upgrade)
- ✅ PR #5 (@typescript-eslint/parser@8): MERGED
- ⚠️ PR #6 (@types/node@24): [MERGED/CLOSED based on Phase 3]
- ✅ PR #7 (Jest 30): MERGED

**Total PRs handled**: 7/7
**Merged**: 5-6/7
**Closed**: 1-2/7

#### POST-3.2: Versiones finales

```bash
cd templates/typescript

cat > /tmp/final-versions.txt << 'EOF'
# Final Package Versions - Post Dependabot Updates

## DevDependencies
EOF

npm list --depth=0 --dev | grep -E "(eslint|jest|typescript|@types)" >> /tmp/final-versions.txt

cat >> /tmp/final-versions.txt << 'EOF'

## Dependencies
EOF

npm list --depth=0 --prod | grep -E "(express|bcrypt)" >> /tmp/final-versions.txt

cat /tmp/final-versions.txt
```

#### POST-3.3: Commits creados

```bash
git log --oneline origin/claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS --since="1 day ago"
```

**Expected**: ~6-8 commits (GitHub Actions x2, @types/node decision, Password+Events, ESLint stack, Jest)

### Mini-Tarea POST-4: Documentación de Ejecución

#### POST-4.1: Finalizar EXECUTION_LOG.md

```bash
cat >> EXECUTION_LOG.md << 'EOF'

---

## Summary

### PRs Processed
- ✅ actions/checkout v5: Merged
- ✅ codeql-action v4: Merged
- ✅ ESLint 9: Merged (+ manual eslint-plugin update + flat config migration)
- 🔴 Express 5: CLOSED (decision: maintain Express 4)
- ✅ @typescript-eslint/parser@8: Merged
- [STATUS] @types/node@24: [MERGED/CLOSED]
- ✅ Jest 30: Merged

### Implementation Work
- ✅ Password Value Object: 21 tests, 100% coverage
- ✅ Domain Events system: 15 tests
- ✅ User.ts imports fixed
- ✅ ESLint flat config migration

### Validation
- ✅ All builds passing
- ✅ All tests passing (36+ tests)
- ✅ Coverage >= 80%
- ✅ Type checks passing
- ✅ Lint passing (new rules)

### Time Tracking
- Estimated: 8-9 hours
- Actual: [FILL IN] hours
- Variance: [FILL IN]

### Issues Encountered
[LIST ANY ISSUES]

### Lessons Learned
[NOTES FOR FUTURE]

---
Completed: $(date)
EOF
```

#### POST-4.2: Commit final documentation

```bash
cd /home/user/kit_fundador

git add EXECUTION_LOG.md DECISION_EXPRESS_5.md INVESTIGATION_TYPES_NODE.md dev-docs/adr/

git commit -m "docs: Add execution logs and ADRs for Dependabot updates

Documents:
- EXECUTION_LOG.md: Complete execution timeline
- DECISION_EXPRESS_5.md: Express 4 vs 5 decision
- INVESTIGATION_TYPES_NODE.md: @types/node investigation
- ADR 001: ESLint 9 flat config migration
- ADR 002: Express 4 retention decision
- ADR 003: Jest 30 adoption

These documents provide full audit trail of decisions and
implementation details for the Dependabot PRs update process.
"

git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

### ✅ GATE POST: Post-Ejecución Completa

**Checklist Final**:

- [ ] **DOC-POST-1**: README actualizado si necesario
- [ ] **DOC-POST-2**: CHANGELOG creado/actualizado
- [ ] **DOC-POST-3**: ADRs creados para decisiones mayores
- [ ] **CLEAN-POST-1**: Archivos de backup eliminados
- [ ] **CLEAN-POST-2**: Git working tree limpio
- [ ] **VALID-POST-1**: PRs de Dependabot cerrados/mergeados
- [ ] **VALID-POST-2**: Versiones finales documentadas
- [ ] **VALID-POST-3**: Commits pusheados
- [ ] **LOG-POST-1**: EXECUTION_LOG completado

---

## Rollback Procedures

### Rollback Completo (Emergency)

Si TODO falla y necesitas volver al estado inicial:

```bash
# Opción 1: Reset a commit específico
git reset --hard <commit-hash-before-changes>
git push --force origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS

# Opción 2: Usar backup branch
git checkout backup/pre-dependabot-updates-YYYYMMDD
git branch -D claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
git checkout -b claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
git push --force origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

### Rollback por Fase

#### Rollback Fase 1 (GitHub Actions)

```bash
# Identificar commits de Fase 1
git log --oneline --grep="actions/checkout\|codeql-action" --since="1 day ago"

# Revert commits (más seguro que reset)
git revert <commit-hash-codeql>
git revert <commit-hash-checkout>
git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

#### Rollback Fase 4 (Password + Events)

```bash
# Revert commit de Fase 4
git revert <commit-hash-phase4>

# Limpiar archivos si es necesario
rm -f templates/typescript/src/domain/value-objects/Password.ts
rm -rf templates/typescript/src/domain/events/
rm -rf templates/typescript/tests/unit/value-objects/Password.test.ts
rm -rf templates/typescript/tests/unit/events/

# Restaurar User.ts
git checkout HEAD~1 -- templates/typescript/src/domain/entities/User.ts

# Commit cleanup
git add .
git commit -m "revert: Remove Password and Domain Events implementation"
git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

#### Rollback Fase 5 (ESLint Stack)

```bash
# Revert commits de Fase 5
git revert <commit-hash-eslint-stack>

# Restaurar package.json anterior
git checkout HEAD~3 -- templates/typescript/package.json templates/typescript/package-lock.json

# Restaurar .eslintrc.json
cp templates/typescript/.eslintrc.json.backup templates/typescript/.eslintrc.json
rm templates/typescript/eslint.config.js

# npm install
cd templates/typescript
npm install

# Commit
git add .
git commit -m "revert: Restore ESLint 8 with old config format"
git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

#### Rollback Fase 6 (Jest 30)

```bash
# Revert merge de Jest
git revert <commit-hash-jest30>

# Restaurar package versions
cd templates/typescript
npm install --save-dev jest@^29.0.0 @types/jest@^29.5.0
npm install

# Validar
npm test

# Commit
git add package.json package-lock.json
git commit -m "revert: Downgrade Jest to 29.x for stability"
git push origin claude/analyze-repo-01WH9QatXeW4kMFzowyj3YHS
```

### Rollback Parcial (Specific Package)

```bash
# Ejemplo: Rollback solo ESLint
cd templates/typescript
npm install --save-dev eslint@^8.0.0

# Restaurar config
cp .eslintrc.json.backup .eslintrc.json
rm eslint.config.js

# Validar
npm run lint

# Si OK, commit
git add .
git commit -m "revert: Downgrade ESLint to 8.x"
```

---

## Resumen de Gates

| Gate | Fase | Criterio Crítico | Comando Validación |
|------|------|------------------|-------------------|
| GATE 0 | Pre-req | Git limpio, Node 20+, backups | Manual check |
| GATE 1.1 | Fase 1 | checkout@v5 merged | `git log -1 --grep="checkout"` |
| GATE 1.2 | Fase 1 | codeql@v4 merged | `git diff HEAD~1 \| grep "@v4" \| wc -l` = 3 |
| GATE 2 | Fase 2 | Express decision doc | Manual review |
| GATE 3 | Fase 3 | @types/node decision | Manual review + tests |
| GATE 4.1 | Fase 4 | Password VO tests pass | `npm test -- Password.test.ts` |
| GATE 4.2 | Fase 4 | Events tests pass | `npm test -- events/` |
| GATE 4.4 | Fase 4 | **CRITICAL**: All checks ✅ | `npm run build && npm test && npm run lint` |
| GATE 5.4 | Fase 5 | Flat config works | `npm run lint` |
| GATE 5.5 | Fase 5 | **CRITICAL**: ESLint stack OK | Full validation suite |
| GATE 6.4 | Fase 6 | **CRITICAL**: Jest 30 OK | Full validation suite |
| GATE POST | Post | Docs complete | Manual checklist |

**CRITICAL GATES** (NO CONTINUAR si fallan):
- GATE 4.4
- GATE 5.5
- GATE 6.4

---

## Comandos de Referencia Rápida

### Validación Rápida

```bash
# Full check (ejecutar desde templates/typescript)
npm run build && npm run type-check && npm run lint && npm test && echo "✅ ALL OK"

# Coverage check
npm run test:coverage | grep "All files"

# Versiones actuales
npm list eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin jest @types/jest --depth=0
```

### Git Operations

```bash
# Ver commits recientes
git log --oneline -10

# Ver diff de un merge
git diff HEAD~1 HEAD

# Ver PRs de Dependabot
git branch -r | grep dependabot

# Status del working tree
git status --short
```

### Debugging

```bash
# Ver errores de build
npm run build 2>&1 | grep -i "error"

# Ver fallos de tests
npm test 2>&1 | grep -A5 "FAIL"

# Ver warnings de lint
npm run lint 2>&1 | grep -i "warning"

# Ver dependency tree
npm list --all
```

---

## Métricas de Éxito

### Cuantitativas

- [ ] 5-6/7 PRs mergeadas
- [ ] 1-2/7 PRs cerradas con justificación
- [ ] 0 errores de build
- [ ] 0 errores de tests
- [ ] 0 errores de lint
- [ ] 0 errores de type check
- [ ] Coverage >= 80%
- [ ] 36+ tests passing
- [ ] 3 nuevos Value Objects/Events implementados
- [ ] 6-8 commits creados
- [ ] 3 ADRs documentados
- [ ] Tiempo: 8-10 horas (dentro de estimación)

### Cualitativas

- [ ] Decisiones documentadas y justificadas
- [ ] Breaking changes comunicados en README
- [ ] Rollback procedures validados
- [ ] Código compilable y ejecutable
- [ ] Tests robustos y completos
- [ ] Configuración de linting moderna
- [ ] Stack de dependencias actualizado
- [ ] Audit trail completo

---

## Notas Finales

### Mejores Prácticas Aplicadas

1. **Validación Continua**: Gate después de cada cambio crítico
2. **Backups**: Múltiples estrategias (branch, archivos)
3. **Documentación**: Decision logs, ADRs, execution logs
4. **Testing**: Validación exhaustiva en cada fase
5. **Rollback**: Procedures claras y probadas
6. **Commits**: Atómicos, descriptivos, con contexto

### Próximos Pasos (Post-Plan)

1. Monitorear nuevos Dependabot PRs
2. Re-evaluar Express 5 en Q2 2026
3. Considerar @types/node@22 si se cerró @24
4. Implementar Application Layer (siguiente fase de TDD/DDD)
5. Agregar Integration Tests (0% actualmente)

---

**Fin del Plan de Ejecución Detallado**

Total de mini-tareas: 40+
Total de gates: 15
Total de validaciones: 80+
Tiempo estimado: 8-9 horas
Nivel de riesgo: MEDIO (con mitigaciones)
