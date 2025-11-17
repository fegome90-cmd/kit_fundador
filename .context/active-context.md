# Active Context - Session Memory

> Este archivo es actualizado por el agente IA al inicio y fin de cada sesión.
> HUMANOS: No editar manualmente. Ver decision-log.json para decisiones.

## Current Session

**Started**: 2025-01-16T00:00:00Z
**Last Updated**: 2025-01-17T16:00:00Z
**Agent**: gpt-5-codex

## Active Tasks

- [TASK-004] Implementar primer use case (`RegisterUserAccount` en progreso; sigue blueprint `dev-docs/application/use-case-blueprint.md`).
- [TASK-016]/[TASK-017] Plan de Dependabot (configuración + baseline de dependencias).
- [TASK-015] Observabilidad opcional del setup (`--verbose`/`--no-color`).

> Próximo foco sugerido: ejecutar el plan de Dependabot antes de mover el primer use case a “En progreso”.

## Recent Changes

- Se completó TASK-003: servicio `db` (PostgreSQL 16) en `docker-compose.dev.yml`, comandos `make db:*`, runner SQL `scripts/migrate.ts`, seeds (`scripts/seed.ts`) y README/plan/tooling guide actualizados.
- `db/migrations/000000000000__bootstrap.sql` define `-- up/-- down`, `db/migrations/README.md` explica el naming y el runner registra entradas en `kit_migrations`.
- Se añadió `tests/integration/db/connection.test.ts` para validar la conexión y la migración bootstrap; `package.json` expone `npm run test:integration:db`.
- `.env.example`, `scripts/setup.sh` y la guía de tooling documentan cómo cargar `DATABASE_URL` automáticamente.
- `RegisterUserAccount` fue seleccionado como primer use case (DEC-2025-01-17-APP-UC1); TASK-004 se movió a "En progreso", sus DTOs (`RegisterUserAccountCommand`) + helper y el puerto `UserAccountRepository` ya viven en `src/application/` con pruebas unitarias dedicadas.

### Last 5 Commits
```
docs: document baseline tech stack decisions
chore: Initialize project with Kit Fundador v2.0
```

## Pending Decisions

 1. **Observabilidad opcional del setup (`--verbose`/`--no-color`)**
   - Needs input from: Equipo que adopte `scripts/setup.sh`.
   - Deliverable: Decidir si TASK-015 se ejecuta o se deja como opt-in documentado.
 2. **Responsable de PRs de Dependabot**
   - Needs input from: Team lead que adopte el starkit.
   - Deliverable: Actualizar `dev-docs/task.md`/`PLAN_EJECUCION_DEPENDABOT.md` indicando quién revisará los PRs automáticos y en qué cadencia.
   - Blocked by: Implementar TASK-016 para que exista `.github/dependabot.yml`.
 3. **Adapters provisionales para `RegisterUserAccount`**
   - Needs input from: Equipo de aplicación.
   - Deliverable: Decidir qué stub/repositorio temporal se usará en `src/infrastructure/_stubs` para las pruebas de integración del use case.
   - Blocked by: Definir los puertos/DTOs del handler.

## Known Issues

- Ninguno por ahora

## Context for Next Session

Stack base documentado (TypeScript + Express + Jest + ESLint/Prettier + esbuild). Próximos pasos sugeridos:
1. Ejecutar TASK-016/TASK-017 del plan de Dependabot para que `npm ci` deje de reportar vulnerabilidades moderadas.
2. Seleccionar el primer caso de uso siguiendo `dev-docs/application/use-case-blueprint.md` y documentar la elección antes de escribir código nuevo.
3. Decidir si vale la pena abordar TASK-015 (observabilidad del setup) o mantenerlo como opt-in.
4. Planear la transición del runner SQL a la herramienta definitiva (node-pg-migrate/Prisma) cuando el entorno del consumidor lo permita.

Archivos clave a revisar:
- `config/rules/ai-guardrails.json` - Reglas del agente
- `dev-docs/context.md` - Contexto del proyecto
- `dev-docs/task.md` - Tareas pendientes
