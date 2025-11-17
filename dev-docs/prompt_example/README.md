# 📝 Catálogo de Templates de Prompts

Esta carpeta contiene **24 templates de prompts estructurados** para diferentes tipos de tareas de desarrollo. Estos templates ayudan a mantener consistencia, claridad y trazabilidad en el trabajo con agentes IA o en documentación de tareas.

## 🎯 Propósito

Los templates sirven para:
- **Estandarizar** la forma de comunicar tareas a agentes IA
- **Documentar** decisiones técnicas y contexto
- **Garantizar** que no se olviden aspectos importantes (tests, métricas, anti-drift)
- **Facilitar** handoffs entre agentes o equipos
- **Auditar** la calidad de las implementaciones

## 🔄 Checklist cuando se agrega un nuevo template

Para mantener sincronizado el catálogo con el resto de la documentación, cada nuevo template debe ir acompañado de los siguientes cambios:

1. **Crear o actualizar el archivo del template** dentro de `dev-docs/prompt_example/` siguiendo la estructura estándar (cuándo usar, características, ejemplos) y numeración correlativa.
2. **Actualizar este README**:
   - Incrementar el contador del encabezado ("Esta carpeta contiene **N templates**...").
   - Añadir la nueva subsección `### {N}. Nombre - \`archivo.md\`` con la descripción formal.
   - Revisar si la tabla o descripciones de roles mencionadas más abajo necesitan hacer referencia al nuevo template.
3. **Actualizar la guía rápida** en `dev-docs/prompt_example/QUICK_REFERENCE.md` (árbol de decisión, tablas comparativas y secciones por tipo de tarea) para que liste el nuevo ID.
4. **Actualizar el plan maestro** en `dev-docs/plan.md`, que contiene el “Catálogo de Templates” tabular y la “Integración con Agent Profiles”. Inserta el nuevo registro en la categoría correcta y menciona cómo impacta al flujo Ejecutor→Validador→Handoff.
5. **Actualizar las guías de agentes** en `dev-docs/agent-profiles/PROMPTS.md` si el nuevo template afecta las recomendaciones para EJECUTOR, VALIDADOR, HANDOFF o PLANIFICADOR.
6. **Actualizar checklists adicionales** (`dev-docs/task.md`, `dev-docs/context.md` u otros) solo si el template introduce un tipo de tarea que dichos documentos deben contemplar explícitamente.

Mantener este checklist asegura que cualquier incorporación se propague a todas las guías que usan el catálogo como fuente de verdad.

## 📚 Templates Disponibles

### 1. Implementación Grande - `prompt_template_1_large_implementation.md`

**Cuándo usar**: Sprints completos, nuevas arquitecturas, módulos complejos

**Características**:
- Metadata YAML con versión, complejidad, duración estimada
- Objetivos SMART detallados
- Timeline por fases con métricas cuantificables
- Mecanismos anti-drift (Boundary Markers)
- Target de code coverage
- Sistema de scoring (EVALUATION_SCORE)

**Ejemplo de uso**:
```markdown
"Implementar sistema de autenticación con JWT, refresh tokens y MFA"
"Crear módulo de reporting con generación de PDFs y exportación a Excel"
```

---

### 2. Feature Mediana - `prompt_template_2_medium_feature.md`

**Cuándo usar**: Funcionalidades de tamaño medio (2-5 días)

**Características**:
- Diseño técnico y arquitectura simplificada
- Flujo de datos propuesto
- Consideraciones de UI/UX
- Plan de implementación día a día
- Criterios de aceptación funcionales y técnicos

**Ejemplo de uso**:
```markdown
"Añadir funcionalidad de exportar usuarios a CSV"
"Implementar página de perfil de usuario con edición"
```

---

### 3. Bug Fix - `prompt_template_3_bug_fix.md`

**Cuándo usar**: Corrección de bugs, análisis de causa raíz

**Características**:
- Identificación de severidad
- Pasos para reproducir
- Root Cause Analysis (RCA)
- Solución propuesta con impacto
- Plan de verificación y anti-regresión

**Ejemplo de uso**:
```markdown
"Corregir bug de validación de email que permite caracteres inválidos"
"Solucionar error 500 al actualizar perfil sin foto"
```

---

### 4. Refactorización - `prompt_template_4_refactoring.md`

**Cuándo usar**: Reducción de deuda técnica, mejoras de código sin cambiar comportamiento

