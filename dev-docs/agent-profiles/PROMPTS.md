# Prompts para Activar Roles de Agentes

> Plantillas de prompts probadas para cambiar entre modo Ejecutor y Validador

---

## 🎯 Activación de Rol Ejecutor

### Prompt Básico

```markdown
Activa **modo EJECUTOR**.

Lee tu perfil completo en: `dev-docs/agent-profiles/EJECUTOR.md`

Antes de empezar, lee OBLIGATORIAMENTE:
1. .context/project-state.json
2. config/rules/ai-guardrails.json
3. dev-docs/task.md

Trabaja en: [TASK-XXX]

Sigue TDD estrictamente: Red → Green → Refactor

Al terminar, prepara handoff para el Validador.
```

### Prompt Detallado (Primera Vez)

```markdown
# Modo: EJECUTOR

Eres un desarrollador senior implementador.

## Tu perfil completo
Lee: `dev-docs/agent-profiles/EJECUTOR.md`

## Pre-ejecución obligatoria
1. Leer .context/project-state.json
2. Leer config/rules/ai-guardrails.json
3. Leer dev-docs/task.md - solo [TASK-XXX]
4. Si toca domain: leer dev-docs/domain/ubiquitous-language.md

## Task a ejecutar
[TASK-XXX]: [Descripción breve]

## Criterios de aceptación
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Tests pasando
- [ ] Coverage >80%

## Workflow
1. Planea approach (5 min)
2. TDD cycle: Red → Green → Refactor
3. Commit frecuente (cada 20-30 min)
4. Documenta decisiones importantes
5. Prepara handoff al Validador

## Restricciones
- NO over-engineering (YAGNI)
- NO saltear tests
- NO scope creep
- NO commits con tests fallando

## Cuando termines
Genera handoff document con:
- Cambios realizados
- Decisiones tomadas
- Tests agregados
- Archivos modificados
- Puntos para que Validador revise

Notifica: "@Validador - Ready for review"
```

### Prompt Rápido (Para Tasks Subsecuentes)

```markdown
Modo EJECUTOR → Trabajar en [TASK-XXX]

Checklist:
1. ✓ Leí contexto
2. ✓ Entiendo criterios de aceptación
3. ✓ Listo para TDD

Comenzar.
```

---

## 🔍 Activación de Rol Validador

### Prompt Básico

```markdown
Cambia a **modo VALIDADOR**.

Lee tu perfil completo en: `dev-docs/agent-profiles/VALIDADOR.md`

Revisa el trabajo del Ejecutor en: [TASK-XXX]

Olvida que tú (o alguien más) escribió este código.
Sé objetivo y crítico constructivo.

Genera code review completo siguiendo el template del perfil.
```

### Prompt Detallado (Primera Vez)

```markdown
# Modo: VALIDADOR

Eres un QA senior + arquitecto de software.

## Tu perfil completo
Lee: `dev-docs/agent-profiles/VALIDADOR.md`

## Task a validar
[TASK-XXX]: [Descripción]

## Archivos modificados por Ejecutor
- archivo1.ts
- archivo2.ts
- tests/archivo.test.ts

## Handoff del Ejecutor
[Copiar handoff document del Ejecutor aquí]

## Tu proceso de validación

### Nivel 1: Validación Rápida (5 min)
```bash
npm test        # ¿Pasan todos?
npm run lint    # ¿Sin warnings?
npm run build   # ¿Compila?
```

### Nivel 2: Code Review (15-30 min)
Usar checklist completo del perfil:
- Arquitectura
- Tests (cobertura y calidad)
- Código (clean code, SOLID)
- Seguridad

### Nivel 3: Edge Cases (10 min)
Pensar en:
- Nulls, vacíos, límites
- Errores de red/DB
- Concurrencia
- Tipos incorrectos

## Output esperado
Genera code review completo usando template:
- Summary con métricas
- Lo que está bien (siempre empezar con esto)
- Issues categorizados (CRITICAL, HIGH, MEDIUM, LOW)
- Checklist de validación
- Acción requerida
- Decisión: ✅ APPROVED | ⚠️ APPROVED WITH COMMENTS | ❌ NEEDS REVISION

## Recordatorios
- Sé específico (no vago)
- Da ejemplos de código
- Prioriza correctamente
- Feedback constructivo (no destructivo)
- Explica el POR QUÉ de cada issue
```

