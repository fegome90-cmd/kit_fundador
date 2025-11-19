# Plan de Desarrollo

## Roadmap Oficial: v2.1 → v3.0

### Metas Globales

El Kit Fundador debe consolidarse como:
1. **Starter kit profesional** - Calidad empresarial sin complejidad innecesaria
2. **Agnóstico a lenguajes** - Soporta TypeScript, Python y otros sin inflarse
3. **Fácil de extender** - Sin sobreabstracción ni capas vacías
4. **TDD real** - No simulado, con ejemplos ejecutables
5. **Compatible con agentes IA** - Guardrails formales y contextos controlados
6. **Auditado por CI/CD** - Sin dependencias mágicas
7. **Estable a largo plazo** - Sobrevive cambios de stack y herramientas

### Principios del Roadmap

Estos 6 principios son inamovibles:

1. **Simplicidad antes que abstracción** - Nada entra si no reduce carga cognitiva
2. **Opt-in para todo lo complejo** - Features avanzadas nunca son obligatorias
3. **Infraestructura mínima y demostrativa** - El kit muestra cómo, no impone cómo
4. **TDD/DDD antes que frameworks** - El propósito es enseñar arquitectura y calidad
5. **El kit nunca compila contra frameworks externos** - Evita acoplamiento futuro
6. **Compatibilidad IA nativa** - Plantillas claras, guías concretas, contextos controlables

---

### v2.1 - Estabilización y Correcciones Críticas ✅

**Objetivo**: El kit debe instalarse, ejecutarse y testearse sin errores.

**Trabajos completados**:
- [x] Estructura de carpetas base
- [x] Configuración de linting/formatting
- [x] Setup de testing (Jest, pytest)
- [x] Documentación base (README, dev-docs)
- [x] CI/CD pipeline básico
- [x] Development environment (Docker)
- [x] Bounded contexts definidos → `dev-docs/domain/ubiquitous-language.md`
- [x] Aggregates principales identificados → `UserAccount` como aggregate raíz
- [x] Entidades core → `src/domain/entities/User.ts` + value objects
- [x] Domain events definidos → `UserCreatedEvent` y eventos futuros
- [x] Sistema de 24 templates de prompts estructurados
- [x] Perfiles de agente (EJECUTOR, VALIDADOR, HANDOFF, PLANIFICADOR)
- [x] GitHub Actions workflows (CI, CodeQL, Dependabot)
- [x] **Phase 2 de TASK-005**: Contract test isolation y ADR documentation
- [x] **Password Security**: Implementación bcrypt con salt rounds 12 (TD-SEC-001 resuelto)
- [x] **TypeScript ES2022**: Module configuration mejorada
- [x] **Testing Tools**: Suite completa de validación (ADR-003, ADR-004, ADR-005)
- [x] **VALIDADOR v2.1**: Enhanced validation capabilities

**Trabajos pendientes**:
- [ ] Corregir Domain Events rotos del template TypeScript
- [ ] Phase 3 de TASK-005: E2E tests y quality gates finales
- [ ] Phase 4 de TASK-005: Finalización de API endpoint y documentación
- [ ] Completar Email VO tests exhaustivos
- [ ] Fix real de requirements.txt Python (OpenTelemetry)
- [ ] Corregir vulnerabilidades moderadas de TypeScript (npm audit) - TASK-016/TASK-017
- [ ] Normalizar directorios y rutas (domain/application/infrastructure)

### Próximos Hitos Inmediatos (Next 2-3 sesiones)
1. **TASK-005 Phase 3**: Implementar E2E tests con Playwright
2. **TASK-005 Phase 4**: Quality gates finales y documentación completa
3. **TASK-016**: Configurar Dependabot mínimo para el package.json raíz
4. **TASK-017**: Actualizar baseline de dependencias (ESLint 8 → 9, TypeScript 6 → 5)

### Métricas de Progreso Actuales
- **Test Coverage**: 95.88% (excelente)
- **Technical Debt**: 4 items críticos (2 resueltos, 2 pendientes)
- **ADR Documentation**: 5 ADRs implementados (estructura sólida)
- **Phase 2 Completion**: 100% con todos los deliverables listos
- **Security**: bcrypt implementation (production-ready)
- [ ] Tests de domain layer (100% coverage)

**Duración estimada**: 1-2 días

