# 🚀 Guía Rápida de Selección de Templates

**¿Qué template debo usar?** → Usa esta guía de decisión rápida.

---

## 🔍 Árbol de Decisión

```
┌─ ¿Qué tipo de trabajo vas a hacer? ─┐
│                                      │
├─ IMPLEMENTAR algo nuevo              │
│  │                                   │
│  ├─ ¿Cuánto tiempo tomará?           │
│  │  │                                │
│  │  ├─ < 2 horas                     │
│  │  │  └─► Template 5: Daily Task    │
│  │  │                                │
│  │  ├─ 2-5 días                      │
│  │  │  └─► Template 2: Medium Feature│
│  │  │                                │
│  │  └─ > 5 días o Sprint completo    │
│  │     └─► Template 1: Large Impl    │
│  │                                   │
├─ CORREGIR un bug                     │
│  └─► Template 3: Bug Fix             │
│                                      │
├─ REFACTORIZAR código existente       │
│  └─► Template 4: Refactoring         │
│                                      │
├─ AUDITAR trabajo completado          │
│  │                                   │
│  ├─ ¿Qué tipo de auditoría?          │
│  │  │                                │
│  │  ├─ General (gate de calidad)    │
│  │  │  └─► Template 6: General Audit│
│  │  │                                │
│  │  ├─ Seguridad (OWASP, vulns)     │
│  │  │  └─► Template 8: Security     │
│  │  │                                │
│  │  ├─ Performance (latencia, carga)│
│  │  │  └─► Template 9: Performance  │
│  │  │                                │
│  │  ├─ Calidad de Código (deuda)    │
│  │  │  └─► Template 10: Code Quality│
│  │  │                                │
│  │  └─ UI/UX (accesibilidad, WCAG)  │
│  │     └─► Template 11: UI/UX       │
│  │                                   │
├─ INVESTIGAR antes de decidir         │
│  └─► Template 12: Technical Research│
│                                      │
├─ PLANIFICAR infraestructura          │
│  └─► Template 13: Infrastructure    │
│                                      │
├─ DOCUMENTAR decisión de arquitectura │
│  └─► Template 14: ADR                │
│                                      │
├─ PLANIFICAR estrategia de testing    │
│  │                                   │
│  ├─ ¿Qué tipo de testing?            │
│  │  │                                │
│  │  ├─ General (toda la estrategia) │
│  │  │  └─► Template 15: Testing Plan│
│  │  │                                │
│  │  ├─ Pruebas Unitarias             │
│  │  │  └─► Template 16: Unit Tests  │
│  │  │                                │
│  │  ├─ Pruebas de Integración        │
│  │  │  └─► Template 17: Integration │
│  │  │                                │
│  │  ├─ Pruebas E2E                   │
│  │  │  └─► Template 18: E2E Tests   │
│  │  │                                │
│  │  └─ Estrategia TDD/BDD            │
│  │     └─► Template 19: TDD/BDD     │
│  │                                   │
├─ DEFINIR guardrails y control        │
│  │                                   │
│  ├─ Guardrails anti-drift           │
│  │  └─► Template 20: Anti-Drift     │
│  │                                   │
│  ├─ Métricas y KPIs de éxito        │
│  │  └─► Template 21: Success Matrix │
│  │                                   │
│  └─ Briefing de misión              │
│     └─► Template 22: Mission Brief  │
│                                      │
├─ ANALIZAR alternativas técnicas      │
│  └─► Template 24: Trade-off Analysis│
│                                      │
├─ REGISTRAR conocimiento aprendido    │
│  └─► Template 23: Knowledge Record  │
│                                      │
└─ TRASPASAR contexto a otro agente    │
   └─► Template 7: Handoff             │
```

---

## 📊 Tabla Comparativa Rápida