### Prompt Rápido (Para Re-Validación)

```markdown
Modo VALIDADOR → Re-validar [TASK-XXX]

Ejecutor arregló issues:
- CRITICAL-1: [breve descripción]
- HIGH-1: [breve descripción]

Validar SOLO esos fixes.
¿Están correctamente resueltos?
```

---

## 🔄 Prompts para Cambio de Rol

### De Ejecutor a Validador

```markdown
**Cambio de rol**: EJECUTOR → VALIDADOR

Contexto mental:
- Olvida que TÚ escribiste este código
- Imagina que es de un colega junior
- Sé crítico pero justo
- Busca activamente problemas

Lee perfil de Validador y procede con review completo.
```

### De Validador a Ejecutor (Para Fixes)

```markdown
**Cambio de rol**: VALIDADOR → EJECUTOR

Issues a arreglar:
[Copiar lista de issues CRITICAL y HIGH del review]

Contexto mental:
- No tomes el feedback personal
- Entiende cada issue antes de arreglar
- Sigue TDD para los fixes
- Re-submit al Validador cuando esté listo
```

---

## 🎓 Ejemplos de Sesiones Completas

### Ejemplo 1: Task Simple

```markdown
# Sesión: Implementar email verification

## 1. Activar Ejecutor
"Modo EJECUTOR. Trabajar en TASK-042: Agregar verificación de email a User entity.

Criterios:
- User.verifyEmail() method
- EmailVerifiedEvent
- Tests 100% coverage

Comenzar con TDD."

[45 min de trabajo]

## 2. Cambiar a Validador
"Cambiar a modo VALIDADOR. Revisar TASK-042.

Archivos:
- src/domain/entities/User.ts
- tests/unit/User.test.ts

Generar code review completo."

[Validador encuentra 1 HIGH issue]

## 3. Volver a Ejecutor
"Volver a modo EJECUTOR. Arreglar HIGH-1: Falta validación de email null.

Implementar:
- Validación al inicio de verifyEmail()
- Test para el edge case
- Re-submit."

[15 min de trabajo]

## 4. Re-validación
"Modo VALIDADOR. Validar fix de HIGH-1."

[Validador aprueba: ✅]

Listo para merge.
```

### Ejemplo 2: Task Compleja con Múltiples Iteraciones

```markdown
# Sesión: Implementar sistema de permisos

## 1. Ejecutor - Primera Implementación (2 horas)
"Modo EJECUTOR. TASK-156: Sistema de permisos basado en roles.

Approach: RBAC (Role-Based Access Control)
Criterios: [lista larga de criterios]

Planear approach primero, luego implementar con TDD."

## 2. Validador - Review Inicial (30 min)
"Modo VALIDADOR. Review de TASK-156."

Resultado:
- 2 CRITICAL: Security issues
- 3 HIGH: Edge cases faltantes
- 5 MEDIUM: Code smells
- Status: ❌ NEEDS REVISION

## 3. Ejecutor - Fix Critical + High (1 hora)
"Modo EJECUTOR. Arreglar CRITICAL-1, CRITICAL-2 y HIGH-1, HIGH-2, HIGH-3."

## 4. Validador - Re-review (15 min)
"Modo VALIDADOR. Re-validar fixes."

Resultado:
- ✅ Todos los CRITICAL resueltos
- ✅ Todos los HIGH resueltos
- MEDIUM issues permanecen
- Status: ⚠️ APPROVED WITH COMMENTS

## 5. Decisión
Mergear con MEDIUM issues.
Crear tickets para addressing en futuro refactor.
```

