# Kit Fundador v2.0

> Template **agnóstico de lenguaje** para iniciar proyectos con LLM siguiendo Clean Architecture, DDD, TDD y mejores prácticas.

## 🌐 Stacks Soportados

- ✅ **TypeScript** (Node.js + Express + Jest + Prisma)
- ✅ **Python** (FastAPI + Pytest + SQLAlchemy)
- ✅ **JSON/Config** (para cualquier otro lenguaje)

## 🧩 Decisiones del stack base

- El perfil predeterminado del starkit usa **TypeScript + Node.js 20** con Express mínimo para exponer ejemplos de handlers.
- Los comandos de lint, build y testing se alinean con **ESLint + Prettier + Jest + esbuild**; tómalos como referencia y reemplázalos en cuanto cierres tu propio stack.
- Consulta [`dev-docs/tech-stack-decisions.md`](dev-docs/tech-stack-decisions.md) y [`config/tech-stack.json`](config/tech-stack.json) antes de proponer dependencias nuevas o sugerir frameworks alternativos.

## 🎯 Propósito

Este kit proporciona la infraestructura completa para que un agente IA (como Claude) pueda iniciar y mantener un proyecto de software de calidad profesional, con énfasis en:

- ✅ **Clean Architecture** + **Domain-Driven Design**
- ✅ **Test-Driven Development** estricto
- ✅ **Prevención de antipatrones** de IA al codificar
- ✅ **Observabilidad** desde día 1
- ✅ **CI/CD** automatizado
- ✅ **Resilience patterns** (circuit breakers, retries)
- ✅ **Feature flags** para deployment seguro

## ✨ Innovaciones del Kit v2.0

### 📝 Sistema de Templates de Prompts Estructurados

El kit incluye **19 templates especializados** para estandarizar la comunicación con agentes IA y documentar tareas:

<details>
<summary><strong>🎯 Templates de Implementación (1-5)</strong></summary>

- **Template 1**: Implementaciones grandes (> 5 días, sprints completos)
- **Template 2**: Features medianas (2-5 días)
- **Template 3**: Bug fixes (< 1 día, con RCA)
- **Template 4**: Refactorizaciones (reducción de deuda técnica)
- **Template 5**: Tareas diarias (< 2 horas)

</details>

<details>
<summary><strong>🔍 Templates de Auditoría (6, 8-11)</strong></summary>

- **Template 6**: Auditoría General (gate de calidad con 4 dimensiones)
- **Template 8**: Auditoría de Seguridad (OWASP Top 10, dependencias, secretos)
- **Template 9**: Auditoría de Performance (latencia, carga, bottlenecks)
- **Template 10**: Auditoría de Calidad de Código (deuda técnica, code smells)
- **Template 11**: Auditoría de UI/UX (WCAG 2.1 AA, usabilidad)

</details>

<details>
<summary><strong>🔬 Templates de Investigación y Planificación (12-14)</strong></summary>

- **Template 12**: Investigación Técnica (análisis de alternativas, PoC)
- **Template 13**: Planificación de Infraestructura (CI/CD, DevOps, IaC)
- **Template 14**: Architecture Decision Record (ADR)

</details>

<details>
<summary><strong>🧪 Templates de Testing (15-19)</strong></summary>

- **Template 15**: Plan de Pruebas General (estrategia completa TDD/BDD)
- **Template 16**: Plan de Pruebas Unitarias (funciones, componentes)
- **Template 17**: Plan de Pruebas de Integración (módulos, servicios)
- **Template 18**: Plan de Pruebas E2E (flujos de usuario completos)
- **Template 19**: Estrategia TDD/BDD (desarrollo guiado por pruebas)

</details>

📖 **Acceso rápido**: [`dev-docs/prompt_example/QUICK_REFERENCE.md`](dev-docs/prompt_example/QUICK_REFERENCE.md)

### 🤖 Sistema de Agent Profiles

Sistema de roles especializados para agentes IA que garantiza consistencia y calidad:

- **🚀 EJECUTOR**: Implementación con TDD estricto, anti-drift mechanisms, commits frecuentes
- **🔍 VALIDADOR**: Code review objetivo, 4 niveles de prioridad (CRITICAL → LOW), métricas de calidad
- **🔄 HANDOFF**: Traspasos documentados entre agentes, equipos o contextos