| Template | Duración | Complejidad | Cuándo Usar | Score Gate |
|----------|----------|-------------|-------------|------------|
| **1: Large Implementation** | > 5 días | Alta | Sprints, arquitecturas nuevas, módulos complejos | Sí (0-100) |
| **2: Medium Feature** | 2-5 días | Media | Features de tamaño medio, endpoints, componentes | No |
| **3: Bug Fix** | < 1 día | Baja-Media | Correcciones, hotfixes, RCA | No |
| **4: Refactoring** | 1-3 días | Media | Reducción de deuda técnica, optimización | No |
| **5: Daily Task** | < 2 horas | Baja | Cambios triviales, ajustes menores | No |
| **6: General Audit** | Variable | N/A | Gate de calidad general (4 dimensiones) | Sí (Gate) |
| **7: Handoff** | Variable | N/A | Cambio de contexto, fin de sprint, traspaso | No |
| **8: Security Audit** | 1-3 días | N/A | Auditoría OWASP, vulnerabilidades, secretos | Sí (Riesgo) |
| **9: Performance Audit** | 1-3 días | N/A | Latencia, carga, bottlenecks, optimización | Sí (KPIs) |
| **10: Code Quality Audit** | 1-2 días | N/A | Deuda técnica, code smells, refactorización | Sí (Índice) |
| **11: UI/UX Audit** | 1-2 días | N/A | Accesibilidad WCAG, usabilidad, consistencia | Sí (WCAG) |
| **12: Technical Research** | Variable | Media | Investigación técnica, análisis de alternativas, PoC | No |
| **13: Infrastructure Plan** | 2-5 días | Alta | CI/CD, DevOps, planificación de infraestructura | No |
| **14: ADR** | < 1 día | Baja | Documentar decisiones de arquitectura | No |
| **15: Testing Plan** | 1-3 días | Media | Estrategia de testing general (TDD/BDD, unitarias, E2E) | No |
| **16: Unit Testing Plan** | < 1 día | Baja-Media | Plan de pruebas unitarias de funciones/componentes | No |
| **17: Integration Testing Plan** | 1-2 días | Media | Plan de pruebas de integración entre módulos/servicios | No |
| **18: E2E Testing Plan** | 1-3 días | Media | Plan de pruebas E2E de flujos de usuario completos | No |
| **19: TDD/BDD Strategy** | Variable | Media | Estrategia de desarrollo guiado por pruebas | No |
| **20: Anti-Drift Guardrails** | Variable | N/A | Definir límites estrictos y mecanismos anti-desviación | Sí (Éxito/Fallo) |
| **21: Success Criteria Matrix** | Variable | N/A | Definir métricas y KPIs cuantificables (4 dimensiones) | Sí (Score) |
| **22: Agent Mission Briefing** | Variable | N/A | Asignar tareas formalmente a agentes con directiva clara | No |
| **23: Knowledge Index Record** | < 1 día | Baja | Capturar aprendizajes y conocimiento post-misión | No |
| **24: Trade-off Analysis** | 1-2 días | Media | Comparar alternativas técnicas con criterios ponderados | Sí (Score) |

---

## 🎯 Por Tipo de Tarea

### 🆕 Nuevas Funcionalidades

| Descripción | Template |
|-------------|----------|
| "Crear sistema de autenticación completo con JWT, refresh tokens y MFA" | 1: Large Implementation |
| "Añadir página de perfil de usuario con edición" | 2: Medium Feature |
| "Cambiar el texto del botón de 'Submit' a 'Register'" | 5: Daily Task |

### 🐛 Correcciones

| Descripción | Template |
|-------------|----------|
| "Solucionar error 500 al actualizar perfil sin foto (análisis de causa raíz)" | 3: Bug Fix |
| "Corregir typo en mensaje de validación" | 5: Daily Task |

### 🔧 Refactorización

| Descripción | Template |
|-------------|----------|
| "Refactorizar AuthService para reducir complejidad ciclomática de 25 a 10" | 4: Refactoring |
| "Renombrar variable `usrData` a `userData`" | 5: Daily Task |

