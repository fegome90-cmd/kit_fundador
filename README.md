# 🧱 Kit Fundador v2.0

Un starter kit **agnóstico de lenguaje**, diseñado para iniciar proyectos de software con **Clean Architecture, DDD, TDD y mejores prácticas**, tanto para equipos humanos como para agentes IA.

Este repositorio proporciona el **esqueleto profesional mínimo** para arrancar un proyecto sin deuda técnica inicial, con una estructura clara, tests desde el día 1 y un setup robusto que guía a desarrolladores y agentes hacia decisiones correctas.

- ✅ **TypeScript** (Node.js + Express + Jest + runner SQL estilo node-pg-migrate)
- ✅ **Python** (FastAPI + Pytest + SQLAlchemy)
- ✅ **JSON/Config** (para cualquier otro lenguaje)

## 🧩 Decisiones del stack base

- El perfil predeterminado del starkit usa **TypeScript + Node.js 20** con Express mínimo para exponer ejemplos de handlers.
- Los comandos de lint, build y testing se alinean con **ESLint + Prettier + Jest + esbuild**; tómalos como referencia y reemplázalos en cuanto cierres tu propio stack.
- Consulta [`dev-docs/tech-stack-decisions.md`](dev-docs/tech-stack-decisions.md) y [`config/tech-stack.json`](config/tech-stack.json) antes de proponer dependencias nuevas o sugerir frameworks alternativos.

## 🎯 Propósito

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

### Prerrequisitos

- **Node.js 20.x** y **npm 10.x** (los scripts usan características modernas de ES2022).
- **Docker Engine 20.10+** con el plugin `docker compose` v2 (el Makefile invoca `docker compose ...`).
- **Git** y `bash` para ejecutar `scripts/setup.sh`.

> 💡 Si tu host aún usa `docker-compose` clásico, actualiza Docker Engine o ajusta el Makefile antes de continuar.

```bash
git clone https://github.com/fegome90-cmd/kit_fundador.git mi-proyecto
cd mi-proyecto

chmod +x scripts/setup.sh
./scripts/setup.sh [--force]

# Selecciona el stack cuando se solicite
# Opciones disponibles:
#   1) TypeScript + Node.js (Express, Jest, SQL runner)
#   2) Python (FastAPI, Pytest, SQLAlchemy)
#   3) JSON/Config only (para usar con cualquier lenguaje)

cp .env.example .env
# Ajusta DB_USER/DB_PASSWORD y define DATABASE_URL como cadena completa (sin ${VAR}) antes de correr migraciones o seeds.
```

> 💡 El script valida prerequisitos (`git`, `npm`, `python3`, `docker-compose`) antes de copiar archivos y te pedirá confirmación si detecta contenido existente. Usa `--force` solo cuando estés seguro de sobrescribir y omitir las validaciones.

### 2. Configurar Proyecto

```bash
# Arranca la base de datos local (persistente)
make db:up

# Aplica la migración bootstrap y deja registro en kit_migrations
npm run migrate:up

# Crea los datos de referencia
npm run seed

# Prueba la conexión vía Jest
npm run test:integration:db
```

---

## 📁 Estructura mínima del proyecto

# Verificar que el setup interactivo siga funcionando
npm run test:setup     # o make test:setup para usar el harness bash

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

## 🤖 Plan de Dependabot

El pipeline de `npm ci` aún reporta 19 vulnerabilidades moderadas en el `package.json` raíz (glob@7, rimraf@3, eslint@8.x, etc.) y el repositorio no cuenta con `.github/dependabot.yml`. Para evitar que los consumidores arranquen desde una base insegura se publicó [`PLAN_EJECUCION_DEPENDABOT.md`](PLAN_EJECUCION_DEPENDABOT.md), que detalla:

- **Fase A – Configuración**: crear la configuración mínima de Dependabot para `npm` (raíz y plantilla TypeScript) y `github-actions`, limitando el número de PRs abiertos y documentando cómo pausar los recordatorios.
- **Fase B – Baseline**: actualizar las dependencias del `package.json` raíz hasta igualar las versiones ya presentes en la plantilla TypeScript (ESLint 9, `@typescript-eslint` 8, `redis` 5, etc.) y volver a ejecutar `npm run lint`, `npm test` y `npm run test:setup`.
- **Fase C – Documentación**: extender README, tooling guide, checklist del consumidor y guía de validación con pasos explícitos para triagear alertas en cada fork.

