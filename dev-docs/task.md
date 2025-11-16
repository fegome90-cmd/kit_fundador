# Tasks

## En Progreso 🔄

_(sin tareas activas)_

## Pendientes 📋

### [TASK-003] Setup database y migrations
- **Prioridad**: Media
- **Estimación**: 3 horas
- **Dependencias**: TASK-001
- **Descripción**: Configurar base de datos y sistema de migraciones
- **Criterios de Aceptación**:
  - [ ] Docker compose con DB
  - [ ] Migration framework configurado
  - [ ] Primera migration funcional
  - [ ] Seeds para desarrollo

### [TASK-004] Implementar primer use case
- **Prioridad**: Alta
- **Estimación**: 3 horas
- **Dependencias**: TASK-002, TASK-003
- **Descripción**: Crear primer caso de uso end-to-end
- **Criterios de Aceptación**:
  - [ ] Command handler implementado
  - [ ] Repository interface definida
  - [ ] Tests de integración pasando
  - [ ] Documentado en plan.md

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



## Completadas ✅

### [TASK-000] Inicializar proyecto con Kit Fundador
- **Completado**: 2025-01-15
- **Duración real**: 30 min
- **Notas**: Estructura base creada exitosamente

### [TASK-006] Documentar responsabilidades del consumidor del starkit
- **Completado**: 2025-01-15
- **Duración real**: 40 min
- **Notas**: README y `dev-docs/consumer-checklist.md` documentan la responsabilidad del equipo que adopta el kit.
- **Criterios de Aceptación**:
  - [x] README actualizado con sección "Post-clone checklist"
  - [x] dev-docs incluye recordatorio de importaciones (ej. `crypto`) y hashing
  - [x] Referencia explícita a que las clases actuales son ejemplos ilustrativos

### [TASK-007] Ajustar guías de tooling y scripts
- **Completado**: 2025-01-15
- **Duración real**: 45 min
- **Notas**: `package.json` usa placeholders, `dev-docs/tooling-guide.md` explica cómo alinear linters multi-lenguaje y README documenta suites opcionales.
- **Criterios de Aceptación**:
  - [x] Scripts apuntan a `<project-entrypoint>`
  - [x] lint-staged documentado para múltiples lenguajes
  - [x] Tests Bash/Python documentados como opcionales

### [TASK-008] Afinar plantillas de dominio y eventos
- **Completado**: 2025-01-15
- **Duración real**: 50 min
- **Notas**: Value objects usan constantes compartidas, se documentó `DomainEventDispatcher` y se añadió guía de integración en `dev-docs/domain/domain-integration-points.md`.
- **Criterios de Aceptación**:
  - [x] Regex/listas compartidas definidas como constantes reutilizables
  - [x] Comentarios explican integración con servicios externos
  - [x] No se introduce dependencia concreta

### [TASK-009] Simplificar suites de prueba
- **Completado**: 2025-01-16
- **Duración real**: 35 min
- **Notas**: Se parametrizó `tests/unit/Email.test.ts`, se corrigió el ejemplo de `changePassword` y se añadió guía explícita para Pytest en el README.
- **Criterios de Aceptación**:
  - [x] `tests/unit/Email.test.ts` usa tabla de casos
  - [x] Ejemplo de Jest asíncrono garantiza que el runner espere la promesa
  - [x] README/dev-docs explican cómo habilitar/deshabilitar pruebas en otros lenguajes

### [TASK-010] Añadir checklist de validación posterior
- **Completado**: 2025-01-16
- **Duración real**: 25 min
- **Notas**: Se creó `dev-docs/post-adaptation-validation.md`, se añadió la sección "Validación post-adaptación" en el README y se referenció el checklist desde el plan.
- **Criterios de Aceptación**:
  - [x] Sección "Post-adaptation validation" publicada
  - [x] Lista incluye lint/test/validate
  - [x] Preguntas guía sobre importaciones, hooks y servicios

### [TASK-001] Definir Tech Stack
- **Completado**: 2025-01-16
- **Duración real**: 30 min
- **Notas**: `config/tech-stack.json` incluye el perfil TypeScript + Node.js 20, README señala el doc de decisiones y `dev-docs/context.md`/`dev-docs/tech-stack-decisions.md` detallan las elecciones.
- **Criterios de Aceptación**:
  - [x] Lenguaje principal definido
  - [x] Framework seleccionado
  - [x] Testing tools configurados
  - [x] Linting/formatting configurado
  - [x] Build tool definido

### [TASK-002] Implementar primera entidad de dominio
- **Completado**: 2025-01-16
- **Duración real**: 45 min
- **Notas**: Bounded context Identity & Access documentado, invariantes de `User` descritos y enlazados con sus pruebas.
- **Criterios de Aceptación**:
  - [x] Entidad con invariantes protegidos (ver `src/domain/entities/User.ts`).
  - [x] Value objects creados (`Email` y `Password` explican reglas y constantes compartidas).
  - [x] Tests unitarios (100% coverage) → `tests/unit/User.test.ts` y `tests/unit/Email.test.ts` cubren los casos ejemplares.
  - [x] Documentado en ubiquitous-language.md (`Identity & Access`).

## Backlog 💭

- Implementar autenticación/autorización
- Setup de CI/CD en GitHub Actions
- Configurar monitoring (Prometheus + Grafana)
- Implementar feature flags
- Performance testing con k6
- Security audit con OWASP ZAP
- Documentation site con Docusaurus

## Bloqueadores 🚫

Ninguno actualmente.

---

## Formato de Task

```markdown
### [TASK-XXX] Título descriptivo
- **Asignado**: [Persona/Agente]
- **Prioridad**: Alta/Media/Baja
- **Estimación**: [Tiempo]
- **Dependencias**: [TASK-YYY, TASK-ZZZ]
- **Descripción**: [Qué hay que hacer y por qué]
- **Criterios de Aceptación**:
  - [ ] Criterio 1
  - [ ] Criterio 2
  - [ ] Tests pasando
  - [ ] Linting OK
  - [ ] Documentación actualizada
  - [ ] Code review aprobado (si aplica)
```

## Notas para el Agente IA

1. **SIEMPRE** leer este archivo antes de empezar a codificar
2. **NUNCA** trabajar en múltiples tasks simultáneamente
3. **OBLIGATORIO** actualizar estado al completar cada criterio
4. Si encuentras bloqueador, mover a sección "Bloqueadores" y documentar
5. Al completar task, mover a "Completadas" con fecha y notas