📖 **Guía completa**: [`dev-docs/agent-profiles/`](dev-docs/agent-profiles/)

### 🛡️ Auditorías Especializadas

Sistema de auditorías que cubren:

- **Seguridad**: OWASP Top 10, SAST, dependencias, secretos
- **Performance**: KPIs (latencia p95, throughput), profiling, optimización
- **Calidad de Código**: Complejidad ciclomática, duplicación, cobertura, deuda técnica
- **UI/UX**: WCAG 2.1 AA, heurísticas de Nielsen, accesibilidad

📊 **Informes disponibles**: [`document/informes_CC/`](document/informes_CC/)

### ⚡ Setup Mejorado

`scripts/setup.sh` ahora incluye:

- ✅ Validación de prerequisitos (git, npm, python3, docker-compose)
- ✅ Confirmación antes de sobrescribir (o `--force` para CI/CD)
- ✅ Manejo robusto de errores de pip/npm
- ✅ Limpieza post-instalación de templates
- ✅ Auditoría de dependencias (19 vulnerabilidades moderadas resueltas)

📋 **Plan de remediación**: [`dev-docs/setup/setup-sh-remediation-plan.md`](dev-docs/setup/setup-sh-remediation-plan.md)

## 📁 Estructura

```
proyecto/
├── .context/                    # Context management para IA
│   ├── project-state.json      # Estado persistente
│   └── active-context.md       # Memoria de sesión
├── templates/                   # Templates por lenguaje
│   ├── typescript/             # Template TypeScript completo
│   ├── python/                 # Template Python completo
│   └── shared/                 # Recursos compartidos
├── dev-docs/                   # Documentación universal
│   ├── architecture/           # ADRs, diagramas
│   ├── domain/                 # DDD documentation
│   ├── agent-profiles/         # Sistema Ejecutor/Validador (NUEVO)
│   ├── prompt_example/         # 19 templates de prompts estructurados (NUEVO)
│   ├── setup/                  # Plan de remediación del setup.sh
│   ├── context.md             # Contexto del proyecto
│   ├── plan.md                # Roadmap con workflow de templates
│   └── task.md                # Backlog
├── config/                     # Configuración
│   ├── rules/                 # Reglas del agente IA
│   ├── tech-stack.json        # Stack tecnológico
│   └── observability/         # Prometheus, Grafana, SLOs
├── src/                       # Código fuente (después de setup)
│   ├── domain/               # Core domain (sin dependencias)
│   ├── application/          # Use cases
│   └── infrastructure/       # Frameworks, DB, APIs
├── tests/                    # Tests organizados por tipo
│   ├── unit/                 # Tests unitarios (70%)
│   ├── integration/          # Tests de integración (20%)
│   └── e2e/                  # Tests end-to-end (10%)
└── scripts/                  # Automation scripts
    ├── setup.sh              # ⭐ Setup interactivo
    └── validate-architecture.sh  # Validación de arquitectura
```

## 🚀 Quick Start

### 1. Inicializar Proyecto

```bash
# Clonar template
git clone https://github.com/tu-org/kit-fundador-v2.git mi-proyecto
cd mi-proyecto

# Ejecutar setup
chmod +x scripts/setup.sh
./scripts/setup.sh [--force]

# Selecciona el stack cuando se solicite
# Opciones disponibles:
#   1) TypeScript + Node.js (Express, Jest, Prisma)
#   2) Python (FastAPI, Pytest, SQLAlchemy)
#   3) JSON/Config only (para usar con cualquier lenguaje)
```

> 💡 El script valida prerequisitos (`git`, `npm`, `python3`, `docker-compose`) antes de copiar archivos y te pedirá confirmación si detecta contenido existente. Usa `--force` solo cuando estés seguro de sobrescribir y omitir las validaciones.

### 2. Configurar Proyecto

```bash
# Editar archivos de configuración
nano config/tech-stack.json
nano dev-docs/context.md
nano dev-docs/task.md
```

### 3. Levantar Entorno de Desarrollo

```bash
# Con Docker Compose
make dev

# O manualmente
docker-compose -f docker-compose.dev.yml up
```

### 4. Verificar Setup

```bash
# Health checks
make health

# Ejecutar tests
make test

# Verificar que el setup interactivo siga funcionando
npm run test:setup     # o make test:setup para usar el harness bash

# Validar arquitectura
make validate
```

## 🛡️ Remediación del setup interactivo

