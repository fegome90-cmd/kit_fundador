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
- [ ] Implementar use cases → sigue el plan de [`dev-docs/application/use-case-blueprint.md`](application/use-case-blueprint.md)
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

> 🔎 Consulta [`dev-docs/infrastructure/database-blueprint.md`](infrastructure/database-blueprint.md) antes de abordar TASK-003.
> El documento desgrana minitareas, revisiones de código y pruebas para adaptar el starkit sin introducir dependencias nuevas.

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

1. ✅ Ajustar `package.json` para que los comandos apunten a stubs reales (`src/index.ts`, `dist/index.js`, `scripts/seed.ts`), evitando rutas inexistentes. → ver `package.json`.
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

## Programa de remediación `scripts/setup.sh`

La auditoría detallada en `document/informes_CC/AUDITORIA_SETUP_SH.md` expone nueve hallazgos (uno crítico) que deben resolverse
antes de que un equipo adopte el script interactivo. Para mantener la trazabilidad:

1. Consulta el [plan de ejecución](setup/setup-sh-remediation-plan.md) y decide qué fases aplicarás (Fases A/B y los bloques C3.1/C3.3 ✅ ya viven en main; la observabilidad C3.2 quedó como mejora opcional documentada en `TASK-015`).
2. Registra el avance en `dev-docs/task.md` usando las TASK-011 a TASK-015.
3. Actualiza `.context/project-state.json` una vez que cierres cada fase para que futuros agentes conozcan el estado real del setup.

## Programa de ejecución Dependabot

El pipeline de GitHub Actions sigue reportando 19 vulnerabilidades moderadas porque el `package.json` raíz conserva dependencias antiguas (ESLint 8, `@typescript-eslint` 6, glob@7, rimraf@3). Además, el repositorio aún no expone `.github/dependabot.yml`. Para ordenar el trabajo:

1. Sigue [`PLAN_EJECUCION_DEPENDABOT.md`](../PLAN_EJECUCION_DEPENDABOT.md), que divide la remediación en tres fases.
2. Registra el avance usando **TASK-016** (configuración) y **TASK-017** (baseline). Ninguna otra task se creó para auto-merge/logging porque se consideró sobre-ingeniería.
3. Actualiza README, tooling guide, checklist del consumidor y guía de validación cuando cierres cada fase para mantener la trazabilidad.

> 📌 El starkit sólo garantiza dependencias saludables por defecto; cualquier flujo adicional (auto-merge, alertas custom) queda documentado como opt-in para los consumidores del kit.

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

---

## 📝 Workflow con Templates de Prompts

El proyecto incluye **24 templates estructurados** para diferentes tipos de tareas en [`dev-docs/prompt_example/`](./prompt_example/). Estos templates ayudan a mantener consistencia y calidad al trabajar con agentes IA o al documentar tareas manuales.

### Catálogo de Templates

#### Templates de Implementación (1-5)

| Template | Archivo | Uso Recomendado | Duración Típica |
|----------|---------|-----------------|-----------------|
| **1. Implementación Grande** | `prompt_template_1_large_implementation.md` | Sprints completos, arquitecturas complejas | > 5 días |
| **2. Feature Mediana** | `prompt_template_2_medium_feature.md` | Funcionalidades de tamaño medio | 2-5 días |
| **3. Bug Fix** | `prompt_template_3_bug_fix.md` | Corrección de bugs, RCA | < 1 día |
| **4. Refactoring** | `prompt_template_4_refactoring.md` | Reducción de deuda técnica | 1-3 días |
| **5. Daily Task** | `prompt_template_5_daily_task.md` | Tareas triviales y rápidas | < 2 horas |

#### Templates de Auditoría (6, 8-11)

