# Kit Fundador v2.0

> Template **agnóstico de lenguaje** para iniciar proyectos con LLM siguiendo Clean Architecture, DDD, TDD y mejores prácticas.

## 🌐 Stacks Soportados

- ✅ **TypeScript** (Node.js + Express + Jest + Prisma)
- ✅ **Python** (FastAPI + Pytest + SQLAlchemy)
- ✅ **JSON/Config** (para cualquier otro lenguaje)

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
./scripts/setup.sh

# Seleccionar tech stack cuando se solicite
# Opciones disponibles:
#   1) TypeScript + Node.js (Express, Jest, Prisma)
#   2) Python (FastAPI, Pytest, SQLAlchemy)
#   3) JSON/Config only (para usar con cualquier lenguaje)
```

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

# Validar arquitectura
make validate
```

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