El informe [`AUDITORIA_SETUP_SH.md`](document/informes_CC/AUDITORIA_SETUP_SH.md) detectó un bloqueo crítico en la opción Python,
19 vulnerabilidades moderadas en la plantilla TypeScript y varios riesgos de usabilidad. Antes de reutilizar `scripts/setup.sh`
en un proyecto real, sigue el [plan de ejecución](dev-docs/setup/setup-sh-remediation-plan.md) que prioriza:

1. **Correcciones críticas** (dependencias Python/TypeScript y manejo de errores de `pip`).
2. **Mejoras de usabilidad** (confirmación de sobrescritura, validación de prerequisitos y limpieza de templates).
3. **Hardening opcional** (tests del script, flags verbosos y guardas para `docker-compose`).

> **Estado actual**: ✅ **Fases A y B completadas**. De la **Fase C** ya están operativos el harness Bash (`tests/setup/setup_script.test.sh`, accesible vía `npm run test:setup`/`make test:setup`) y la integridad de metadatos (`utc_timestamp` + advertencia cuando falta `docker-compose.dev.yml`). La mejora de observabilidad (`--verbose`/`--no-color`) quedó documentada como **opcional** para que cada consumidor decida si la incorpora.

> 📦 Después de cada ejecución, decide qué hacer con `templates/` directamente desde el prompt final; si prefieres evitar preguntas en entornos automatizados, invoca el script con `--force`.

> 🧪 En pipelines sin acceso a npm/PyPI puedes ejecutar `SETUP_SH_SKIP_INSTALLS=true ./scripts/setup.sh` para saltar `npm install`/`pip install` (el harness usa esa variable por defecto) y aun así validar el resto del flujo.

Documenta qué fases aplicaste en `dev-docs/task.md` antes de continuar con las tareas principales del roadmap.

## 🗄️ Blueprint de base de datos y migraciones

Aunque el starkit no provisiona una base de datos real, TASK-003 exige que cada equipo defina su propia estrategia de
persistencia. Consulta [`dev-docs/infrastructure/database-blueprint.md`](dev-docs/infrastructure/database-blueprint.md)
para seguir una guía agnóstica que cubre:

- Servicios recomendados en `docker-compose.dev.yml` (ejemplo con Postgres, adaptable a otros motores).
- Archivos esperados (`.env.example`, `db/migrations/`, seeds) y su relación con `package.json`/`Makefile`.
- Minitareas, revisiones y comandos de testing que puedes usar para adaptar el kit sin añadir dependencias
  obligatorias.

Completa la checklist del blueprint y actualiza `dev-docs/task.md` cuando definas tu stack real para que el resto del
equipo conozca el estado de TASK-003.

## 🧭 Post-clone Checklist

Este repositorio es un **starkit agnóstico**: incluye ejemplos, no una aplicación completa. Después de clonar, sigue estos pasos
para dejarlo operativo en tu contexto:

1. **Entry point real** → crea el archivo de arranque de tu servicio (`src/index.ts`, `main.py`, etc.) y actualiza los scripts
   (`package.json`, `Makefile`, `docker-compose`) para apuntar a él.
2. **Dependencias implícitas** → importa manualmente módulos como `crypto` y reemplaza los helpers ficticios (`hashed_${plainPassword}`,
   event dispatcher en memoria) por servicios reales.
3. **Tooling** → decide tu stack de lint/test (ESLint, Pytest, Go test, etc.) y actualiza `lint-staged`, hooks y pipelines según
   corresponda. Consulta la [Guía de Tooling](dev-docs/tooling-guide.md) para reemplazar los placeholders de `package.json` y
   alinear linters/formatters multi-lenguaje.
4. **Documentación viva** → completa `dev-docs/context.md`, `dev-docs/plan.md` y `dev-docs/task.md` con las decisiones de tu
   producto.

> 📄 Consulta `dev-docs/consumer-checklist.md` para una lista detallada y marcable de responsabilidades.

## ✅ Validación post-adaptación

Cuando todos los placeholders hayan sido reemplazados, ejecuta una última pasada de calidad:

1. Corre lint, tests y type-check con los comandos reales de tu stack (no dejes los ejemplos sin verificar).
2. Confirma que los servicios ficticios (hasher, dispatcher, entrypoint) fueron sustituidos y documentados en `dev-docs/context.md`.
3. Sincroniza README, `dev-docs/plan.md` y `dev-docs/task.md` para que reflejen los comandos y responsables actuales.