**Características**:
- Motivación (por qué refactorizar)
- Identificación de code smells
- Métricas actuales vs objetivo
- Plan de cambios propuestos
- Estrategia de verificación anti-regresión

**Ejemplo de uso**:
```markdown
"Refactorizar AuthService para reducir complejidad ciclomática"
"Extraer lógica de validación a servicio reutilizable"
```

---

### 5. Tarea Diaria - `prompt_template_5_daily_task.md`

**Cuándo usar**: Tareas simples, rápidas (< 2 horas)

**Características**:
- Estructura What/Why/How
- Muy conciso
- Criterios de aceptación básicos

**Ejemplo de uso**:
```markdown
"Cambiar texto del botón 'Submit' a 'Register'"
"Incrementar timeout de API de 5s a 15s"
```

---

### 6. Auditoría General - `template_6_general_audit.md`

**Cuándo usar**: Evaluación de sprints, revisión de calidad, gates de aprobación

**Características**:
- Sistema de scoring en 4 dimensiones:
  - **Completitud** (30%): Tareas completadas, coverage de requisitos
  - **Calidad** (30%): Análisis estático, coherencia, documentación
  - **Impacto** (25%): Anti-drift, usabilidad, valor aportado
  - **Sostenibilidad** (15%): Versionado, extensibilidad, escalabilidad
- Gate de aprobación/rechazo
- Fortalezas y áreas de mejora identificadas
- Próximos pasos recomendados

**Ejemplo de uso**:
```markdown
"Auditar sprint de implementación de sistema de autenticación"
"Evaluar calidad del módulo de reporting antes de producción"
```

---

### 7. Handoff/Traspaso - `template_7_general_handoff.md`

**Cuándo usar**: Transferencia de contexto entre agentes, equipos o sprints

**Características**:
- Tareas completadas con validaciones
- Artefactos generados (tabla con ubicaciones)
- Issues pendientes y riesgos
- Decisiones de arquitectura (ADRs)
- Umbrales/targets activos
- Comandos de validación ejecutables
- Checklist de handoff completo

**Ejemplo de uso**:
```markdown
"Traspasar contexto del sprint de autenticación al equipo de frontend"
"Documentar estado actual antes de cambiar de agente/chat"
```

---

### 8. Auditoría de Seguridad - `template_8_security_audit.md`

**Cuándo usar**: Evaluación de vulnerabilidades, compliance OWASP, análisis de dependencias

**Características**:
- Análisis de vulnerabilidades en dependencias (npm audit, Snyk)
- Revisión de código fuente con SAST (análisis estático)
- Checklist de Autenticación y Autorización
- Auditoría de manejo de secretos y claves API
- Configuración de infraestructura y red (headers, CORS, logging)
- Plan de remediación categorizado por severidad (Crítica/Alta/Media)
- Basado en OWASP Top 10

**Ejemplo de uso**:
```markdown
"Auditar seguridad del módulo de autenticación antes de release"
"Evaluar vulnerabilidades del API backend contra OWASP Top 10"
"Revisar manejo de secretos y configuración de producción"
```

---

### 9. Auditoría de Performance - `template_9_performance_audit.md`

**Cuándo usar**: Optimización de rendimiento, análisis de cuellos de botella, pruebas de carga

**Características**:
- KPIs de performance (latencia p95, throughput, CPU, memoria, LCP)
- Resultados de pruebas de carga (k6, JMeter, Gatling)
- Análisis de bottlenecks con profiling (New Relic, Datadog APM)
- Identificación de queries lentas, N+1 queries
- Recomendaciones de optimización por prioridad
- Plan de acción con esfuerzo estimado e impacto esperado

**Ejemplo de uso**:
```markdown
"Auditar performance del flujo de checkout bajo carga de 1000 usuarios"
"Analizar cuellos de botella en API de búsqueda"
"Optimizar tiempos de carga del frontend (Core Web Vitals)"
```

---

### 10. Auditoría de Calidad de Código - `template_10_code_quality_audit.md`

**Cuándo usar**: Evaluación de deuda técnica, code smells, mantenibilidad del código

**Características**:
- Métricas cuantitativas (complejidad ciclomática, duplicación, LOC)
- Análisis de code smells (God Object, métodos largos, duplicación)
- Evaluación de cobertura y calidad de tests
- Identificación de módulos problemáticos
- Estimación de deuda técnica en días-persona
- Plan de refactorización priorizado
- Herramientas: SonarQube, CodeClimate, ESLint