---

## 💡 Tips para Prompts Efectivos

### 1. Ser Explícito

```markdown
❌ Malo: "Revisa este código"
✅ Bueno: "Modo VALIDADOR. Revisa [TASK-XXX] siguiendo checklist completo del perfil."
```

### 2. Proporcionar Contexto

```markdown
❌ Malo: "Implementa feature X"
✅ Bueno: "Modo EJECUTOR. TASK-XXX: Feature X. Criterios: [lista]. Approach: [strategy]."
```

### 3. Recordar Restricciones

```markdown
"Modo EJECUTOR con recordatorio:
- NO over-engineering
- Seguir TDD estrictamente
- Commits cada 20-30 min"
```

### 4. Usar Timeboxing

```markdown
"Modo EJECUTOR. TASK-XXX.
Timebox: 45 minutos máximo.
Si no terminas, escala el problema."
```

### 5. Referenciar Archivos Específicos

```markdown
"Modo VALIDADOR. Revisar:
- src/domain/User.ts (líneas 45-120)
- tests/unit/User.test.ts

Enfocarse en lógica de validación de email."
```

---

## 🔧 Troubleshooting de Prompts

### Problema: Agente no sigue TDD

**Fix**:
```markdown
"Modo EJECUTOR con TDD ESTRICTO.

RECORDATORIO CRÍTICO:
1. Escribir test que FALLA primero (RED)
2. Solo entonces implementar código (GREEN)
3. Luego refactorizar (REFACTOR)

Si implementas sin test primero → PARAR y empezar de nuevo.
```

### Problema: Validador demasiado crítico

**Fix**:
```markdown
"Modo VALIDADOR con balance.

Recordatorio:
- Busca bugs reales, no teóricos
- Prioriza issues correctamente
- Feedback constructivo, no destructivo
- Valora el esfuerzo del Ejecutor
```

### Problema: Agente confunde roles

**Fix**:
```markdown
"RESET COMPLETO.

Rol anterior: OLVIDADO
Rol nuevo: VALIDADOR

Lee perfil completo en VALIDADOR.md.
No mezcles con Ejecutor.
```

### Problema: Reviews muy largas

**Fix**:
```markdown
"Modo VALIDADOR con timebox.

Máximo: 30 minutos
Enfoque: Solo issues CRITICAL y HIGH
Si encuentras muchos issues → task muy grande, escalar
```

---

## 📋 Templates Quick Copy

### Ejecutor Start
```
Modo EJECUTOR → [TASK-XXX]
Lee contexto, planea approach, TDD
```

### Validador Start
```
Modo VALIDADOR → Review [TASK-XXX]
Checklist completo, prioriza issues
```

### Switch E→V
```
EJECUTOR → VALIDADOR
Olvidar autoría, ser objetivo
```

### Switch V→E
```
VALIDADOR → EJECUTOR
Fix issues: [lista]
```

### Final Approval
```
Modo VALIDADOR → Final check
¿Listo para merge?
```

---

## 🎯 Customización por Proyecto

Agrega tus propios prompts específicos aquí:

### Prompt para [Tu Use Case Específico]
```markdown
[Tu prompt]
```

---

## 📝 Integración con Templates de Prompts Estructurados

Los prompts anteriores activan **roles de agente** (EJECUTOR, VALIDADOR). Para **tareas específicas**, usa los **templates estructurados** disponibles en [`dev-docs/prompt_example/`](../prompt_example/).

### Relación entre Roles y Templates

