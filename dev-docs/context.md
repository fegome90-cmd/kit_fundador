# Context

## Propósito del Proyecto
Proveer un **starkit de Identity & Access** que incluya ejemplos autocontenidos de entidades (`User`), value objects (`Email`, `Password`) y eventos de dominio para que cualquier equipo arranque un proyecto desde cero sin depender de infraestructura real.

## Alcance
### En Scope
- Documentar bounded contexts iniciales y sus invariantes (ver `dev-docs/domain/ubiquitous-language.md`).
- Exponer ejemplos de entidades, value objects y eventos sin dependencias de frameworks.
- Definir checklists y planes para que los equipos consumidores reemplacen los placeholders por implementaciones reales.

### Out of Scope
- Implementaciones completas de infraestructura (DB, colas, proveedores de identidad externos).
- Casos de uso y endpoints listos para producción.
- Configuración real de CI/CD o despliegues a ambientes compartidos.

## Stack Tecnológico
- Lenguaje base: **TypeScript (Node.js 20)**.
- Framework backend: **Express mínimo** (sólo para exponer ejemplos; reemplazar cuando exista entrypoint real).
- Testing: **Jest** (unit), **Playwright** (e2e), **Pact** (contratos) y **k6** (carga) como referencias.
- Lint/Format: **ESLint + @typescript-eslint + Prettier**.
- Build: **esbuild** → `dist/`.
- Observabilidad & Deploy: PostgreSQL 16 + Prisma, Redis 7, Prometheus/Jaeger/OpenTelemetry, GitHub Actions → GHCR → Kubernetes.
- Fuente de verdad: `config/tech-stack.json` y `dev-docs/tech-stack-decisions.md`.

## Estado del setup interactivo
- Fases A/B completadas (dependencias auditadas, prerequisitos, confirmación/`--force`, prompt para `templates/`).
- C3.1 (harness Bash + `npm run test:setup`/`make test:setup`) y C3.3 (`utc_timestamp`, serialización via Python, `warn_missing_compose_file`) ya viven en `main`.
- La observabilidad mínima (C3.2) quedó registrada como opt-in en `TASK-015`; sólo se implementará si el consumidor lo solicita.
- Usa `SETUP_SH_SKIP_INSTALLS=true` en CI o en el harness cuando quieras validar el flujo sin acceder a npm/PyPI.

## Estado de infraestructura (TASK-003)
- No se incluye base de datos real en el starkit; se publicó [`dev-docs/infrastructure/database-blueprint.md`](infrastructure/database-blueprint.md)
  como guía agnóstica.
- El blueprint cubre docker-compose, migraciones, seeds y pruebas de smoke para que cada consumidor adapte el kit sin
  arrastrar dependencias.
- TASK-003 permanece pendiente hasta que el equipo defina proveedor y herramienta de migraciones en su fork.

## Estado de la capa de aplicación (TASK-004)
- La capa `application/` incluye únicamente stubs; el flujo real se documenta en [`dev-docs/application/use-case-blueprint.md`](application/use-case-blueprint.md).
- El blueprint describe contratos (DTOs/ports), handlers, stubs temporales y el plan de pruebas para guiar la implementación sin
  acoplar infraestructura.
- TASK-004 seguirá en “Pendiente” hasta que un consumidor adopte el blueprint y documente qué use case está construyendo.

## Arquitectura

```
┌─────────────────────────────────────────────────┐
│           Infrastructure Layer                  │
│  (Frameworks, DB, APIs, External Services)      │
└─────────────────────────────────────────────────┘
           ↓ implements interfaces ↓
┌─────────────────────────────────────────────────┐
│           Application Layer                     │
│     (Use Cases, Command/Query Handlers)         │
└─────────────────────────────────────────────────┘
           ↓ orchestrates ↓
┌─────────────────────────────────────────────────┐
│              Domain Layer                       │
│  (Entities, Value Objects, Aggregates, Rules)   │
│         ← NO DEPENDENCIES →                     │
└─────────────────────────────────────────────────┘
```

## Decisiones Técnicas

### ADR-000: Usar Clean Architecture con DDD
- **Contexto**: Necesitamos arquitectura escalable y mantenible
- **Decisión**: Implementar Clean Architecture + Domain-Driven Design
- **Consecuencias**: 
  - ✅ Código independiente de frameworks
  - ✅ Testeable sin dependencias externas
  - ✅ Lógica de negocio protegida
  - ⚠️ Más boilerplate inicial
  - ⚠️ Curva de aprendizaje para el equipo

### ADR-001: [Próxima decisión]
- **Contexto**: [Por qué necesitamos decidir]
- **Decisión**: [Qué decidimos]
- **Consecuencias**: [Implicaciones positivas y negativas]

## Glosario (Ubiquitous Language)
Ver: `dev-docs/domain/ubiquitous-language.md`

## Referencias
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design - Eric Evans](https://www.domainlanguage.com/ddd/)
- [Implementing Domain-Driven Design - Vaughn Vernon](https://vaughnvernon.com/)
