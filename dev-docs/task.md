# Tasks

## En Progreso 🔄

### [TASK-001] Definir Tech Stack
- **Asignado**: Agente IA / Tech Lead
- **Prioridad**: Alta
- **Estimación**: 1 hora
- **Descripción**: Completar config/tech-stack.json con decisiones de tecnología
- **Criterios de Aceptación**:
  - [ ] Lenguaje principal definido
  - [ ] Framework seleccionado
  - [ ] Testing tools configurados
  - [ ] Linting/formatting configurado
  - [ ] Build tool definido

## Pendientes 📋

### [TASK-002] Implementar primera entidad de dominio
- **Prioridad**: Alta
- **Estimación**: 2 horas
- **Dependencias**: TASK-001
- **Descripción**: Crear primera entidad siguiendo DDD patterns
- **Criterios de Aceptación**:
  - [ ] Entidad con invariantes protegidos
  - [ ] Value objects creados
  - [ ] Tests unitarios (100% coverage)
  - [ ] Documentado en ubiquitous-language.md

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