| Template | Archivo | Uso Recomendado | Duración Típica |
|----------|---------|-----------------|-----------------|
| **6. Auditoría General** | `template_6_general_audit.md` | Gate de calidad (4 dimensiones) | Variable |
| **8. Auditoría de Seguridad** | `template_8_security_audit.md` | OWASP, vulnerabilidades, secretos | 1-3 días |
| **9. Auditoría de Performance** | `template_9_performance_audit.md` | Latencia, carga, bottlenecks | 1-3 días |
| **10. Auditoría de Calidad de Código** | `template_10_code_quality_audit.md` | Deuda técnica, code smells | 1-2 días |
| **11. Auditoría de UI/UX** | `template_11_ui_ux_audit.md` | Accesibilidad WCAG, usabilidad | 1-2 días |

#### Template de Handoff (7)

| Template | Archivo | Uso Recomendado | Duración Típica |
|----------|---------|-----------------|-----------------|
| **7. Handoff** | `template_7_general_handoff.md` | Traspasos entre equipos/agentes | Variable |

#### Templates de Investigación y Planificación (12-14)

| Template | Archivo | Uso Recomendado | Duración Típica |
|----------|---------|-----------------|-----------------|
| **12. Investigación Técnica** | `template_12_technical_research.md` | Análisis de alternativas, PoC, comparativas | Variable |
| **13. Planificación de Infraestructura** | `template_13_infrastructure_plan.md` | CI/CD, DevOps, IaC | 2-5 días |
| **14. Architecture Decision Record** | `template_14_architecture_decision_record.md` | Documentar decisiones de arquitectura | < 1 día |

#### Templates de Testing (15-19)

| Template | Archivo | Uso Recomendado | Duración Típica |
|----------|---------|-----------------|-----------------|
| **15. Plan de Pruebas General** | `template_15_testing_plan.md` | Estrategia de testing completa (TDD/BDD, unitarias, E2E) | 1-3 días |
| **16. Plan de Pruebas Unitarias** | `template_16_unit_testing_plan.md` | Pruebas de funciones/métodos/componentes aislados | < 1 día |
| **17. Plan de Pruebas de Integración** | `template_17_integration_testing_plan.md` | Integración entre módulos, servicios, capas | 1-2 días |
| **18. Plan de Pruebas E2E** | `template_18_e2e_testing_plan.md` | Flujos completos de usuario en entorno integrado | 1-3 días |
| **19. Estrategia TDD/BDD** | `template_19_tdd_bdd_strategy.md` | Desarrollo guiado por pruebas | Variable |

#### Templates de Meta-Organización y Control (20-24)

| Template | Archivo | Uso Recomendado | Duración Típica |
|----------|---------|-----------------|-----------------|
| **20. Guardrails Anti-Drift** | `template_20_anti_drift_guardrails.md` | Definir límites estrictos y mecanismos anti-desviación | Variable |
| **21. Matriz de Criterios de Éxito** | `template_21_success_criteria_matrix.md` | Definir métricas y KPIs cuantificables (4 dimensiones) | Variable |
| **22. Briefing de Misión para Agente** | `template_22_agent_mission_briefing.md` | Asignar tareas formalmente a agentes con directiva clara | Variable |
| **23. Registro de Conocimiento** | `template_23_knowledge_index_record.md` | Capturar aprendizajes y conocimiento post-misión | < 1 día |
| **24. Análisis de Trade-offs** | `template_24_trade_off_analysis.md` | Comparar alternativas técnicas con criterios ponderados | 1-2 días |

### Integración con Agent Profiles

Los templates se integran con los perfiles de agente documentados en [`dev-docs/agent-profiles/`](./agent-profiles/):

- **EJECUTOR** → Usa templates 1-5, 12-19, 24 para planificar, implementar, investigar, documentar, testing y análisis
- **VALIDADOR** → Usa templates 6, 8-11, 21 para auditorías (general y especializadas) y métricas de éxito
- **HANDOFF** → Usa templates 7, 23 para traspasos de contexto y registro de conocimiento
- **PLANIFICADOR/LÍDER** → Usa templates 20, 21, 22 para guardrails, métricas y briefings de misión

