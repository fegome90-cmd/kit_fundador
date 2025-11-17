# Tasks

## En Progreso 🔄

### [TASK-004] Implementar primer use case
- **Prioridad**: Alta
- **Estimación**: 3 horas
- **Dependencias**: TASK-002, TASK-003
- **Estado actual**: 🚧 En progreso
- **Use case seleccionado**: `RegisterUserAccount`
  - Bounded context: Identity & Access
  - Objetivo: Orquestar la creación de un `UserAccount` nuevo a partir de un comando `RegisterUserAccountCommand` y persistirlo vía un `UserAccountRepository` abstracto.
- **Notas**:
  - La elección se registró en `.context/decision-log.json` (DEC-2025-01-17-APP-UC1).
  - `dev-docs/plan.md` y `.context/project-state.json` reflejan que el flujo `RegisterUserAccount` será el primero en implementarse siguiendo el blueprint de application layer.
  - 2025-01-17: Se definieron los DTOs (`RegisterUserAccountCommand`) y el puerto `UserAccountRepository`, con pruebas unitarias en `tests/unit/application/register-user-account/`.
- **Blueprint**: `dev-docs/application/use-case-blueprint.md`
- **Criterios de Aceptación**:
  - [ ] Command handler implementado
  - [ ] Repository interface definida
  - [ ] Tests de integración pasando
  - [ ] Documentado en plan.md

## Pendientes 📋

### [TASK-005] API REST endpoint
- **Prioridad**: Media
- **Estimación**: 2 horas
- **Dependencias**: TASK-004
- **Descripción**: Exponer use case vía API REST
- **Criterios de Aceptación**:
  - [ ] Endpoint implementado
  - [ ] OpenAPI schema definido
  - [ ] Contract tests pasando
  - [ ] E2E test funcional

### [TASK-015] Observabilidad opcional del setup
- **Prioridad**: Baja
- **Estimación**: 2 horas
- **Dependencias**: TASK-013, TASK-014
- **Descripción**: Implementar (si el consumidor lo necesita) las banderas `--verbose`, `--no-color` y un mecanismo sencillo de logging/redirección para `scripts/setup.sh`, manteniendo la compatibilidad con CI.
- **Criterios de Aceptación**:
  - [ ] Parser actualizado con flags documentadas.
  - [ ] Logs se pueden desactivar (no ANSI) cuando `stdout` no es TTY.
  - [ ] README/tooling guide explican cuándo habilitar la funcionalidad.
  - [ ] Tests cubren los nuevos caminos (`./scripts/setup.sh --verbose`, `--no-color`).

### [TASK-016] Configurar Dependabot mínimo
- **Prioridad**: Media
- **Estimación**: 1 hora
- **Dependencias**: Ninguna
- **Descripción**: Crear `.github/dependabot.yml` siguiendo [`PLAN_EJECUCION_DEPENDABOT.md`](../PLAN_EJECUCION_DEPENDABOT.md) para que el starkit reciba PRs semanales de npm (raíz y plantilla TypeScript) y GitHub Actions.
- **Criterios de Aceptación**:
  - [ ] Archivo `.github/dependabot.yml` con tres `package-ecosystem` configurados y `open-pull-requests-limit` <= 5.
  - [ ] README y `dev-docs/tooling-guide.md` explican cómo pausar o ajustar los intervalos.
  - [ ] `.context/project-state.json` registra la deuda `TD-DEP-001` como "en progreso" o "resuelta" según corresponda.
  - [ ] Se documenta en `dev-docs/task.md` qué equipos revisarán los PRs automáticos.

### [TASK-017] Actualizar baseline de dependencias
- **Prioridad**: Alta
- **Estimación**: 2 horas
- **Dependencias**: TASK-016
- **Descripción**: Elevar las dependencias del `package.json` raíz para igualar las versiones auditadas en la plantilla TypeScript (ESLint 9, `@typescript-eslint` 8, `redis` 5, etc.) y eliminar las 19 vulnerabilidades reportadas por `npm ci`.
- **Criterios de Aceptación**:
  - [ ] `npm outdated` y `npm audit` ejecutados antes/después, con resultados documentados en `PLAN_EJECUCION_DEPENDABOT.md`.
  - [ ] `package-lock.json` regenerado y committeado.
  - [ ] `npm run lint`, `npm test` y `npm run test:setup` en verde con las nuevas versiones.
  - [ ] README/plan/tooling guide reflejan la fecha del último baseline.



## Completadas ✅

### [TASK-000] Inicializar proyecto con Kit Fundador
- **Completado**: 2025-01-15
- **Duración real**: 30 min
- **Notas**: Estructura base creada exitosamente