> 📄 Usa la [Guía de Validación Post-Adaptación](dev-docs/post-adaptation-validation.md) para seguir un checklist completo y registrar hallazgos.

## 🧰 Personaliza scripts y linters

Los scripts incluidos en `package.json` apuntan a `src/index.ts`, `dist/index.js` y `scripts/seed.ts`, archivos stub que mantienen
los comandos funcionando desde el primer día. Cuando definas tu entry point real, personaliza esos archivos o actualiza los scripts
para apuntar a tu implementación definitiva. Sigue las pautas de `dev-docs/tooling-guide.md` para ajustar los comandos `dev`,
`start`, `seed`, `lint`, `format` y `type-check`, así como para extender `lint-staged` si trabajas con múltiples lenguajes.

## 🧪 Suites opcionales multi-lenguaje

- `tests/setup/setup_script.test.sh` es el harness oficial del setup interactivo. Corre `npm run test:setup` o `make test:setup` para validar las tres rutas sin tocar tu árbol local; el script usa `SETUP_SH_SKIP_INSTALLS=true` para evitar instalaciones reales en entornos CI.
- `tests/integration/test_setup_script.sh` demuestra cómo validar assets de las plantillas desde Bash. Ejecútalo manualmente o  expón un script (`npm run test:templates`) si quieres integrarlo al pipeline.
- `tests/unit/python/` contiene ejemplos de Pytest para el value object `Email`. Son ilustrativos y no forman parte del comando  `npm test`; habilítalos creando un script propio (`npm run test:py`) o desde tu `Makefile` si tu stack final usa Python. Para  ejecutarlos directamente basta con instalar tus dependencias (`pip install -r requirements.txt` o equivalente) y correr  `pytest tests/unit/python`. Si no vas a mantener una suite en Python, documenta la decisión en `dev-docs/context.md` y borra  la carpeta para evitar ruido en tu pipeline.

## 🧱 Plantillas de dominio y eventos

- Los value objects (`Email`, `Password`) usan constantes exportadas (regex, dominios bloqueados, longitud mínima) para que
  puedas sustituir reglas desde un único punto sin tocar la lógica interna.
- El aggregate `User` sólo modela operaciones básicas y acumula eventos en memoria; la responsabilidad de despacharlos recae en
  tu capa de aplicación a través de un `DomainEventDispatcher` propio.
- Sigue el patrón `save → publish → clear` para evitar publicar eventos que no llegaron a persistirse.
- El bounded context **Identity & Access** ya está descrito en [`dev-docs/domain/ubiquitous-language.md`](dev-docs/domain/ubiquitous-language.md);
  úsalo como blueprint y duplica la plantilla incluida al añadir nuevos contextos.

> 📄 Consulta `dev-docs/domain/domain-integration-points.md` para detalles y un checklist de implementación.

## 🛠️ Comandos Principales

```bash
# Desarrollo
make dev              # Iniciar entorno de desarrollo
make logs             # Ver logs de la app
make shell            # Abrir shell en container

# Testing
make test             # Ejecutar todos los tests
make test-watch       # Tests en modo watch
make test-coverage    # Tests con coverage

# Database
make migrate          # Ejecutar migraciones
make migrate-down     # Rollback última migración
make seed             # Seed development data
make db-shell         # PostgreSQL shell

# Quality
make lint             # Ejecutar linter
make format           # Formatear código
make validate         # Validar arquitectura

# Cleanup
make clean            # Limpiar containers
make reset            # Reset completo (clean + up + migrate + seed)
```

## 📚 Documentación Clave

### Para el Agente IA

**Lectura Obligatoria:**
- **[config/rules/ai-guardrails.json](config/rules/ai-guardrails.json)**: Reglas OBLIGATORIAS
- **[.context/project-state.json](.context/project-state.json)**: Estado actual del proyecto
- **[dev-docs/task.md](dev-docs/task.md)**: Qué hacer ahora

**Sistema de Templates (NUEVO):**
- **[dev-docs/prompt_example/QUICK_REFERENCE.md](dev-docs/prompt_example/QUICK_REFERENCE.md)**: Guía rápida de selección de templates
- **[dev-docs/prompt_example/README.md](dev-docs/prompt_example/README.md)**: Catálogo completo de 19 templates
- **[dev-docs/agent-profiles/PROMPTS.md](dev-docs/agent-profiles/PROMPTS.md)**: Activación de roles (EJECUTOR/VALIDADOR)