**Criterios de aceptación**:
- ✅ El kit compila sin errores
- ✅ Los tests pasan al 100%
- ✅ No hay imports rotos
- ✅ No hay dependencias inexistentes
- ✅ Setup.sh funciona sin errores

---

### v2.2 - Application Layer e Infraestructura Mínima

**Objetivo**: Agregar lo mínimo indispensable para tener un sistema completo pero ligero.

**Application Layer**:
- [ ] Crear interfaces de Use Cases (`RegisterUser`, `DummyUseCase`)
- [ ] Crear DTOs formales (Input/Output DTOs)
- [ ] Crear comandos y queries básicos (CQRS pattern)
- [ ] Implementar un único use case real: `RegisterUser`
- [ ] Command handlers básicos
- [ ] Query handlers básicos
- [ ] Application services mínimos

**Infrastructure Layer**:
- [ ] Controlador HTTP vacío (ejemplo)
- [ ] Repositorio in-memory (ejemplo funcional)
- [ ] Adaptadores dummy (email, messaging)
- [ ] Database setup y migrations (opcional)
- [ ] Repository implementations (interfaces + in-memory)

**Reglas estrictas**:
- ❌ Ningún framework real dentro del domain
- ✅ Todo ejemplo es opt-in
- ❌ Ningún archivo funciona como "framework dentro de framework"
- ✅ Infraestructura mínima y demostrativa

**Duración estimada**: 2-3 días

**Criterios de aceptación**:
- ✅ Use case `RegisterUser` funciona end-to-end
- ✅ Application layer desacoplada de domain
- ✅ Infrastructure layer intercambiable
- ✅ Ninguna dependencia a frameworks externos en domain

---

### v2.3 - Testing Completo y Herramientas Base

**Objetivo**: Hacer del kit un entorno de TDD real, usable por equipos y agentes IA.

**Testing Infrastructure**:
- [ ] Unit tests completos (domain, value objects, entities)
- [ ] Integration tests (application layer)
- [ ] E2E tests básicos (flujos críticos)
- [ ] Test builders (`UserBuilder`, `EmailBuilder`)
- [ ] Test DB in-memory (SQLite/H2)
- [ ] Fixtures y factories
- [ ] Test utilities universales
- [ ] Arquitectura de carpetas estándar para tests

**CI/CD Workflows**:
- [x] `.github/workflows/ci.yml` (lint, test, build)
- [x] `.github/workflows/codeql.yml` (security)
- [x] `.github/dependabot.yml` (dependency updates)
- [ ] `.github/workflows/test-matrix.yml` (ts, py, config-only)
- [ ] `.github/workflows/security-audit.yml` (OWASP, Snyk)

**Herramientas de Calidad**:
- [ ] Pre-commit hooks configurados
- [ ] Coverage reports (Codecov/Coveralls)
- [ ] Mutation testing (Stryker opcional)

**Duración estimada**: 3-5 días

**Criterios de aceptación**:
- ✅ Cobertura de tests ≥ 80%
- ✅ Tests ejecutables en CI
- ✅ TDD workflow documentado
- ✅ Test builders reutilizables

---

### v2.4 - Observabilidad Opcional y Ejemplos Reales

**Objetivo**: Entregar herramientas de observabilidad de manera opcional, sin inflar el kit.

**Observabilidad (Opcional)**:
- [ ] Archivos ejemplo de Prometheus (no instalados por defecto)
- [ ] Configuración mínima Jaeger (opcional)
- [ ] Ejemplo de pruebas de latencia con k6 (documentado)
- [ ] Dashboard Grafana exportado (JSON)
- [ ] Ejemplos de structured logging con correlation ID
- [ ] OpenTelemetry setup básico (opt-in)

**Ejemplos Reales**:
- [ ] API REST mínima (Express/FastAPI)
- [ ] Authentication/Authorization básico (JWT)
- [ ] Rate limiting (ejemplo)
- [ ] Error handling patterns

**Restricciones**:
- ❌ Nada de esto se instala por defecto
- ❌ No se agregan librerías invasivas
- ✅ Todo es opt-in y documentado
- ✅ Configuración en archivos separados

**Duración estimada**: 2-4 días

**Criterios de aceptación**:
- ✅ Observabilidad completamente opcional
- ✅ Ejemplos funcionan sin modificar core
- ✅ Documentación clara de activación

---

### v2.5 - Preparación para IA-Asistida v3

**Objetivo**: Convertir el proyecto en un entorno ideal para agentes IA.