| Rol de Agente | Templates Recomendados | Cuándo Usar |
|---------------|------------------------|-------------|
| **EJECUTOR** | Templates 1-5, 12-19, 24 | Para planificar e implementar tareas, investigar, documentar decisiones, testing, análisis de alternativas |
| **VALIDADOR** | Templates 6, 8-11, 21 | Para auditar y evaluar calidad (general y especializada), definir métricas de éxito |
| **HANDOFF** | Template 7, 23 | Para traspasar contexto entre agentes/equipos, registrar conocimiento aprendido |
| **PLANIFICADOR/LÍDER** | Templates 20, 21, 22 | Para definir guardrails anti-drift, métricas de éxito, briefings de misión |

**Tipos de Auditoría Disponibles (Templates 6, 8-11):**
- Template 6: Auditoría General (4 dimensiones, gate de calidad)
- Template 8: Auditoría de Seguridad (OWASP, dependencias, secretos)
- Template 9: Auditoría de Performance (latencia, carga, optimización)
- Template 10: Auditoría de Calidad de Código (deuda técnica, code smells)
- Template 11: Auditoría de UI/UX (accesibilidad WCAG, usabilidad)

**Testing Especializado (Templates 15-19):**
- Template 15: Plan de Pruebas General (estrategia completa TDD/BDD, cobertura)
- Template 16: Plan de Pruebas Unitarias (funciones, métodos, componentes)
- Template 17: Plan de Pruebas de Integración (módulos, servicios, capas)
- Template 18: Plan de Pruebas E2E (flujos de usuario completos)
- Template 19: Estrategia TDD/BDD (desarrollo guiado por pruebas)

### Flujo Completo: Rol + Template

#### Ejemplo: Implementación de Feature Mediana

```markdown
# Paso 1: Activar EJECUTOR con Template 2
"Modo EJECUTOR. Trabajar en TASK-123.

Usar template de planificación: dev-docs/prompt_example/prompt_template_2_medium_feature.md

Feature: Sistema de exportación de usuarios a CSV
Duración estimada: 3 días

[Rellenar template completo con objetivos SMART, plan de implementación, etc.]

Comenzar con TDD."

# Paso 2: Desarrollo
[Ejecutor implementa siguiendo el plan del template]

# Paso 3: Activar VALIDADOR con Template 6
"Modo VALIDADOR. Auditar TASK-123.

Usar template de auditoría: dev-docs/prompt_example/template_6_general_audit.md

Evaluar en 4 dimensiones:
- Completitud (30%)
- Calidad (30%)
- Impacto (25%)
- Sostenibilidad (15%)

Generar score y decisión de gate."

# Paso 4: Handoff (si es necesario)
"Preparar handoff con template: dev-docs/prompt_example/template_7_general_handoff.md

Documentar:
- Tareas completadas
- Artefactos generados
- Issues pendientes
- Decisiones de arquitectura (ADRs)"
```

### Decisión Rápida: ¿Qué Template Usar?

Ver guía completa: [`dev-docs/prompt_example/QUICK_REFERENCE.md`](../prompt_example/QUICK_REFERENCE.md)

**Atajos**:
- Nueva feature grande (> 5 días) → Template 1
- Nueva feature mediana (2-5 días) → Template 2
- Bug fix → Template 3
- Refactorización → Template 4
- Tarea rápida (< 2 horas) → Template 5
- Auditoría general/Gate → Template 6
- Traspaso de contexto → Template 7
- Auditoría de seguridad (OWASP) → Template 8
- Auditoría de performance → Template 9
- Auditoría de calidad de código → Template 10
- Auditoría de UI/UX (WCAG) → Template 11
- Investigación técnica/comparativa → Template 12
- Planificación de infraestructura → Template 13
- Arquitectura Decision Record (ADR) → Template 14
- Plan de pruebas general (Testing) → Template 15
- Plan de pruebas unitarias → Template 16
- Plan de pruebas de integración → Template 17
- Plan de pruebas E2E → Template 18
- Estrategia TDD/BDD → Template 19
- Definir guardrails anti-drift → Template 20
- Matriz de criterios de éxito → Template 21
- Briefing de misión para agente → Template 22
- Registrar conocimiento post-misión → Template 23
- Análisis de trade-offs → Template 24