**Ejemplo de uso**:
```markdown
"Auditar calidad del módulo de billing para reducir deuda técnica"
"Evaluar mantenibilidad del repositorio frontend-app"
"Identificar code smells y priorizar refactorización"
```

---

### 11. Auditoría de UI/UX y Accesibilidad - `template_11_ui_ux_audit.md`

**Cuándo usar**: Evaluación de usabilidad, compliance WCAG, consistencia de diseño

**Características**:
- Evaluación heurística de usabilidad (10 heurísticas de Nielsen)
- Auditoría de accesibilidad WCAG 2.1 AA (Lighthouse, axe DevTools)
- Revisión de consistencia de UI (tipografía, colores, espaciado)
- Verificación de contenido y claridad de mensajes
- Identificación de issues críticos, mayores y menores
- Plan de remediación con prioridades
- Testing con lectores de pantalla (VoiceOver, NVDA)

**Ejemplo de uso**:
```markdown
"Auditar accesibilidad del flujo de registro para WCAG 2.1 AA"
"Evaluar usabilidad del dashboard principal con heurísticas de Nielsen"
"Revisar consistencia de UI del Design System"
```

---

### 12. Investigación Técnica - `template_12_technical_research.md`

**Cuándo usar**: Investigación de tecnologías, análisis de alternativas, decisiones técnicas

**Características**:
- Planteamiento del problema y objetivos SMART
- Metodología de investigación (fuentes, criterios de evaluación)
- Plan de trabajo con timeline
- Desarrollo de PoC (Proof of Concept)
- Tabla comparativa detallada
- Informe final de investigación y recomendación
- Análisis de riesgos de las alternativas

**Ejemplo de uso**:
```markdown
"Investigar librerías de estado para React (Redux vs Zustand vs Jotai)"
"Analizar viabilidad de migrar a microservicios"
"Comparar proveedores cloud (AWS vs GCP vs Azure) para el proyecto"
```

---

### 13. Planificación de Infraestructura - `template_13_infrastructure_plan.md`

**Cuándo usar**: Configuración de infraestructura, CI/CD, DevOps

**Características**:
- Objetivos y contexto (negocio y técnico)
- Arquitectura de la solución (diagrama, componentes, tecnologías)
- Plan de implementación detallado por fases
- Criterios de aceptación (Definition of Done)
- Estrategia de rollback
- Análisis de riesgos y consideraciones de costo

**Ejemplo de uso**:
```markdown
"Configurar pipeline de CI/CD para el servicio api-gateway"
"Crear entorno de staging en AWS con Terraform"
"Implementar monitoreo con Prometheus y Grafana"
```

---

### 14. Architecture Decision Record (ADR) - `template_14_architecture_decision_record.md`

**Cuándo usar**: Documentar decisiones de arquitectura importantes

**Características**:
- Contexto (problema y fuerzas en juego)
- Decisión tomada (clara y sin ambigüedades)
- Justificación (por qué se tomó esta decisión)
- Consecuencias (positivas y negativas)
- Alternativas consideradas y por qué fueron rechazadas
- Status (Propuesto/Aceptado/Rechazado/Deprecado)

**Ejemplo de uso**:
```markdown
"Documentar decisión de usar WebSockets en lugar de polling"
"Registrar elección de Auth0 como proveedor de identidad"
"ADR sobre migración de monolito a microservicios"
```

---

### 15. Plan de Pruebas - `template_15_testing_plan.md`

**Cuándo usar**: Planificación de estrategia de testing completa

**Características**:
- Objetivo y alcance de las pruebas (in/out of scope)
- Estrategia TDD/BDD con casos Given-When-Then
- Pruebas unitarias (componentes/funciones aisladas)
- Pruebas de integración (colaboración entre módulos)
- Pruebas E2E (flujos de usuario completos)
- Criterios de entrada y salida
- Herramientas y frameworks

**Ejemplo de uso**:
```markdown
"Plan de pruebas para funcionalidad de exportación a PDF"
"Estrategia de testing para migración a nueva versión de React"
"Definir casos de prueba para flujo de checkout"
```

---

### 16. Plan de Pruebas Unitarias - `template_16_unit_testing_plan.md`

**Cuándo usar**: Planificar pruebas unitarias de funciones, métodos y componentes