Ver guía completa de integración en: [`dev-docs/agent-profiles/PROMPTS.md`](./agent-profiles/PROMPTS.md#-integración-con-templates-de-prompts-estructurados)

### Guía de Decisión Rápida

**¿Qué template usar?**

**Implementación:**
- Nueva feature grande (> 5 días) → **Template 1**
- Nueva feature mediana (2-5 días) → **Template 2**
- Bug fix → **Template 3**
- Refactorización → **Template 4**
- Tarea rápida (< 2 horas) → **Template 5**

**Auditoría:**
- Gate de calidad general → **Template 6**
- Seguridad (OWASP, vulnerabilidades) → **Template 8**
- Performance (latencia, carga) → **Template 9**
- Calidad de código (deuda técnica) → **Template 10**
- UI/UX (accesibilidad WCAG) → **Template 11**

**Investigación y Planificación:**
- Investigación técnica/comparativa → **Template 12**
- Planificación de infraestructura (CI/CD, DevOps) → **Template 13**
- Documentar decisión de arquitectura (ADR) → **Template 14**

**Testing:**
- Plan de pruebas general (estrategia completa) → **Template 15**
- Pruebas unitarias (funciones/componentes) → **Template 16**
- Pruebas de integración (módulos/servicios) → **Template 17**
- Pruebas E2E (flujos de usuario) → **Template 18**
- Estrategia TDD/BDD (desarrollo guiado por tests) → **Template 19**

**Meta-Organización y Control:**
- Definir guardrails anti-drift → **Template 20**
- Matriz de criterios de éxito (KPIs) → **Template 21**
- Briefing de misión para agente → **Template 22**
- Registrar conocimiento post-misión → **Template 23**
- Análisis de trade-offs (alternativas) → **Template 24**

**Handoff:**
- Traspaso de contexto → **Template 7**

Ver guía completa: [`dev-docs/prompt_example/QUICK_REFERENCE.md`](./prompt_example/QUICK_REFERENCE.md)

### Workflow Recomendado para Tareas

```
1. Seleccionar template según tipo y duración de tarea
                    ↓
2. Activar agente EJECUTOR + Rellenar template
                    ↓
3. Implementar siguiendo plan (TDD, commits frecuentes)
                    ↓
4. Activar agente VALIDADOR + Usar template 6 (Audit)
                    ↓
5. ¿Gate PASS? → Template 7 (Handoff) → Siguiente tarea
   ¿Gate FAIL? → Volver a EJECUTOR para remediar issues
```

### Ejemplo de Uso: Implementar Feature Mediana

```markdown
# Paso 1: Planificación con Template 2
Modo EJECUTOR.
Template: dev-docs/prompt_example/prompt_template_2_medium_feature.md
Task: TASK-004 - Implementar primer use case

[Rellenar template con objetivos SMART, plan día a día, criterios de aceptación]

# Paso 2: Desarrollo
[Seguir plan del template con TDD]

# Paso 3: Auditoría con Template 6
Modo VALIDADOR.
Template: dev-docs/prompt_example/template_6_general_audit.md

Evaluar en 4 dimensiones:
- Completitud (30%)
- Calidad (30%)
- Impacto (25%)
- Sostenibilidad (15%)

# Paso 4: Handoff si aprueba
Template: dev-docs/prompt_example/template_7_general_handoff.md
[Documentar tareas completadas, artefactos, issues pendientes]
```

### Documentación Completa

- **README de Templates**: [`dev-docs/prompt_example/README.md`](./prompt_example/README.md)
- **Guía Rápida**: [`dev-docs/prompt_example/QUICK_REFERENCE.md`](./prompt_example/QUICK_REFERENCE.md)
- **Integración con Agentes**: [`dev-docs/agent-profiles/PROMPTS.md`](./agent-profiles/PROMPTS.md)