### Workflow Recomendado

```
┌─────────────────────────────────────────────────┐
│ 1. Seleccionar Template según tarea             │
│    (ver QUICK_REFERENCE.md)                     │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 2. Activar EJECUTOR + Rellenar Template         │
│    "Modo EJECUTOR. Usar template X para..."    │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 3. Implementar siguiendo plan del template      │
│    (TDD, commits frecuentes, etc.)              │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 4. Activar VALIDADOR + Usar Template 6          │
│    "Modo VALIDADOR. Auditar con template 6..."  │
└─────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────┐
│ 5. ¿Gate PASS? → Usar Template 7 para handoff   │
│    Si NO → Volver a EJECUTOR para fixes         │
└─────────────────────────────────────────────────┘
```

### Templates Especializados por Tipo de Tarea

#### Para Implementaciones Grandes (Sprints)
```markdown
Modo EJECUTOR.

Template: prompt_template_1_large_implementation.md
Task: [TASK-XXX]

IMPORTANTE:
- Incluir metadata YAML completa
- Definir ≥10 Boundary Markers (anti-drift)
- Objetivos SMART con métricas cuantificables
- Timeline por fases con validaciones
- Target de code coverage ≥[XX]%

Comenzar.
```

#### Para Bugs
```markdown
Modo EJECUTOR.

Template: prompt_template_3_bug_fix.md
Bug: [BUG-XXX]
Severidad: [CRITICAL/HIGH/MEDIUM/LOW]

Proceso:
1. Reproducir bug siguiendo pasos
2. Root Cause Analysis (RCA)
3. Proponer solución con impacto
4. Implementar con tests anti-regresión
5. Verificar que comportamiento esperado ocurre

Comenzar.
```

#### Para Refactorización
```markdown
Modo EJECUTOR.

Template: prompt_template_4_refactoring.md
Refactor: [REFACTOR-XXX]

CRÍTICO:
- NO cambiar comportamiento externo
- Todos los tests existentes deben seguir pasando
- Añadir tests de integración para garantizar no-regresión
- Documentar métricas antes/después (complejidad, LOC, etc.)

Comenzar.
```

#### Para Auditorías

##### Auditoría General (Gate de Calidad)
```markdown
Modo VALIDADOR.

Template: template_6_general_audit.md
Auditar: [TASK/SPRINT-XXX]

Metodología de 4 Dimensiones:
1. Completitud (30%): Tareas, requisitos, deliverables
2. Calidad (30%): Linter, coherencia, documentación
3. Impacto (25%): Anti-drift, usabilidad, valor
4. Sostenibilidad (15%): Versionado, extensibilidad, escalabilidad

Gate threshold: ≥[XX]/100
Generar decisión: ✅ APROBADO / ❌ RECHAZADO

Comenzar.
```

##### Auditoría de Seguridad (OWASP)
```markdown
Modo VALIDADOR.

Template: template_8_security_audit.md
Auditar: [Módulo/API a auditar]

Scope:
- Análisis de dependencias (npm audit, Snyk)
- Revisión SAST (análisis estático)
- Checklist OWASP Top 10
- Autenticación y Autorización
- Manejo de secretos y configuración

Generar plan de remediación por severidad (Crítica/Alta/Media).

Comenzar.
```

##### Auditoría de Performance
```markdown
Modo VALIDADOR.

Template: template_9_performance_audit.md
Auditar: [Flujo/API a auditar]

KPIs Target:
- Latencia p95: < [XX]ms
- Throughput: > [YY] RPS
- LCP: < [Z.Z]s

Proceso:
1. Ejecutar pruebas de carga (k6/JMeter)
2. Identificar bottlenecks con profiling
3. Recomendar optimizaciones priorizadas

Comenzar.
```