### Para Developers

**Fundamentos:**
- **[dev-docs/context.md](dev-docs/context.md)**: Visión general del proyecto
- **[dev-docs/plan.md](dev-docs/plan.md)**: Roadmap y milestones con workflow de templates
- **[dev-docs/domain/ubiquitous-language.md](dev-docs/domain/ubiquitous-language.md)**: Glosario del dominio
- **[dev-docs/consumer-checklist.md](dev-docs/consumer-checklist.md)**: Checklist post-clonado para equipos que adopten el kit

## 🏗️ Arquitectura

### Principios

1. **Dependency Inversion**: Domain no depende de nada
2. **Bounded Contexts**: Separación clara de subdominios
3. **Aggregate Patterns**: Consistencia transaccional
4. **Domain Events**: Comunicación entre aggregates
5. **CQRS**: Separación de commands y queries (opcional)

### Layers

```
Infrastructure (Frameworks, DB, APIs)
    ↓ implements
Application (Use Cases, Handlers)
    ↓ orchestrates
Domain (Entities, VOs, Aggregates)
    ← NO DEPENDENCIES →
```

## 🧪 Testing Strategy

- **Unit Tests (70%)**: Domain logic, pure functions
- **Integration Tests (20%)**: Repositories, APIs
- **E2E Tests (10%)**: Critical user journeys
- **Architecture Tests**: Validar dependency rules
- **Contract Tests**: API contracts con consumers

**Templates de Testing Disponibles:**

Usa los templates especializados para planificar tus pruebas:

- 📋 **Template 15**: Plan general de testing (estrategia completa)
- 🎯 **Template 16**: Plan de pruebas unitarias
- 🔗 **Template 17**: Plan de pruebas de integración
- 🏁 **Template 18**: Plan de pruebas E2E
- 🧩 **Template 19**: Estrategia TDD/BDD