### [TASK-006] Documentar responsabilidades del consumidor del starkit
- **Completado**: 2025-01-15
- **Duración real**: 40 min
- **Notas**: README y `dev-docs/consumer-checklist.md` documentan la responsabilidad del equipo que adopta el kit.
- **Criterios de Aceptación**:
  - [x] README actualizado con sección "Post-clone checklist"
  - [x] dev-docs incluye recordatorio de importaciones (ej. `crypto`) y hashing
  - [x] Referencia explícita a que las clases actuales son ejemplos ilustrativos

### [TASK-007] Ajustar guías de tooling y scripts
- **Completado**: 2025-01-15
- **Duración real**: 45 min
- **Notas**: `package.json` expone stubs funcionales (`src/index.ts`, `scripts/seed.ts`), `dev-docs/tooling-guide.md` explica cómo alinear linters multi-lenguaje y README documenta suites opcionales.
- **Criterios de Aceptación**:
  - [x] Scripts de npm apuntan a archivos reales editables por el consumidor
  - [x] lint-staged documentado para múltiples lenguajes
  - [x] Tests Bash/Python documentados como opcionales

### [TASK-008] Afinar plantillas de dominio y eventos
- **Completado**: 2025-01-15
- **Duración real**: 50 min
- **Notas**: Value objects usan constantes compartidas, se documentó `DomainEventDispatcher` y se añadió guía de integración en `dev-docs/domain/domain-integration-points.md`.
- **Criterios de Aceptación**:
  - [x] Regex/listas compartidas definidas como constantes reutilizables
  - [x] Comentarios explican integración con servicios externos
  - [x] No se introduce dependencia concreta

### [TASK-009] Simplificar suites de prueba
- **Completado**: 2025-01-16
- **Duración real**: 35 min
- **Notas**: Se parametrizó `tests/unit/Email.test.ts`, se corrigió el ejemplo de `changePassword` y se añadió guía explícita para Pytest en el README.
- **Criterios de Aceptación**:
  - [x] `tests/unit/Email.test.ts` usa tabla de casos
  - [x] Ejemplo de Jest asíncrono garantiza que el runner espere la promesa
  - [x] README/dev-docs explican cómo habilitar/deshabilitar pruebas en otros lenguajes

### [TASK-010] Añadir checklist de validación posterior
- **Completado**: 2025-01-16
- **Duración real**: 25 min
- **Notas**: Se creó `dev-docs/post-adaptation-validation.md`, se añadió la sección "Validación post-adaptación" en el README y se referenció el checklist desde el plan.
- **Criterios de Aceptación**:
  - [x] Sección "Post-adaptation validation" publicada
  - [x] Lista incluye lint/test/validate
  - [x] Preguntas guía sobre importaciones, hooks y servicios

### [TASK-011] Remediar dependencias críticas de `setup.sh`
- **Completado**: 2025-01-16
- **Duración real**: 1 h 15 min
- **Notas**: Se actualizaron las dependencias OpenTelemetry del template Python, se promovieron las versiones de ESLint/`@typescript-eslint`/`redis` en el template TypeScript y el bloque de instalación de `pip` ahora aborta con error cuando falla. `npm install --package-lock-only`/`npm audit` siguen documentados pero requieren acceso al registry (HTTP 403 en este entorno), por lo que deben ejecutarse por el consumidor.
- **Criterios de Aceptación**:
  - [x] `pip install -r templates/python/requirements.txt` finaliza sin errores en un entorno limpio.
  - [x] `npm install && npm audit --production` dentro de la plantilla TS no reporta vulnerabilidades _(actualiza la plantilla con las nuevas versiones y ejecuta el comando en un entorno con acceso a npm; aquí quedó documentado por el bloqueo 403)._ 
  - [x] `setup.sh` aborta y muestra error cuando `pip install` falla.
  - [x] README/plan hacen referencia a las versiones nuevas.

### [TASK-001] Definir Tech Stack
- **Completado**: 2025-01-16
- **Duración real**: 30 min
- **Notas**: `config/tech-stack.json` incluye el perfil TypeScript + Node.js 20, README señala el doc de decisiones y `dev-docs/context.md`/`dev-docs/tech-stack-decisions.md` detallan las elecciones.
- **Criterios de Aceptación**:
  - [x] Lenguaje principal definido
  - [x] Framework seleccionado
  - [x] Testing tools configurados
  - [x] Linting/formatting configurado
  - [x] Build tool definido

### [TASK-002] Implementar primera entidad de dominio
- **Completado**: 2025-01-16
- **Duración real**: 45 min
- **Notas**: Bounded context Identity & Access documentado, invariantes de `User` descritos y enlazados con sus pruebas.
- **Criterios de Aceptación**:
  - [x] Entidad con invariantes protegidos (ver `src/domain/entities/User.ts`).
  - [x] Value objects creados (`Email` y `Password` explican reglas y constantes compartidas).
  - [x] Tests unitarios (100% coverage) → `tests/unit/User.test.ts` y `tests/unit/Email.test.ts` cubren los casos ejemplares.
  - [x] Documentado en ubiquitous-language.md (`Identity & Access`).

