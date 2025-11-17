# Active Context - Session Memory

> Este archivo es actualizado por el agente IA al inicio y fin de cada sesión.
> HUMANOS: No editar manualmente. Ver decision-log.json para decisiones.

## Current Session

**Started**: 2025-01-16T00:00:00Z
**Last Updated**: 2025-01-17T12:00:00Z
**Agent**: gpt-5-codex

## Active Tasks

- [TASK-004] Implementar primer use case (bloqueado hasta definir flujo definitivo).
- [TASK-016]/[TASK-017] Plan de Dependabot (configuración + baseline de dependencias).
- [TASK-015] Observabilidad opcional del setup (`--verbose`/`--no-color`).

> Próximo foco sugerido: ejecutar el plan de Dependabot antes de mover el primer use case a “En progreso”.

## Recent Changes

- Se completó TASK-003: servicio `db` (PostgreSQL 16) en `docker-compose.dev.yml`, comandos `make db:*`, runner SQL `scripts/migrate.ts`, seeds (`scripts/seed.ts`) y README/plan/tooling guide actualizados.
- `db/migrations/000000000000__bootstrap.sql` define `-- up/-- down`, `db/migrations/README.md` explica el naming y el runner registra entradas en `kit_migrations`.
- Se añadió `tests/integration/db/connection.test.ts` para validar la conexión y la migración bootstrap; `package.json` expone `npm run test:integration:db`.
- `.env.example`, `scripts/setup.sh` y la guía de tooling documentan cómo cargar `DATABASE_URL` automáticamente.

### Last 5 Commits
```
docs: document baseline tech stack decisions
chore: Initialize project with Kit Fundador v2.0
```

## Pending Decisions

 1. **Primer caso de uso a implementar**
   - Needs input from: Product/Domain owner.
   - Deliverable: Nota en `dev-docs/task.md` y decisión en `.context/decision-log.json` usando el blueprint de application layer.
   - Blocked by: Ninguno tras habilitar la base de datos.
 2. **Observabilidad opcional del setup (`--verbose`/`--no-color`)**
   - Needs input from: Equipo que adopte `scripts/setup.sh`.
   - Deliverable: Decidir si TASK-015 se ejecuta o se deja como opt-in documentado.
 3. **Responsable de PRs de Dependabot**
   - Needs input from: Team lead que adopte el starkit.
   - Deliverable: Actualizar `dev-docs/task.md`/`PLAN_EJECUCION_DEPENDABOT.md` indicando quién revisará los PRs automáticos y en qué cadencia.
   - Blocked by: Implementar TASK-016 para que exista `.github/dependabot.yml`.

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
