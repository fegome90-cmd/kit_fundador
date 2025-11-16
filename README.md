# 🧱 Kit Fundador v2.0

Un starter kit **agnóstico de lenguaje**, diseñado para iniciar proyectos de software con **Clean Architecture, DDD, TDD y mejores prácticas**, tanto para equipos humanos como para agentes IA.

Este repositorio proporciona el **esqueleto profesional mínimo** para arrancar un proyecto sin deuda técnica inicial, con una estructura clara, tests desde el día 1 y un setup robusto que guía a desarrolladores y agentes hacia decisiones correctas.

---

## ✨ ¿Qué incluye este kit?

✔️ Clean Architecture → separación clara Domain / Application / Infrastructure
✔️ TDD estricto: estructura de tests lista (unit, integration, e2e)
✔️ Scripts de setup robustos (validaciones + modo interactivo)
✔️ Observabilidad opcional (Prometheus, Grafana, Jaeger)
✔️ Plantillas TypeScript, Python y JSON/Config
✔️ Documentación completa en `dev-docs/`
✔️ Perfiles de ejecución EJECUTOR / VALIDADOR para agentes IA
✔️ Sistema de guardrails con investigación académica (Chen et al 2024, Liu et al 2024)

> Este README es intencionalmente breve. La documentación extendida está en **[dev-docs/README_FULL.md](dev-docs/README_FULL.md)**.

---

## 🚀 Quick Start

```bash
git clone https://github.com/fegome90-cmd/kit_fundador.git mi-proyecto
cd mi-proyecto

chmod +x scripts/setup.sh
./scripts/setup.sh     # o ./scripts/setup.sh --force en CI
```

Elegirás entre:

```
1) TypeScript + Node.js (Express + Jest + Prisma)
2) Python (FastAPI + Pytest + SQLAlchemy)
3) JSON/Config only
```

---

## 📁 Estructura mínima del proyecto

```
proyecto/
├── src/                 # Código fuente después del setup
│   ├── domain/          # Domain puro (DDD)
│   ├── application/     # Use cases
│   └── infrastructure/  # Frameworks, DB, APIs
├── tests/               # Unit / integration / e2e
├── templates/           # Plantillas de lenguajes
├── dev-docs/            # Documentación extendida
├── config/              # Reglas, tech stack, observability
├── scripts/             # Automation (setup, validate)
└── .context/            # Contexto persistente para IA
```

---

## 📚 Documentación completa

Toda la documentación extendida está organizada en `dev-docs/`:

* **[README_FULL.md](dev-docs/README_FULL.md)** → Guía completa del proyecto
* **agent-profiles/** → Roles EJECUTOR / VALIDADOR con checklists investigados
* **domain/** → Ubiquitous Language, invariantes, property-based testing
* **plan.md / task.md** → Roadmap y backlog activo
* **context.md** → Contexto y decisiones arquitectónicas (ADRs)

**Informes de Auditoría**:
* [AUDITORIA_SETUP_SH.md](AUDITORIA_SETUP_SH.md) → Análisis profundo del script de setup
* [AUDITORIA_TDD_DDD.md](AUDITORIA_TDD_DDD.md) → Evaluación exhaustiva de capacidades TDD/DDD
* [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) → Auditoría de seguridad completa

---

## 🛠️ Comandos Principales

```bash
# Setup inicial
./scripts/setup.sh

# Desarrollo
make dev              # Iniciar entorno de desarrollo
make test             # Ejecutar todos los tests
make validate         # Validar arquitectura

# Calidad
make lint             # Ejecutar linter
make format           # Formatear código
```

---

## 🙏 Agradecimientos

Este kit no sería posible sin las ideas, principios y contribuciones intelectuales de:

* **Robert C. Martin** — Clean Architecture, SOLID
* **Eric Evans** — Domain-Driven Design
* **Martin Fowler** — Refactoring, Patterns of Enterprise Application Architecture
* **Kent Beck** — Test-Driven Development
* **Michael Nygard** — Release It! (resilience patterns)
* **Google SRE Team** — Observability, SLOs
* **OWASP Foundation** — Seguridad de aplicaciones web

**Investigación Académica Integrada**:
* Chen et al (2024) — "Evaluating Large Language Models Trained on Code"
* Liu et al (2024) — "Lost in the Middle: How Language Models Use Long Contexts"

---

## 📜 Licencia

MIT — úsalo libremente para cualquier proyecto.
