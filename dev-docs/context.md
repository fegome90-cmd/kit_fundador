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
Ver: `config/tech-stack.json`

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