**Características**:
- Alcance específico de unidades a probar
- Identificación de dependencias a mockear
- Casos de prueba por función/método (happy path, bordes, errores)
- Casos de prueba para componentes UI (renderizado, interacciones, accesibilidad)
- Criterios de aceptación (cobertura ≥90%, velocidad)

**Ejemplo de uso**:
```markdown
"Plan de pruebas unitarias para el módulo de validación"
"Casos de prueba para el componente UserProfile"
"Tests unitarios para la clase ShoppingCart"
```

---

### 17. Plan de Pruebas de Integración - `template_17_integration_testing_plan.md`

**Cuándo usar**: Verificar integración entre módulos, servicios o capas

**Características**:
- Puntos de integración a probar (API↔DB, UI↔API, Service↔Service)
- Componentes mockeados vs reales
- Escenarios de integración detallados
- Manejo de fallos de comunicación
- Datos de prueba y fixtures
- Verificación de contratos entre servicios

**Ejemplo de uso**:
```markdown
"Pruebas de integración entre frontend y API REST"
"Integración de microservicios con message queue"
"Tests de integración para capa de datos con PostgreSQL"
```

---

### 18. Plan de Pruebas E2E - `template_18_e2e_testing_plan.md`

**Cuándo usar**: Validar flujos completos de usuario en entorno integrado

**Características**:
- Identificación de flujos críticos de usuario
- Configuración de entorno de prueba (Staging/QA)
- Flujos detallados con sintaxis Cypress/Playwright
- Gestión de datos de prueba (seeding, usuarios, servicios externos)
- Estrategia multi-navegador y multi-dispositivo
- Archivado de screenshots y videos de fallos

**Ejemplo de uso**:
```markdown
"Flujo E2E de registro y onboarding de usuario"
"Proceso completo de checkout en e-commerce"
"Flujo de creación, edición y eliminación de proyectos"
```

---

### 19. Estrategia TDD/BDD - `template_19_tdd_bdd_strategy.md`

**Cuándo usar**: Definir estrategia de desarrollo guiado por pruebas

**Características**:
- Escenarios de comportamiento (Given-When-Then)
- Tests de aceptación previos a implementación
- Plan de implementación Red-Green-Refactor
- Casos de prueba BDD para features
- Ciclo iterativo guiado por tests

**Ejemplo de uso**:
```markdown
"Estrategia TDD para implementar carrito de compras"
"BDD scenarios para sistema de notificaciones"
"Desarrollo guiado por tests para módulo de autenticación"
```

---

### 20. Guardrails Anti-Drift - `template_20_anti_drift_guardrails.md`

**Cuándo usar**: Definir límites estrictos y mecanismos anti-desviación para tareas críticas

**Características**:
- Mission Statement (declaración inequívoca del objetivo)
- Boundary Markers (límites de alcance, tecnología, performance, comportamiento)
- Chain of Verification (Claims que requieren evidencia empírica)
- Protocolo [EVIDENCE] vs [PROPOSAL]
- Context Pinning (fuentes de verdad y fuentes prohibidas)
- Condiciones de éxito/fallo de la misión

**Ejemplo de uso**:
```markdown
"Definir guardrails para implementación de endpoint POST /api/orders"
"Establecer límites estrictos para migración de base de datos"
"Crear marco de control para refactor crítico de sistema de pagos"
```

---

### 21. Matriz de Criterios de Éxito - `template_21_success_criteria_matrix.md`

**Cuándo usar**: Definir métricas y KPIs cuantificables para sprints/proyectos

**Características**:
- 4 dimensiones con ponderación:
  - **Completitud** (30%): Tareas, requisitos, documentación, artefactos
  - **Calidad** (30%): Cobertura tests, bugs, vulnerabilidades, linter
  - **Impacto** (25%): Latencia, conversión, satisfacción, carga
  - **Sostenibilidad** (15%): Mantenibilidad, complejidad, pipeline, runbook
- Metodología de scoring (baseline → target → actual)
- Método de medición específico para cada KPI
- Cálculo de score global final con gate de aprobación

**Ejemplo de uso**:
```markdown
"Definir criterios de éxito para sprint de optimización de performance"
"Matriz de KPIs para proyecto de migración a React 18"
"Métricas de evaluación para release de versión 2.0"
```

---

### 22. Briefing de Misión para Agente - `template_22_agent_mission_briefing.md`

**Cuándo usar**: Asignar tareas formalmente a agentes (humanos o IA) con directiva clara