Ver: [`dev-docs/prompt_example/QUICK_REFERENCE.md`](dev-docs/prompt_example/QUICK_REFERENCE.md#-testing-especializado)

## 🔄 Workflow Recomendado con Templates

### Para Implementar una Feature

```
1. Planificación (Template 2 o 1)
   ↓
2. Desarrollo TDD (Modo EJECUTOR)
   ↓
3. Code Review (Modo VALIDADOR + Template 6)
   ↓
4. ¿Gate PASS? → Handoff (Template 7)
   ¿Gate FAIL? → Remediar issues → volver al paso 2
```

### Para Auditorías de Calidad

```
1. Seleccionar tipo de auditoría:
   - Seguridad → Template 8
   - Performance → Template 9
   - Calidad de código → Template 10
   - UI/UX → Template 11
   ↓
2. Ejecutar auditoría (Modo VALIDADOR)
   ↓
3. Generar plan de remediación
   ↓
4. Implementar fixes (Modo EJECUTOR)
   ↓
5. Re-auditar para validar
```

### Para Investigación Técnica

```
1. Definir problema (Template 12)
   ↓
2. Análisis comparativo de alternativas
   ↓
3. Desarrollar Proof of Concept
   ↓
4. Documentar decisión (Template 14 - ADR)
```

📖 **Guía completa de workflows**: [`dev-docs/plan.md#workflow-con-templates-de-prompts`](dev-docs/plan.md#-workflow-con-templates-de-prompts)

## 📊 Observability

### Metrics (Prometheus)

- RED: Rate, Errors, Duration
- Business metrics: Orders/min, Signups, etc
- System metrics: CPU, Memory, Connections

### Tracing (Jaeger)

- Distributed tracing con OpenTelemetry
- Trace cada request end-to-end

### Logging (Structured)

- JSON logs con correlation IDs
- Levels: ERROR, WARN, INFO, DEBUG

### Dashboards

- Grafana: http://localhost:3001 (admin/admin)
- Prometheus: http://localhost:9090
- Jaeger: http://localhost:16686

## 🚦 CI/CD

Pipeline multi-stage en GitHub Actions:

1. **Fast Checks** (< 5 min): Lint, format, type check
2. **Unit Tests** (< 10 min): Con coverage
3. **Architecture Tests**: Validar dependency rules
4. **Integration Tests** (< 15 min): Con DB real
5. **E2E Tests** (< 20 min): Critical paths
6. **Security Scans**: Trivy, npm audit, gitleaks
7. **Build & Publish**: Docker image
8. **Performance Tests**: k6 load testing

## 🔒 Security

- ✅ Dependency scanning en CI/CD
- ✅ Secret detection con Gitleaks
- ✅ OWASP Top 10 considerations
- ✅ Input validation en application layer
- ✅ No secrets en código (variables de entorno)

## 🎛️ Feature Flags

Sistema de feature flags integrado para:

- 🐛 Kill switches (emergency disable)
- 🚀 Canary deployments (progressive rollout)
- 🎯 A/B testing
- 👥 Beta features (targeting)

## 📈 SLOs

Service Level Objectives configurados:

- **Availability**: 99.9% (43.2 min downtime/month)
- **Latency P95**: < 500ms
- **Error Rate**: < 1%

## 🤝 Contributing

### Para Humanos

1. Leer [dev-docs/context.md](dev-docs/context.md)
2. Elegir task de [dev-docs/task.md](dev-docs/task.md)
3. Seguir TDD: Red → Green → Refactor
4. Actualizar docs si es necesario
5. Crear PR con descripción clara

### Para Agentes IA

1. **OBLIGATORIO**: Leer config/rules/ai-guardrails.json
2. **OBLIGATORIO**: Leer .context/project-state.json
3. **NUEVO**: Seleccionar template apropiado de [`dev-docs/prompt_example/QUICK_REFERENCE.md`](dev-docs/prompt_example/QUICK_REFERENCE.md)
4. Elegir task de dev-docs/task.md
5. Activar rol apropiado (EJECUTOR/VALIDADOR) según [`dev-docs/agent-profiles/PROMPTS.md`](dev-docs/agent-profiles/PROMPTS.md)
6. Seguir TDD estrictamente
7. Actualizar .context/active-context.md al terminar

## 📝 License

MIT

## 🙏 Credits

Basado en best practices de:

- Robert C. Martin (Clean Architecture)
- Eric Evans (Domain-Driven Design)
- Martin Fowler (Refactoring, Patterns)
- Google SRE Book (Observability, SLOs)
- Michael Nygard (Release It!)

---

## 🎉 Novedades del Kit v2.0

Este kit ha evolucionado significativamente con las siguientes innovaciones:

### ✨ Sistema Completo de Templates (19 templates)
- 📝 5 templates de implementación (desde tareas diarias hasta sprints completos)
- 🔍 5 templates de auditoría especializada (seguridad, performance, código, UI/UX)
- 🔬 3 templates de investigación y planificación (research, infraestructura, ADR)
- 🧪 5 templates de testing (general, unitarias, integración, E2E, TDD/BDD)
- 🔄 1 template de handoff para traspasos documentados

### 🤖 Agent Profiles Especializados
- Sistema de roles (EJECUTOR/VALIDADOR/HANDOFF) con guías detalladas
- Prompts pre-configurados para activar cada rol
- Flujos de trabajo documentados para diferentes tipos de tareas

### 🛡️ Auditorías de Calidad Automatizadas
- Auditorías de seguridad (OWASP Top 10)
- Auditorías de performance con KPIs
- Auditorías de calidad de código y deuda técnica
- Auditorías de accesibilidad (WCAG 2.1 AA)

### ⚡ Setup Robusto y Validado
- Validaciones de prerequisitos
- Manejo robusto de errores
- Confirmaciones antes de sobrescribir
- Auditoría completa del script con plan de remediación

📊 **Informes de auditoría**: [`document/informes_CC/`](document/informes_CC/)
📖 **Guía de templates**: [`dev-docs/prompt_example/`](dev-docs/prompt_example/)

---

**¿Listo para empezar?** →
1. Ejecuta `./scripts/setup.sh` para inicializar tu proyecto
2. Lee [`dev-docs/prompt_example/QUICK_REFERENCE.md`](dev-docs/prompt_example/QUICK_REFERENCE.md) para seleccionar el template apropiado
3. Edita `dev-docs/context.md` y `dev-docs/task.md` con tu información
4. Activa el rol apropiado según [`dev-docs/agent-profiles/PROMPTS.md`](dev-docs/agent-profiles/PROMPTS.md)