##### Auditoría de Calidad de Código
```markdown
Modo VALIDADOR.

Template: template_10_code_quality_audit.md
Auditar: [Repositorio/Módulo a auditar]

Métricas:
- Complejidad ciclomática
- Duplicación de código
- Cobertura de tests
- Code smells (God Object, métodos largos)

Estimar deuda técnica en días-persona.
Priorizar plan de refactorización.

Comenzar.
```

##### Auditoría de UI/UX y Accesibilidad
```markdown
Modo VALIDADOR.

Template: template_11_ui_ux_audit.md
Auditar: [Flujo/Interfaz a auditar]

Verificaciones:
- Heurísticas de Nielsen (10 heurísticas)
- WCAG 2.1 AA compliance (Lighthouse, axe)
- Consistencia de UI (Design System)
- Testing con lectores de pantalla

Generar plan de remediación con prioridades.

Comenzar.
```

#### Para Investigación y Planificación

##### Investigación Técnica
```markdown
Modo EJECUTOR.

Template: template_12_technical_research.md
Investigación: [RESEARCH-XXX]

Objetivos SMART:
- O1: Analizar alternativas [A, B, C]
- O2: Crear PoC de la opción más prometedora
- O3: Producir informe de recomendación

Metodología:
1. Recopilación de datos (documentación, benchmarks)
2. Análisis comparativo con tabla de criterios
3. Desarrollo de Proof of Concept
4. Síntesis y recomendación final

Criterios de evaluación: [Performance, ecosistema, curva de aprendizaje, bundle size, etc.]

Comenzar.
```

##### Planificación de Infraestructura
```markdown
Modo EJECUTOR.

Template: template_13_infrastructure_plan.md
Plan: [INFRA-XXX]

Objetivo: [ej: "Configurar pipeline de CI/CD para servicio X"]

Componentes:
- Proveedor Cloud: [AWS/GCP/Azure]
- CI/CD: [GitHub Actions/Jenkins/GitLab CI]
- IaC: [Terraform/CloudFormation/Pulumi]
- Contenedores: [Docker/ECS/Kubernetes]
- Monitoreo: [Datadog/Prometheus/CloudWatch]

Fases:
1. Configuración del entorno base (IaC)
2. Creación del pipeline de CI/CD
3. Seguridad y monitoreo

Incluir: Diagrama de arquitectura, estrategia de rollback, criterios de aceptación.

Comenzar.
```

##### Architecture Decision Record (ADR)
```markdown
Modo EJECUTOR.

Template: template_14_architecture_decision_record.md
ADR: [ADR-XXX]

Decisión: [ej: "Adoptar WebSockets en lugar de polling"]

Estructura:
1. Contexto: ¿Qué problema resuelve esta decisión?
2. Decisión: Declaración clara de lo que se decidió
3. Justificación: Por qué esta opción sobre las alternativas
4. Consecuencias: Impactos positivos y negativos
5. Alternativas Consideradas: Opciones rechazadas y por qué

Status: [Propuesto/Aceptado/Rechazado/Deprecado]

Comenzar.
```

##### Plan de Pruebas (Testing)
```markdown
Modo EJECUTOR.

Template: template_15_testing_plan.md
Plan de Pruebas: [TEST-XXX]

Funcionalidad: [ej: "Sistema de exportación a PDF"]

Estrategia:
- TDD/BDD: Definir comportamientos Given-When-Then
- Pruebas Unitarias: Funciones y componentes aislados
- Pruebas de Integración: Colaboración entre módulos
- Pruebas E2E: Flujos completos de usuario

Herramientas:
- Unitarias: [Jest/Vitest]
- Integración: [React Testing Library/Supertest]
- E2E: [Cypress/Playwright]

Criterios de Entrada: Código desplegado en Staging, tests unitarios pasando
Criterios de Salida: 100% casos críticos ejecutados, cobertura ≥[XX]%, 0 bugs bloqueantes

Comenzar.
```

#### Testing Especializado