**Componentes IA-Ready**:
- [ ] Plantillas de prompts mejoradas (templates 25-30)
- [ ] Validadores de contexto automáticos
- [ ] Handoff automation mínimo
- [ ] Documentación sobre interacción limitada con LLMs
- [ ] Matriz de decisiones para EJECUTOR y VALIDADOR
- [ ] Guía de optimización de contexto
- [ ] Nuevas reglas anti-hallucination
- [ ] Estructuras de guardrails extendidas

**Mejoras de Templates**:
- [ ] Template 25: Context Validation Checklist
- [ ] Template 26: AI Agent Performance Metrics
- [ ] Template 27: Hallucination Prevention Protocol
- [ ] Template 28: Code Generation Guardrails
- [ ] Template 29: Automated Test Generation Strategy
- [ ] Template 30: AI-Human Handoff Protocol

**Duración estimada**: 2-4 días

**Criterios de aceptación**:
- ✅ Agentes IA pueden trabajar sin romper arquitectura
- ✅ Guardrails previenen over-engineering
- ✅ Context management controlado

---

### v3.0 - Framework IA-First Controlado

**Objetivo**: Una versión donde humanos y agentes usan el kit como entorno seguro de desarrollo.

**Componentes Finales**:
- [ ] Ejecutor IA versión estable
- [ ] Validador IA versión estable
- [ ] Sistema de rutas de contexto
- [ ] Context snapshots automáticos
- [ ] Checklists automáticas integradas
- [ ] Escenarios de TDD automatizados
- [ ] Auditorías IA integradas (sin invadir código fuente)
- [ ] Modo "project bootstrap" 100% estable

**Límites Explícitos (v3.0 NO es)**:
- ❌ No se convierte en Nest.js
- ❌ No se convierte en FastAPI
- ❌ No se convierte en un framework full stack
- ❌ No adopta DI containers obligatorios
- ❌ No incluye CLI pesada
- ❌ No incluye generadores de código invasivos

**v3.0 = Madurez, NO Complejidad**

**Duración estimada**: 2-3 semanas

**Criterios de aceptación**:
- ✅ Performance testing automatizado
- ✅ Security audit aprobado
- ✅ Load testing con k6
- ✅ Documentación completa
- ✅ Deployment automation
- ✅ IA puede usar el kit sin supervisión constante
- ✅ Kit estable para producción

## Programa de endurecimiento post auditoría (commit 7f0912b)

El commit `7f0912b` incorporó mejoras generales de documentación y guías contextuales. A partir de esa base debemos ejecutar un plan ligero que mantenga el carácter de **starkit agnóstico** del repositorio mientras resolvemos las observaciones de la auditoría más reciente. El objetivo no es completar funcionalidades, sino dejar instrucciones claras para que el consumidor del kit pueda hacerlo.

### Fase 1 – Fundamentos del esqueleto

1. ✅ Documentar en README/dev-docs qué responsabilidades recaen en el consumidor (entrypoint, importación de `crypto`, implementación real de hashing, etc.). → ver `README.md#🧭-post-clone-checklist` y `dev-docs/user-dd/consumer-checklist.md`.
2. ✅ Añadir checklist post-clonado que recuerde revisar dependencias implícitas y definir servicios concretos. → `dev-docs/user-dd/consumer-checklist.md` sirve como lista marcable.
3. ✅ Señalar explícitamente que las clases actuales son ejemplos ilustrativos y deben ser extendidas o reemplazadas. → se advierte en el README y en la checklist.

### Fase 2 – Tooling mínimo y scripts ✅

1. ✅ Ajustar `package.json` para que los comandos apunten a stubs reales (`src/index.ts`, `dist/index.js`, `scripts/seed.ts`), evitando rutas inexistentes. → ver `package.json`.
2. ✅ Proveer instrucciones para conectar linting/formatting y `lint-staged` a los lenguajes que el usuario habilite. → ver `dev-docs/user-dd/tooling-guide.md` y `README.md#🧰-personaliza-scripts-y-linters`.
3. ✅ Decidir si los tests Bash/Python permanecen como ejemplo y documentar cómo activarlos. → ver `dev-docs/user-dd/tooling-guide.md#3-suites-de-pruebas-opcionales` y `README.md#🧪-suites-opcionales-multi-lenguaje`.

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

