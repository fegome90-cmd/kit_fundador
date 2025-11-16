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
- [ ] Definir bounded contexts
- [ ] Identificar aggregates principales
- [ ] Implementar entidades core
- [ ] Definir domain events
- [ ] Tests de domain layer (100% coverage)

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

1. Documentar en README/dev-docs qué responsabilidades recaen en el consumidor (entrypoint, importación de `crypto`, implementación real de hashing, etc.).
2. Añadir checklist post-clonado que recuerde revisar dependencias implícitas y definir servicios concretos.
3. Señalar explícitamente que las clases actuales son ejemplos ilustrativos y deben ser extendidas o reemplazadas.

### Fase 2 – Tooling mínimo y scripts

1. Ajustar `package.json` para que los comandos apunten a placeholders (`<project-entrypoint>`), evitando rutas inexistentes.
2. Proveer instrucciones para conectar linting/formatting y `lint-staged` a los lenguajes que el usuario habilite.
3. Decidir si los tests Bash/Python permanecen como ejemplo y documentar cómo activarlos.

### Fase 3 – Plantillas de dominio y eventos

1. Extraer constantes (regex, listas) fuera de los value objects para mostrar buenas prácticas sin agregar dependencias.
2. Documentar dónde se espera integrar un dispatcher de eventos o servicios de infraestructura reales.
3. Mantener los ejemplos simples, aclarando que el agregado no cubre todos los casos productivos.

### Fase 4 – Pruebas orientativas

1. Reemplazar suites excesivamente largas por ejemplos parametrizados que ilustren la intención.
2. Corregir ejemplos asíncronos para que Jest (u otros runners) demuestren buenas prácticas.
3. Explicar cómo ejecutar o descartar la suite Python según el stack elegido.

### Fase 5 – Validación posterior

1. Crear checklist para que, tras personalizar el starkit, se ejecuten `lint`, `test` y validaciones de arquitectura.
2. Añadir preguntas guía para verificar que se cubrieron importaciones, servicios y hooks.
3. Registrar en `dev-docs/task.md` los artefactos que cada usuario debe actualizar cuando aterriza el kit.

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