### ✅ Evaluación y Auditorías

| Descripción | Template |
|-------------|----------|
| "Auditar sprint de implementación antes de merge a main" | 6: General Audit |
| "Evaluar calidad de PR antes de aprobar" | 6: General Audit |
| "Auditar seguridad del módulo de autenticación contra OWASP Top 10" | 8: Security Audit |
| "Analizar vulnerabilidades en dependencias antes de release" | 8: Security Audit |
| "Evaluar performance del flujo de checkout bajo carga de 1000 usuarios" | 9: Performance Audit |
| "Identificar cuellos de botella en API de búsqueda" | 9: Performance Audit |
| "Auditar calidad de código y deuda técnica del módulo de billing" | 10: Code Quality Audit |
| "Evaluar mantenibilidad y code smells del repositorio" | 10: Code Quality Audit |
| "Auditar accesibilidad del flujo de registro para WCAG 2.1 AA" | 11: UI/UX Audit |
| "Evaluar usabilidad del dashboard con heurísticas de Nielsen" | 11: UI/UX Audit |

### 🔄 Traspasos

| Descripción | Template |
|-------------|----------|
| "Documentar estado actual antes de cambiar de agente/chat" | 7: Handoff |
| "Traspasar contexto del backend al frontend team" | 7: Handoff |

### 🔬 Investigación y Planificación

| Descripción | Template |
|-------------|----------|
| "Investigar librerías de estado para React (Redux vs Zustand vs Jotai)" | 12: Technical Research |
| "Analizar viabilidad de migrar a microservicios" | 12: Technical Research |
| "Comparar proveedores cloud (AWS vs GCP vs Azure)" | 12: Technical Research |
| "Configurar pipeline de CI/CD para el servicio api-gateway" | 13: Infrastructure Plan |
| "Crear entorno de staging en AWS con Terraform" | 13: Infrastructure Plan |
| "Implementar monitoreo con Prometheus y Grafana" | 13: Infrastructure Plan |
| "Documentar decisión de usar WebSockets en lugar de polling" | 14: ADR |
| "Registrar elección de Auth0 como proveedor de identidad" | 14: ADR |
| "ADR sobre migración de monolito a microservicios" | 14: ADR |
| "Plan de pruebas para funcionalidad de exportación a PDF" | 15: Testing Plan |
| "Estrategia de testing para migración a React 19" | 15: Testing Plan |
| "Definir casos de prueba E2E para flujo de checkout" | 15: Testing Plan |

### 🧪 Testing Especializado

| Descripción | Template |
|-------------|----------|
| "Plan de pruebas unitarias para el módulo de validación" | 16: Unit Testing Plan |
| "Casos de prueba para el componente UserProfile" | 16: Unit Testing Plan |
| "Tests unitarios para la clase ShoppingCart con cobertura >90%" | 16: Unit Testing Plan |
| "Pruebas de integración entre frontend y API REST" | 17: Integration Testing Plan |
| "Integración de microservicios con message queue (RabbitMQ)" | 17: Integration Testing Plan |
| "Tests de integración para capa de datos con PostgreSQL" | 17: Integration Testing Plan |
| "Flujo E2E de registro y onboarding de usuario" | 18: E2E Testing Plan |
| "Proceso completo de checkout en e-commerce (Cypress)" | 18: E2E Testing Plan |
| "Flujo de creación, edición y eliminación de proyectos" | 18: E2E Testing Plan |
| "Estrategia TDD para implementar carrito de compras" | 19: TDD/BDD Strategy |
| "BDD scenarios para sistema de notificaciones push" | 19: TDD/BDD Strategy |
| "Desarrollo guiado por tests para módulo de autenticación" | 19: TDD/BDD Strategy |

### 🎯 Meta-Organización y Control