1. ✅ Checklist publicada en `dev-docs/user-dd/post-adaptation-validation.md` con lint/test/type-check y validaciones de arquitectura.
2. ✅ Preguntas guía incluidas en la misma guía para cubrir importaciones, servicios y hooks.
3. ✅ `dev-docs/task.md` actualizado (TASK-010) para indicar qué artefactos deben tocar los consumidores tras aterrizar el kit.

## Programa de remediación `scripts/setup.sh`

La auditoría detallada en `document/informes_CC/AUDITORIA_SETUP_SH.md` expone nueve hallazgos (uno crítico) que deben resolverse
antes de que un equipo adopte el script interactivo. Para mantener la trazabilidad:

1. Consulta el [plan de ejecución](setup/setup-sh-remediation-plan.md) y decide qué fases aplicarás (Fases A/B y los bloques C3.1/C3.3 ✅ ya viven en main; la observabilidad C3.2 quedó como mejora opcional documentada en `TASK-015`).
2. Registra el avance en `dev-docs/task.md` usando las TASK-011 a TASK-015.
3. Actualiza `.context/project-state.json` una vez que cierres cada fase para que futuros agentes conozcan el estado real del setup.

## Criterios de Admisión de Features

Una feature entra en el roadmap **solo si** responde afirmativamente a estas dos preguntas:

1. **¿Hace al kit más seguro, estable y usable para IA + humanos?**
2. **¿Reduce trabajo real, no hipotético?**

Si la respuesta no es "sí" en ambos casos, **se descarta**.

### Checklist de Evaluación de Features

Antes de agregar cualquier feature, validar:

- [ ] **No aumenta la complejidad innecesariamente** - La feature es simple de entender
- [ ] **Es opt-in si no es crítica** - Puede desactivarse sin romper el core
- [ ] **Está bien documentada** - Incluye ejemplos y guía de uso
- [ ] **Tiene tests** - Cobertura ≥ 80% de la nueva funcionalidad
- [ ] **No acopla el kit a frameworks externos** - Especialmente en domain layer
- [ ] **Resuelve un problema real** - No es especulativa o "por si acaso"
- [ ] **No duplica funcionalidad existente** - No hay overlap con otras features

---

## Reglas Anti-Drift para Agentes IA

Los agentes IA tienen patrones naturales que pueden romper el kit:
- Sobregeneralizar
- Abstraer demasiado
- Crear capas innecesarias
- Introducir "patrones corporativos" que no aplican

### Protocolo de Control para IA

1. **Toda PR de IA debe ser revisada** con checklist VALIDADOR (Template 6)
2. **Ningún agente puede crear templates nuevos** sin pasar por EJECUTOR
3. **Todas las decisiones se documentan** en `dev-docs/task.md` o ADRs
4. **Prohibido archivos con nombres genéricos** o vacíos (`utils.ts`, `helpers.ts`)
5. **Prohibido agregar capas no validadas** por el roadmap oficial
6. **Prohibido abstracciones especulativas** ("por si acaso necesitamos...")

### Guardrails Técnicos

```markdown
PERMITIDO ✅:
- Implementar features del roadmap oficial
- Refactorizar con tests que pasen
- Documentar decisiones en ADRs
- Crear tests exhaustivos
- Optimizar código existente sin cambiar comportamiento

PROHIBIDO ❌:
- Agregar frameworks no aprobados
- Crear abstracciones sin uso concreto
- Modificar arquitectura sin ADR
- Saltarse tests
- Crear dependencias circulares
- Acoplar domain a infrastructure
```

---

## Hitos del Roadmap

| Versión | Hito | Fecha Objetivo | Estado | Duración | Notas |
|---------|------|----------------|--------|----------|-------|
| **v2.1** | Estabilización y Correcciones Críticas | [En progreso] | 🟡 | 1-2 días | Fundación completa, CI/CD, 24 templates |
| **v2.2** | Application Layer + Infra Mínima | [Pendiente] | ⚪ | 2-3 días | Use cases, repositorios, adaptadores |
| **v2.3** | Testing Completo | [Pendiente] | ⚪ | 3-5 días | Unit/Integration/E2E, builders, fixtures |
| **v2.4** | Observabilidad Opcional | [Pendiente] | ⚪ | 2-4 días | Prometheus, Jaeger, k6, Grafana |
| **v2.5** | IA-Ready | [Pendiente] | ⚪ | 2-4 días | Templates 25-30, context management |
| **v3.0** | Framework IA-First | [Pendiente] | ⚪ | 2-3 semanas | Madurez sin complejidad |

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