> 🎯 Resultado esperado: el starkit entrega dependencias saludables por defecto y cada equipo sabe qué alertas debe resolver en su proyecto vs. cuáles puede posponer.

## 🗄️ Blueprint de base de datos y migraciones

TASK-003 ya aterrizó el blueprint: el repositorio trae PostgreSQL 16 como servicio `db`, scripts `npm run migrate:*`
y seeds reproducibles. Consulta [`dev-docs/infrastructure/database-blueprint.md`](dev-docs/infrastructure/database-blueprint.md)
para entender cómo extenderlo:

- `docker-compose.dev.yml` expone el servicio `db` con volumen `db-data` y healthcheck `pg_isready`.
- `.env.example` define `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `DATABASE_URL` para que `scripts/migrate.ts`/`scripts/seed.ts`
  funcionen sin hardcodear credenciales.
- `db/migrations/` usa archivos `YYYYMMDDHHMM__descripcion.sql` con bloques `-- up/-- down`; el runner (`npm run migrate:up`)
  registra cada ejecución en `kit_migrations` y puedes generar plantillas con `npm run migrate:create -- add_users`.
- `scripts/seed.ts` crea datos mínimos (`seed_users`) y sirve como ejemplo para tu propio pipeline de fixtures.
- `tests/integration/db/connection.test.ts` valida la conexión y comprueba que la migración bootstrap existe.

Cuando adaptes el stack (otro motor, ORM o herramienta real como Prisma/`node-pg-migrate`), documenta los cambios en `dev-docs/task.md`
para mantener la trazabilidad.

## 🧠 Blueprint de casos de uso y handlers

La capa de aplicación permanece como plantilla hasta que cada consumidor implemente su primer flujo end-to-end.
Para evitar improvisaciones, sigue [`dev-docs/application/use-case-blueprint.md`](dev-docs/application/use-case-blueprint.md),
que describe:

- Cómo seleccionar el primer caso de uso del bounded context vigente y registrar la decisión en los docs del proyecto.
- Qué artefactos crear (DTOs, puertos, handlers y stubs de repositorio/event publisher) sin romper el aislamiento del dominio.
- Minitareas de testing (unit/integration) y los puntos de code review que deben revisarse antes de dar por completada TASK-004.

Marca el avance en `dev-docs/task.md` y `dev-docs/plan.md` en cuanto adoptes el blueprint para que el resto del equipo
identifique qué use case está en marcha y qué interfaces siguen pendientes.

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
- `tests/integration/db/connection.test.ts` verifica la conexión a PostgreSQL y que la migración bootstrap figure en `kit_migrations`. Ejecuta `npm run test:integration:db` después de `make db:up` y `npm run migrate:up`; el script exporta `RUN_DB_TESTS=true` automáticamente. Para incluir esta suite en `npm test`, exporta esa variable manualmente.
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
make db:up            # Levantar sólo la base de datos
make db:down          # Detener sólo la base de datos
make db:reset         # Recrear contenedor + volumen

# Quality
make lint             # Ejecutar linter
make format           # Formatear código
make validate         # Validar arquitectura

# Cleanup
make clean            # Limpiar containers
make reset            # Reset completo (clean + up + migrate + seed)
```

---

## 📚 Documentación completa

Toda la documentación extendida está organizada en `dev-docs/`:

- **[dev-docs/context.md](dev-docs/context.md)**: Visión general del proyecto
- **[dev-docs/plan.md](dev-docs/plan.md)**: Roadmap y milestones
- **[dev-docs/domain/ubiquitous-language.md](dev-docs/domain/ubiquitous-language.md)**: Glosario del dominio
- **[dev-docs/consumer-checklist.md](dev-docs/consumer-checklist.md)**: Checklist post-clonado para equipos que adopten el kit

**Informes de Auditoría**:
* [AUDITORIA_SETUP_SH.md](AUDITORIA_SETUP_SH.md) → Análisis profundo del script de setup
* [AUDITORIA_TDD_DDD.md](AUDITORIA_TDD_DDD.md) → Evaluación exhaustiva de capacidades TDD/DDD
* [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md) → Auditoría de seguridad completa

---

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
