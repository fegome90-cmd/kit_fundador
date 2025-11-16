# Plan de Desarrollo

## Roadmap

### Fase 0: Fundación ✅
- [x] Estructura de carpetas
- [x] Configuración de linting/formatting
- [x] Setup de testing
- [x] Documentación base
- [x] CI/CD pipeline
- [x] Development environment (Docker)

### Fase 1: Core Domain
- [x] Definir bounded contexts → `dev-docs/domain/ubiquitous-language.md#bounded-context-identity--access`.
- [x] Identificar aggregates principales → `Identity & Access` documenta `UserAccount` como aggregate raíz.
- [x] Implementar entidades core → `src/domain/entities/User.ts` + value objects asociados descritos en la guía.
- [x] Definir domain events → `UserCreatedEvent` detallado y eventos futuros listados en el glosario.
- [ ] Tests de domain layer (100% coverage) → pendiente de expandir cuando se añadan nuevos aggregates.

### Fase 2: Application Layer
- [ ] Implementar use cases
- [ ] Command handlers
- [ ] Query handlers
- [ ] Application services
- [ ] Integration tests

### Fase 3: Infrastructure
- [ ] Database setup y migrations
- [ ] Repository implementations
- [ ] API REST/GraphQL
- [ ] Authentication/Authorization
- [ ] Observability (logs, metrics, traces)

### Fase 4: Production Ready
- [ ] Performance testing
- [ ] Security audit
- [ ] Load testing
- [ ] Documentation completa
- [ ] Deployment automation

## Programa de endurecimiento post auditoría (commit 7f0912b)

El commit `7f0912b` incorporó mejoras generales de documentación y guías contextuales. A partir de esa base debemos ejecutar un plan ligero que mantenga el carácter de **starkit agnóstico** del repositorio mientras resolvemos las observaciones de la auditoría más reciente. El objetivo no es completar funcionalidades, sino dejar instrucciones claras para que el consumidor del kit pueda hacerlo.

### Fase 1 – Fundamentos del esqueleto

1. ✅ Documentar en README/dev-docs qué responsabilidades recaen en el consumidor (entrypoint, importación de `crypto`, implementación real de hashing, etc.). → ver `README.md#🧭-post-clone-checklist` y `dev-docs/consumer-checklist.md`.
2. ✅ Añadir checklist post-clonado que recuerde revisar dependencias implícitas y definir servicios concretos. → `dev-docs/consumer-checklist.md` sirve como lista marcable.
3. ✅ Señalar explícitamente que las clases actuales son ejemplos ilustrativos y deben ser extendidas o reemplazadas. → se advierte en el README y en la checklist.

### Fase 2 – Tooling mínimo y scripts ✅

1. ✅ Ajustar `package.json` para que los comandos apunten a placeholders (`<project-entrypoint>`, `<build-output>`, `<seed-script>`), evitando rutas inexistentes. → ver `package.json`.
2. ✅ Proveer instrucciones para conectar linting/formatting y `lint-staged` a los lenguajes que el usuario habilite. → ver `dev-docs/tooling-guide.md` y `README.md#🧰-personaliza-scripts-y-linters`.
3. ✅ Decidir si los tests Bash/Python permanecen como ejemplo y documentar cómo activarlos. → ver `dev-docs/tooling-guide.md#3-suites-de-pruebas-opcionales` y `README.md#🧪-suites-opcionales-multi-lenguaje`.

### Fase 3 – Plantillas de dominio y eventos ✅

1. ✅ Extraer constantes (regex, listas) fuera de los value objects para mostrar buenas prácticas sin agregar dependencias. →
   ver `src/domain/value-objects/Email.ts` y `Password.ts`.
2. ✅ Documentar dónde se espera integrar un dispatcher de eventos o servicios de infraestructura reales. → ver
   `src/domain/domain-events/DomainEventDispatcher.ts` y `dev-docs/domain/domain-integration-points.md`.
3. ✅ Mantener los ejemplos simples, aclarando que el agregado no cubre todos los casos productivos. → ver sección
   `README.md#🧱-plantillas-de-dominio-y-eventos`.

### Fase 4 – Pruebas orientativas ✅

1. ✅ Reemplazar suites excesivamente largas por ejemplos parametrizados que ilustren la intención. → ver `tests/unit/Email.test.ts`.
2. ✅ Corregir ejemplos asíncronos para que Jest (u otros runners) demuestren buenas prácticas. → ver `tests/unit/User.test.ts`.
3. ✅ Explicar cómo ejecutar o descartar la suite Python según el stack elegido. → ver `README.md#🧪-suites-opcionales-multi-lenguaje`.

### Fase 5 – Validación posterior ✅

1. ✅ Checklist publicada en `dev-docs/post-adaptation-validation.md` con lint/test/type-check y validaciones de arquitectura.
2. ✅ Preguntas guía incluidas en la misma guía para cubrir importaciones, servicios y hooks.
3. ✅ `dev-docs/task.md` actualizado (TASK-010) para indicar qué artefactos deben tocar los consumidores tras aterrizar el kit.

## Hitos

| Hito | Fecha Objetivo | Estado | Notas |
|------|----------------|--------|-------|
| Fundación Completa | [Fecha] | ✅ | Kit Fundador aplicado |
| MVP Domain Model | [Fecha] | 🟡 | En progreso |
| API v1.0 | [Fecha] | ⚪ | Pendiente |
| Production Deploy | [Fecha] | ⚪ | Pendiente |

**Estados**: ✅ Completado | 🟡 En progreso | ⚪ Pendiente | 🔴 Bloqueado

## Dependencias Críticas

### Externas
- [ ] Acceso a base de datos producción
- [ ] API keys de servicios third-party
- [ ] Credenciales de deployment

### Internas
- [ ] Definición de requirements de negocio
- [ ] Diseño de UI/UX (si aplica)
- [ ] Aprobación de arquitectura

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Cambios en requirements | Media | Alto | Usar feature flags, arquitectura flexible |
| Dependencias de third-party | Baja | Alto | Circuit breakers, fallbacks |
| Performance issues | Media | Medio | Load testing temprano, monitoring |
| Security vulnerabilities | Baja | Crítico | Security audit, dependency scanning |

## Métricas de Éxito

- ✅ Test coverage > 80%
- ✅ Zero critical security vulnerabilities
- ✅ API response time p95 < 500ms
- ✅ Uptime > 99.9%
- ✅ Error rate < 1%

## Retrospectivas

### Sprint 0 - Fundación
- **Bien**: Setup automatizado funciona perfecto
- **Mal**: [Pendiente]
- **Mejoras**: [Pendiente]
