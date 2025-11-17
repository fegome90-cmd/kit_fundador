# Tasks

## En Progreso 🔄

_(Sin tareas activas; consulta la sección Pendientes para el siguiente foco.)_

## Completados ✅

### [TASK-004] Implementar primer use case (RegisterUserAccount)
- **Prioridad**: Alta
- **Estimación**: 3 horas
- **Estado**: ✅ Completado (2025-11-17)
- **Dependencias**: TASK-003
- **Descripción**: Implementar caso de uso RegisterUserAccount con DTOs, handler, repository pattern y tests completos
- **Criterios de Aceptación**:
  - [x] DTOs definidos (RegisterUserAccountCommand)
  - [x] Handler implementado con reglas de negocio
  - [x] Repository port e implementación stub
  - [x] Unit tests con 100% coverage
  - [x] Integration tests end-to-end
  - [x] Documentación actualizada

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
