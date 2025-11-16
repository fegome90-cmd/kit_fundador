# Context

## Propósito del Proyecto
[Descripción clara del problema que resuelve este proyecto]

## Alcance
### En Scope
- [Funcionalidad 1]
- [Funcionalidad 2]

### Out of Scope
- [Lo que NO se incluye]

## Stack Tecnológico
- Lenguaje base: **TypeScript (Node.js 20)**.
- Framework backend: **Express mínimo** (sólo para exponer ejemplos; reemplazar cuando exista entrypoint real).
- Testing: **Jest** (unit), **Playwright** (e2e), **Pact** (contratos) y **k6** (carga) como referencias.
- Lint/Format: **ESLint + @typescript-eslint + Prettier**.
- Build: **esbuild** → `dist/`.
- Observabilidad & Deploy: PostgreSQL 16 + Prisma, Redis 7, Prometheus/Jaeger/OpenTelemetry, GitHub Actions → GHCR → Kubernetes.
- Fuente de verdad: `config/tech-stack.json` y `dev-docs/tech-stack-decisions.md`.

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
