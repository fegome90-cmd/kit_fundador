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
│   ├── agent-profiles/         # Sistema Ejecutor/Validador
│   ├── context.md             # Contexto del proyecto
│   ├── plan.md                # Roadmap
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

- **[config/rules/ai-guardrails.json](config/rules/ai-guardrails.json)**: Reglas OBLIGATORIAS
- **[.context/project-state.json](.context/project-state.json)**: Estado actual del proyecto
- **[dev-docs/task.md](dev-docs/task.md)**: Qué hacer ahora

### Para Developers

- **[dev-docs/context.md](dev-docs/context.md)**: Visión general del proyecto
- **[dev-docs/plan.md](dev-docs/plan.md)**: Roadmap y milestones
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
3. Elegir task de dev-docs/task.md
4. Seguir TDD estrictamente
5. Actualizar .context/active-context.md al terminar

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

**¿Listo para empezar?** → Edita `dev-docs/context.md` y `dev-docs/task.md`
