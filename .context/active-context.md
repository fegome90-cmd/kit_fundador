# Active Context - Session Memory

> Este archivo es actualizado por el agente IA al inicio y fin de cada sesión.
> HUMANOS: No editar manualmente. Ver decision-log.json para decisiones.

## Current Session

**Started**: 2025-01-16T00:00:00Z
**Last Updated**: 2025-01-16T00:00:00Z
**Agent**: gpt-5-codex
**Agent**: Claude Sonnet 4.5

## Active Tasks

- _(sin tareas activas)_
- Próximo foco sugerido: [TASK-003] database & migrations, seguido de [TASK-004] primer use case.

## Recent Changes

- `dev-docs/domain/ubiquitous-language.md` ahora describe el bounded context **Identity & Access** y documenta `UserAccount`.
- `dev-docs/domain/invariants.md` lista las reglas activas para `User`, `Email` y `Password`.
- `dev-docs/plan.md`, `dev-docs/task.md`, `.context/project-state.json` y README referencian los nuevos artefactos.

### Last 5 Commits
```
docs: document baseline tech stack decisions
chore: Initialize project with Kit Fundador v2.0
```

## Pending Decisions

1. **Database provider para Task-003**
   - Needs input from: Platform lead
   - Deliverable: ADR corto que seleccione Postgres/Prisma o alternativa.
2. **Framework de migrations**
   - Needs input from: Platform lead
   - Blocked by: Decisión de DB; actualizar `dev-docs/task.md` cuando se defina.

## Known Issues

- Ninguno por ahora

## Context for Next Session

Stack base documentado (TypeScript + Express + Jest + ESLint/Prettier + esbuild). Próximos pasos sugeridos:
1. Arrancar [TASK-003] enfocándose en documentación/plantillas de base de datos y migraciones.
2. Preparar blueprint del primer use case ([TASK-004]) alineado con el aggregate `User`.
3. Mantener `dev-docs/plan.md` y `.context/project-state.json` sincronizados tras cada fase.

Archivos clave a revisar:
- `config/rules/ai-guardrails.json` - Reglas del agente
- `dev-docs/context.md` - Contexto del proyecto
- `dev-docs/task.md` - Tareas pendientes