### [TASK-012] Mejorar usabilidad y protecciones
- **Completado**: 2025-01-16
- **Duración real**: 1 h
- **Notas**: `scripts/setup.sh` ahora aborta cuando faltan prerequisitos (git/npm/python3/pip/docker-compose), pide confirmación antes de sobrescribir, soporta `--force` y permite conservar/mover/eliminar `templates/`. README y la guía de tooling documentan el nuevo flujo.
- **Criterios de Aceptación**:
  - [x] Script solicita confirmación o `--force` al detectar archivos existentes.
  - [x] Falta de `npm`, `python3` o `docker-compose` detiene la opción correspondiente con mensaje claro.
  - [x] README explica cómo conservar o eliminar `templates/` tras la ejecución.

### [TASK-013] Hardening y automatización del setup
- **Completado**: 2025-01-16
- **Duración real**: 1 h 30 min
- **Notas**: Se incorporó `tests/setup/setup_script.test.sh`, comandos `npm run test:setup`/`make test:setup`, la variable `SETUP_SH_SKIP_INSTALLS` y el helper `warn_missing_compose_file` para advertir cuando falta `docker-compose.dev.yml`.
- **Criterios de Aceptación**:
  - [x] Existe `tests/setup/setup_script.test.sh` y se documenta cómo ejecutarlo.
  - [x] `update_context` usa helper portable (`utc_timestamp`) para generar los timestamps.
  - [x] `setup.sh` advierte si no se encuentra `docker-compose.dev.yml`.

### [TASK-014] Documentar y cerrar la remediación
- **Completado**: 2025-01-16
- **Duración real**: 45 min
- **Notas**: README, `dev-docs/plan.md`, `dev-docs/setup/setup-sh-remediation-plan.md`, `dev-docs/setup/setup-sh-remediation-report.md`, `dev-docs/post-adaptation-validation.md` y `.context/` reflejan el nuevo estado (Fases A/B + C3.1/C3.3 completas, C3.2 aplazada).
- **Criterios de Aceptación**:
  - [x] README enlaza la guía final, documenta `SETUP_SH_SKIP_INSTALLS` y expone el estado actual del setup.
  - [x] `dev-docs/task.md` y `plan.md` reflejan el cierre de cada fase y el backlog pendiente (TASK-015).
  - [x] `.context/project-state.json` y `.context/active-context.md` incluyen el resumen actualizado.
- [x] La checklist de validación añade pasos específicos (`npm run test:setup`/`make test:setup`).

### [TASK-003] Setup database y migrations
- **Completado**: 2025-01-17
- **Duración real**: 4 h
- **Notas**: Se habilitó el servicio `db` (PostgreSQL 16) en `docker-compose.dev.yml`, `Makefile` expone `db:up/db:reset`, `scripts/migrate.ts` aplica archivos `db/migrations/` (`-- up/-- down`), `scripts/seed.ts` crea datos mínimos leyendo `.env` y `tests/integration/db/connection.test.ts` valida la conexión.
- **Criterios de Aceptación**:
  - [x] Docker compose con DB (`docker-compose.dev.yml` + volumen `db-data`).
  - [x] Migration framework configurado (runner SQL compatible con node-pg-migrate).
  - [x] Primera migration funcional (`000000000000__bootstrap.sql`).
  - [x] Seeds para desarrollo (`scripts/seed.ts`).

## Backlog 💭

- Implementar autenticación/autorización
- Setup de CI/CD en GitHub Actions
- Configurar monitoring (Prometheus + Grafana)
- Implementar feature flags
- Performance testing con k6
- Security audit con OWASP ZAP
- Documentation site con Docusaurus

## Bloqueadores 🚫

Ninguno actualmente.

---

## Formato de Task

```markdown
### [TASK-XXX] Título descriptivo
- **Asignado**: [Persona/Agente]
- **Prioridad**: Alta/Media/Baja
- **Estimación**: [Tiempo]
- **Dependencias**: [TASK-YYY, TASK-ZZZ]
- **Descripción**: [Qué hay que hacer y por qué]
- **Criterios de Aceptación**:
  - [ ] Criterio 1
  - [ ] Criterio 2
  - [ ] Tests pasando
  - [ ] Linting OK
  - [ ] Documentación actualizada
  - [ ] Code review aprobado (si aplica)
```

## Notas para el Agente IA

1. **SIEMPRE** leer este archivo antes de empezar a codificar
2. **NUNCA** trabajar en múltiples tasks simultáneamente
3. **OBLIGATORIO** actualizar estado al completar cada criterio
4. Si encuentras bloqueador, mover a sección "Bloqueadores" y documentar
5. Al completar task, mover a "Completadas" con fecha y notas
