# Tech Stack Decisions

> Referencia rápida para agentes y equipos humanos sobre las elecciones base del starkit.

## Resumen ejecutivo

| Área | Decisión | Estado | Razón principal |
|------|----------|--------|-----------------|
| Lenguaje | TypeScript (Node.js 20) | ✅ Seleccionado | Tipado estático, tooling maduro y soporte directo de las plantillas existentes. |
| Framework backend | Express mínimo | ✅ Seleccionado | Fácil de reemplazar por cualquier framework sin reescribir el dominio. |
| Testing | Jest + Playwright + Pact + k6 | ✅ Seleccionado | Cubre unitarios, e2e, contratos y carga como guía. |
| Linting/Formatting | ESLint (@typescript-eslint) + Prettier | ✅ Seleccionado | Stack estándar para repos TS multi-agente. |
| Build | esbuild | ✅ Seleccionado | Compila rápido y no fuerza pipeline complejo. |

## Detalle por categoría

### Lenguaje y runtime
- **Predeterminado**: TypeScript sobre Node.js 20 (ESM).
- **Alternativas soportadas**: Python (FastAPI) y modo "config only" para otros lenguajes.
- **Qué debe hacer el consumidor**: Si no usará TypeScript, documentar su stack final en `dev-docs/context.md` y ajustar `config/tech-stack.json`.

### Framework backend
- **Base**: Express + routers ligeros.
- **Motivo**: Permite exponer ejemplos de handlers sin arrastrar dependencias de opinión fuerte.
- **Recordatorio**: Sustituir por Fastify/Nest/Hono/etc. en cuanto exista un entrypoint real.

### Testing
- **Unitarios**: Jest (configurado en `package.json`).
- **Cobertura**: NYC/istanbul, aunque se anima a integrar la herramienta del stack final.
- **End-to-end**: Playwright como placeholder.
- **Carga**: k6 para scripts de ejemplo.
- **Contratos**: Pact.
- **Guía**: Documentar reemplazos en `dev-docs/tooling-guide.md` cuando se elija otro runner.

### Linting y formato
- **Lint**: ESLint con `@typescript-eslint`.
- **Format**: Prettier.
- **Notas**: `lint-staged` sólo contempla `.ts` hasta que el consumidor agregue otros lenguajes (ver `README.md#🧰-personaliza-scripts-y-linters`).

### Build y distribución
- **Build tool**: esbuild.
- **Output**: `dist/`.
- **Motivo**: Responde rápido durante workshops; se puede cambiar por tsup, swc o webpack sin tocar dominio.

### Observabilidad, base de datos y despliegue
- **DB**: PostgreSQL 16 + Prisma + prisma-migrate.
- **Cache**: Redis 7.
- **Observabilidad**: Prometheus, Jaeger, OpenTelemetry, Winston.
- **CI/CD**: GitHub Actions + GHCR + Kubernetes.
- **Responsabilidad del consumidor**: Encender sólo los componentes que su producto necesite y documentar cualquier cambio.

## Checklist para nuevos agentes
- [ ] Revisar `config/tech-stack.json` antes de proponer dependencias nuevas.
- [ ] Confirmar que cualquier ajuste queda registrado en este documento y en `dev-docs/task.md`.
- [ ] Actualizar `.context/project-state.json` (`project_metadata.tech_stack_hash`) tras cada cambio relevante.