**Características**:
- Prime Directive (objetivo imperativo e inmutable)
- Parámetros de la misión (duración, recursos, documentos de referencia)
- Capacidades requeridas (accesos, herramientas, conocimiento)
- Protocolos operativos (comunicación, escalada, handoff)
- Rules of Engagement (autonomía, colaboración, modo sigiloso)
- Criterios de éxito de la misión con verificación

**Ejemplo de uso**:
```markdown
"Briefing para agente de refactor de módulo LegacyUserService"
"Misión formal para implementación de sistema de caché distribuido"
"Asignación de tarea de migración de autenticación a OAuth 2.0"
```

---

### 23. Registro de Conocimiento - `template_23_knowledge_index_record.md`

**Cuándo usar**: Capturar aprendizajes y conocimiento después de completar misiones

**Características**:
- Resumen ejecutivo del conocimiento adquirido
- Patrones de código identificados/implementados (contexto, implementación, ubicación)
- Anti-patrones a evitar descubiertos
- Decisiones de arquitectura (ADRs) tomadas o propuestas
- Actualizaciones sugeridas para documentación y runbooks
- Métricas y datos clave para la memoria
- Nivel de memoria: L1 (Táctico) / L2 (Operacional) / L3 (Estratégico)

**Ejemplo de uso**:
```markdown
"Documentar aprendizajes de migración a Node.js v20"
"Registrar patrones descubiertos en implementación de WebSockets"
"Capturar conocimiento de resolución de issue crítico de memoria"
```

---

### 24. Análisis de Trade-offs - `template_24_trade_off_analysis.md`

**Cuándo usar**: Comparar alternativas técnicas usando criterios ponderados

**Características**:
- Definición de problema y contexto
- Criterios de decisión con ponderación (suma 100%)
- Análisis y scoring de cada alternativa (escala 1-5)
- Tabla comparativa con justificación de puntuaciones
- Cálculo de score ponderado automático
- Decisión final con justificación basada en datos

**Ejemplo de uso**:
```markdown
"Comparar frameworks de CSS (Tailwind vs Styled Components vs actual)"
"Evaluar alternativas de base de datos (PostgreSQL vs MongoDB vs DynamoDB)"
"Análisis de opciones de deployment (Vercel vs AWS vs Railway)"
```

---

## 🔄 Flujo de Trabajo Recomendado

### Para Implementaciones Grandes

```mermaid
flowchart LR
    A[Template 1: Large Implementation] --> B[Desarrollo en Fases]
    B --> C[Template 6: Audit]
    C --> D{Gate PASS?}
    D -->|SÍ| E[Template 7: Handoff]
    D -->|NO| F[Remediar Issues]
    F --> B
```

### Para Features Medianas

```mermaid
flowchart LR
    A[Template 2: Medium Feature] --> B[Implementación]
    B --> C[Template 6: Audit]
    C --> D{Gate PASS?}
    D -->|SÍ| E[Merge & Deploy]
    D -->|NO| F[Remediar Issues]
    F --> B
```

### Para Bugs y Refactors

```mermaid
flowchart LR
    A[Template 3: Bug Fix / Template 4: Refactor] --> B[Implementación]
    B --> C[Verificación & Tests]
    C --> D{Tests PASS?}
    D -->|SÍ| E[Merge]
    D -->|NO| F[Fix]
    F --> B
```

---

## 🤖 Integración con Agent Profiles

Estos templates se integran con los perfiles de agente existentes en `dev-docs/agent-profiles/`:

| Agent Profile | Templates Recomendados |
|---------------|------------------------|
| **EJECUTOR** | Templates 1-5, 12-19, 24 (implementación, investigación, planificación, testing, análisis) |
| **VALIDADOR** | Templates 6, 8-11, 21 (auditorías general y especializadas, métricas de éxito) |
| **HANDOFF** | Template 7, 23 (traspaso, registro de conocimiento) |
| **PLANIFICADOR/LÍDER** | Templates 20, 21, 22 (guardrails, métricas, briefings de misión) |

**Auditorías Especializadas (Templates 6, 8-11):**
- **Template 6**: Auditoría General (4 dimensiones: completitud, calidad, impacto, sostenibilidad)
- **Template 8**: Auditoría de Seguridad (OWASP, dependencias, secretos)
- **Template 9**: Auditoría de Performance (latencia, carga, bottlenecks)
- **Template 10**: Auditoría de Calidad de Código (deuda técnica, code smells)
- **Template 11**: Auditoría de UI/UX (accesibilidad WCAG, usabilidad)