| Descripción | Template |
|-------------|----------|
| "Definir guardrails estrictos para implementación crítica de endpoint POST /api/orders" | 20: Anti-Drift Guardrails |
| "Establecer límites y verificación de evidencia para migración de base de datos" | 20: Anti-Drift Guardrails |
| "Crear marco de control anti-drift para refactor de sistema de pagos" | 20: Anti-Drift Guardrails |
| "Definir KPIs y métricas para sprint de optimización de performance" | 21: Success Criteria Matrix |
| "Matriz de criterios de éxito para release de versión 2.0" | 21: Success Criteria Matrix |
| "Scoring cuantificable para proyecto de migración a React 18" | 21: Success Criteria Matrix |
| "Briefing formal para agente de refactor de módulo LegacyUserService" | 22: Agent Mission Briefing |
| "Asignación de misión para implementación de sistema de caché distribuido" | 22: Agent Mission Briefing |
| "Directiva clara para tarea de migración de autenticación a OAuth 2.0" | 22: Agent Mission Briefing |
| "Documentar aprendizajes y patrones de migración a Node.js v20" | 23: Knowledge Index Record |
| "Registrar patrones y anti-patrones descubiertos en implementación de WebSockets" | 23: Knowledge Index Record |
| "Capturar conocimiento de resolución de issue crítico de memoria" | 23: Knowledge Index Record |
| "Comparar frameworks de CSS (Tailwind vs Styled Components vs actual)" | 24: Trade-off Analysis |
| "Evaluar alternativas de base de datos (PostgreSQL vs MongoDB vs DynamoDB)" | 24: Trade-off Analysis |
| "Análisis ponderado de opciones de deployment (Vercel vs AWS vs Railway)" | 24: Trade-off Analysis |

---

## 💡 Reglas Prácticas

### Regla 1: **Duración determina complejidad**
- < 2 horas → Template 5
- 2 horas - 1 día → Template 3 o 5
- 1-5 días → Template 2 o 4
- > 5 días → Template 1

### Regla 2: **Si necesitas scoring → Template 1 o 6**
- Template 1: Incluye scoring inicial (EVALUATION_SCORE)
- Template 6: Scoring final de auditoría (Gate de aprobación)

### Regla 3: **Si cambias comportamiento → Template según tamaño**
- Nueva feature → 1, 2 o 5 según duración
- Bug fix → 3
- Refactor (sin cambiar comportamiento) → 4

### Regla 4: **Si terminas contexto → Template 7**
- Fin de sprint
- Cambio de agente IA
- Handoff a otro equipo
- Pausa prolongada en el proyecto

### Regla 5: **Si evalúas calidad → Template 6**
- Pre-merge a main
- Gate de release
- Evaluación post-sprint

---

## 🔗 Flujos de Trabajo Típicos

### Flujo 1: Sprint Completo

```
Template 1 (Large Impl) → Desarrollo → Template 6 (Audit) → Gate PASS? → Template 7 (Handoff)
```

### Flujo 2: Feature de Producto

```
Template 2 (Medium Feature) → Desarrollo → Template 6 (Audit) → Merge
```

### Flujo 3: Hotfix de Producción

```
Template 3 (Bug Fix) → Fix → Tests → Merge → Deploy
```

### Flujo 4: Refactorización Técnica

```
Template 4 (Refactoring) → Cambios → Tests (anti-regresión) → Template 6 (Audit) → Merge
```

### Flujo 5: Tarea Trivial

```
Template 5 (Daily Task) → Cambio → Merge
```

---

## 📝 Ejemplos Rápidos

### Ejemplo 1: "Necesito implementar un sistema de notificaciones por email y SMS"

**Análisis**:
- Duración estimada: 7 días
- Complejidad: Alta (integración con servicios externos, múltiples canales)
- Tipo: Nueva funcionalidad

**Template recomendado**: `prompt_template_1_large_implementation.md`

---