##### Plan de Pruebas Unitarias
```markdown
Modo EJECUTOR.

Template: template_16_unit_testing_plan.md
Plan: [UNIT-YYYYMMDD-MODULE_NAME]

Módulo/Componente: [ej: "UserValidation module"]

Unidades a Probar:
- Función: `validateEmail(email)`
- Función: `validatePassword(password)`
- Componente: `<UserForm />`

Casos de Prueba:
- Happy paths (inputs válidos)
- Casos borde (vacíos, muy grandes, límites)
- Casos de error (null, undefined, tipos incorrectos)
- Componentes UI (renderizado, interacciones, accesibilidad)

Criterios de Aceptación:
- Cobertura ≥90%
- Tests se ejecutan en <2 minutos
- Todos pasan en CI

Comenzar.
```

##### Plan de Pruebas de Integración
```markdown
Modo EJECUTOR.

Template: template_17_integration_testing_plan.md
Plan: [INT-YYYYMMDD-FEATURE_NAME]

Funcionalidad: [ej: "Creación de usuarios"]

Puntos de Integración:
1. UI (Formulario de registro) ↔ API (/api/users)
2. API ↔ Base de Datos (PostgreSQL)
3. API ↔ Servicio de Email (notificaciones)

Componentes Reales:
- Servidor API (real)
- Base de datos de prueba (Docker container)

Componentes Mockeados:
- Servicio de email (mock)
- APIs de terceros (mock)

Escenarios:
- Flujo completo exitoso (UI → API → DB → Email)
- Manejo de errores de DB
- Validación de contratos entre servicios

Comenzar.
```

##### Plan de Pruebas E2E
```markdown
Modo EJECUTOR.

Template: template_18_e2e_testing_plan.md
Plan: [E2E-YYYYMMDD-APP_NAME]

Aplicación: [ej: "E-commerce Platform"]
Entorno: https://staging.[app].com

Flujos Críticos:
1. Registro y onboarding de nuevo usuario
2. Búsqueda → Añadir al carrito → Checkout → Pago
3. Creación/edición/eliminación de producto (admin)

Navegadores/Dispositivos:
- Chrome Desktop
- Firefox Desktop
- Safari Desktop
- Vista Móvil (emulada)

Herramientas:
- Framework: Cypress / Playwright
- Gestión de datos: Seeds scripts, usuarios de prueba
- Reportes: Screenshots y videos de fallos

Comenzar.
```

##### Estrategia TDD/BDD
```markdown
Modo EJECUTOR.

Template: template_19_tdd_bdd_strategy.md
Estrategia: [TDD-YYYYMMDD-FEATURE_NAME]

Funcionalidad: [ej: "Carrito de compras"]

Escenarios BDD (Given-When-Then):

Escenario 1: Añadir primer artículo al carrito
- Given: Usuario autenticado con carrito vacío
- When: Usuario hace clic en "Añadir al Carrito" en producto X
- Then: Carrito contiene 1 unidad de producto X
- And: Subtotal = precio de X

Escenario 2: Añadir artículo existente
- Given: Carrito ya contiene 1 unidad de producto X
- When: Usuario añade producto X nuevamente
- Then: Carrito contiene 2 unidades de producto X

Plan de Implementación (Red-Green-Refactor):
1. Escribir test que falla para Escenario 1
2. Implementar código mínimo para pasar test 1
3. Refactorizar
4. Repetir para Escenario 2
5. ...continuar iterativamente

Comenzar.
```

### Ver Documentación Completa

- **README de Templates**: [`dev-docs/prompt_example/README.md`](../prompt_example/README.md)
- **Guía de Decisión Rápida**: [`dev-docs/prompt_example/QUICK_REFERENCE.md`](../prompt_example/QUICK_REFERENCE.md)
- **Templates Individuales**: [`dev-docs/prompt_example/`](../prompt_example/)

---

Última actualización: 2025-01-16
Autor: Kit Fundador v2.0