**Planificación y Documentación (Templates 12-15):**
- **Template 12**: Investigación Técnica (análisis de alternativas, PoC, comparativas)
- **Template 13**: Planificación de Infraestructura (CI/CD, DevOps, IaC)
- **Template 14**: Architecture Decision Record (ADR - documentar decisiones)
- **Template 15**: Plan de Pruebas General (estrategia TDD/BDD, cobertura completa)

**Testing Especializado (Templates 16-19):**
- **Template 16**: Plan de Pruebas Unitarias (funciones, métodos, componentes)
- **Template 17**: Plan de Pruebas de Integración (módulos, servicios, capas)
- **Template 18**: Plan de Pruebas E2E (flujos de usuario completos)
- **Template 19**: Estrategia TDD/BDD (desarrollo guiado por pruebas)

**Meta-Organización y Control de Calidad (Templates 20-24):**
- **Template 20**: Guardrails Anti-Drift (límites estrictos, evidencia vs propuesta, context pinning)
- **Template 21**: Matriz de Criterios de Éxito (KPIs en 4 dimensiones, scoring ponderado)
- **Template 22**: Briefing de Misión para Agente (directiva, capacidades, protocolos operativos)
- **Template 23**: Registro de Conocimiento (patrones, anti-patrones, ADRs, métricas)
- **Template 24**: Análisis de Trade-offs (comparación ponderada de alternativas)

Ver: [`dev-docs/agent-profiles/README.md`](../agent-profiles/README.md)

---

## 📖 Cómo Usar un Template

### Paso 1: Seleccionar Template
Elige el template según la complejidad y tipo de tarea (ver tabla arriba).

### Paso 2: Copiar y Personalizar
```bash
# Ejemplo: copiar template para una nueva feature
cp dev-docs/prompt_example/prompt_template_2_medium_feature.md \
   .context/prompts/TASK-004-user-profile-feature.md
```

### Paso 3: Rellenar Placeholders
Reemplaza todos los `[...]` con valores reales de tu proyecto:
- `[Feature Name]` → "User Profile Management"
- `[X días]` → "3 días"
- `[Módulo/Componente]` → "UserService, ProfileView"

### Paso 4: Usar con Agentes IA
Pasa el prompt completo al agente IA o úsalo como checklist para implementación manual.

### Paso 5: Auditar (opcional)
Después de completar, usa `template_6_general_audit.md` para evaluar la calidad.

---

## 🎓 Principios de Diseño de los Templates

### 1. **SMART Goals**
Todos los templates siguen objetivos Específicos, Medibles, Alcanzables, Relevantes y Temporales.

### 2. **Metadata Estructurada**
YAML frontmatter para trazabilidad y versionado.

### 3. **Anti-Drift Mechanisms**
Templates de implementación incluyen boundary markers para evitar desviaciones del plan.

### 4. **Verificabilidad**
Cada template incluye criterios de aceptación ejecutables (tests, comandos, métricas).

### 5. **Chain of Verification**
Separación clara entre EVIDENCIA (hechos) y PROPUESTA (ideas), con tags `[K:]`, `[C:]`, `[U:]`, `[EVIDENCIA:]`.

---

## 🔗 Referencias

- **Agent Profiles**: [`dev-docs/agent-profiles/`](../agent-profiles/)
- **Task Management**: [`dev-docs/task.md`](../task.md)
- **Plan General**: [`dev-docs/plan.md`](../plan.md)
- **Post-Adaptation Validation**: [`dev-docs/post-adaptation-validation.md`](../post-adaptation-validation.md)

---

## 📝 Notas

### ¿Por qué templates de prompts?

Los templates estructurados:
1. **Reducen ambigüedad** en la comunicación con agentes IA
2. **Documentan decisiones** de forma consistente
3. **Facilitan auditorías** posteriores
4. **Mejoran la calidad** al forzar pensar en tests, métricas y riesgos

### Personalización

Estos templates son **adaptables**. Si un proyecto necesita más/menos detalle:
- **Para proyectos pequeños**: Usa templates 3-5 (más simples)
- **Para proyectos enterprise**: Usa templates 1, 6, 7 (más estructura)
- **Crea tus propios templates** siguiendo los principios de diseño

---

**Versión**: 1.0.0
**Autor**: Kit Fundador Team
**Fecha**: 2025-01-16
**Estado**: ✅ Ready for use