### Ejemplo 2: "Hay un bug donde los emails con + en el nombre fallan la validación"

**Análisis**:
- Duración estimada: 2 horas
- Complejidad: Baja
- Tipo: Bug fix

**Template recomendado**: `prompt_template_3_bug_fix.md`

---

### Ejemplo 3: "El UserService tiene 500 líneas y hace demasiadas cosas"

**Análisis**:
- Duración estimada: 2-3 días
- Complejidad: Media
- Tipo: Refactorización (sin cambiar comportamiento)

**Template recomendado**: `prompt_template_4_refactoring.md`

---

### Ejemplo 4: "Cambiar el timeout de la API de 5s a 15s"

**Análisis**:
- Duración estimada: 15 minutos
- Complejidad: Muy baja
- Tipo: Ajuste de configuración

**Template recomendado**: `prompt_template_5_daily_task.md`

---

### Ejemplo 5: "Evaluar si el sprint está listo para producción"

**Análisis**:
- Tipo: Auditoría/Gate de calidad
- Necesita scoring y decisión PASS/FAIL

**Template recomendado**: `template_6_general_audit.md`

---

### Ejemplo 6: "Voy a cambiar de chat/agente y necesito documentar el estado actual"

**Análisis**:
- Tipo: Traspaso de contexto
- Necesita documentar tareas completadas, issues pendientes, ADRs

**Template recomendado**: `template_7_general_handoff.md`

---

## ⚡ Atajos de Memoria

**"¿Qué hago?"**
- Nueva feature grande → 1
- Nueva feature mediana → 2
- Bug → 3
- Refactor → 4
- Tarea rápida → 5
- Auditoría general → 6
- Traspaso → 7
- Auditoría de seguridad → 8
- Auditoría de performance → 9
- Auditoría de calidad de código → 10
- Auditoría de UI/UX → 11
- Investigar/comparar tecnologías → 12
- Planificar infraestructura → 13
- Documentar decisión (ADR) → 14
- Planificar testing general → 15
- Plan de pruebas unitarias → 16
- Plan de pruebas de integración → 17
- Plan de pruebas E2E → 18
- Estrategia TDD/BDD → 19
- Definir guardrails anti-drift → 20
- Matriz de criterios de éxito → 21
- Briefing de misión para agente → 22
- Registrar conocimiento post-misión → 23
- Análisis de trade-offs → 24

**"¿Cuánto tiempo?"**
- < 2h → 5
- 2h-1d → 3, 5, 16, 23
- 1-5d → 2, 4, 8, 9, 10, 11, 15, 17, 18, 24
- > 5d → 1
- Variable → 12, 13, 19, 20, 21, 22

**"¿Necesito gate?"**
- Sí → 6, 8, 9, 10, 11, 20, 21 (auditorías y scoring)
- No → 1-5, 7, 12-19, 22-24

**"¿Qué tipo de auditoría?"**
- Gate general (4 dimensiones) → 6
- Seguridad (OWASP, vulns) → 8
- Performance (latencia, carga) → 9
- Código (deuda técnica) → 10
- UI/UX (WCAG, usabilidad) → 11

**"¿Qué tipo de testing?"**
- Estrategia general (cobertura completa) → 15
- Pruebas unitarias (funciones/componentes) → 16
- Pruebas de integración (módulos/servicios) → 17
- Pruebas E2E (flujos de usuario) → 18
- TDD/BDD (desarrollo guiado por tests) → 19

**"¿Cambio de contexto?"**
- Sí → 7 (handoff)
- No → 1-6, 8-19

---

## 📖 Ver También

- [README completo](./README.md) - Documentación detallada de todos los templates
- [Agent Profiles](../agent-profiles/README.md) - Perfiles de agentes IA
- [Task Management](../task.md) - Gestión de tareas del proyecto

---

**Tip**: Guarda esta página en favoritos para acceso rápido 🔖
