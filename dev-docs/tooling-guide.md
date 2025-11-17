# Guía de Tooling y Scripts Personalizables

Este starkit no impone un stack final; en su lugar ofrece scripts y configuraciones "placeholder" que debes adaptar al lenguaje y
las herramientas que elijas. Usa esta guía como referencia al actualizar `package.json`, `lint-staged` y las suites de pruebas.

## 1. Entry points y scripts de npm

- `package.json` ya apunta a `src/index.ts`, `dist/index.js`, `scripts/migrate.ts` y `scripts/seed.ts`, que son stubs funcionales.
  Úsalos como punto de partida o reemplázalos por completo cuando definas tu bootstrap real. Ejemplos:
  - TypeScript: `src/http/server.ts` para desarrollo y `dist/http/server.js` tras compilar.
  - Python: crea un wrapper en `scripts/start_api.py` y ajusta los comandos para llamar a `python scripts/start_api.py`.
- Si tu stack no usa `ts-node`/`node`, modifica por completo los comandos `dev`/`start` para invocar tu runtime (por ejemplo,
  `uvicorn app.main:app --reload`).
- Actualiza `seed:dev`, `migrate:*` o crea nuevos scripts (`seed:local`, `db:reset`, etc.) apuntando a tus scripts reales o extendiendo los stubs `scripts/migrate.ts`/`scripts/seed.ts`.

> 📌 Recomendación: documenta los reemplazos en `dev-docs/task.md` dentro de la task activa para que todo el equipo conozca el nuevo entry point.

## 2. Linting, formatting y lint-staged

1. **Selecciona herramientas por lenguaje**
   - TypeScript/JavaScript: ESLint + Prettier.
   - Python: Ruff/Flake8 + Black + isort.
   - Go: `go fmt` + `golangci-lint`.
2. **Actualiza los scripts**
   - Cambia `lint`, `lint:fix`, `format`, `format:check` y `type-check` para invocar tus comandos reales.
   - Si gestionas múltiples lenguajes, crea scripts específicos (`lint:ts`, `lint:py`) y un script compuesto que los orqueste.
3. **Extiende `lint-staged`**
   - Añade patrones adicionales y comandos por lenguaje. Ejemplo:
     ```json
     {
       "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
       "*.py": ["ruff --fix", "black"],
       "*.go": ["golangci-lint run", "gofmt -w"]
     }
     ```
   - Si decides no usar `lint-staged`, elimina la sección y documenta el motivo en `dev-docs/context.md`.

## 3. Suites de pruebas opcionales

Además de Jest, el repositorio contiene ejemplos de pruebas en otros lenguajes que **no están conectados a los scripts por defecto**:

- `tests/setup/setup_script.test.sh`: harness oficial de `scripts/setup.sh`. Ejecuta las tres opciones del menú dentro de directorios temporales y valida `.context/project-state.json`. Comandos sugeridos:
  ```bash
  npm run test:setup
  # o
  make test:setup
  ```
  El harness exporta `SETUP_SH_SKIP_INSTALLS=true` para omitir `npm install`/`pip install` cuando solo quieres validar la copia de plantillas.

- `tests/integration/test_setup_script.sh`: script Bash que valida la presencia de plantillas. Para ejecutarlo manualmente:
  ```bash
  bash tests/integration/test_setup_script.sh
  ```
  Puedes integrarlo en tu pipeline añadiendo un script `"test:templates": "bash tests/integration/test_setup_script.sh"`.

- `tests/unit/python/`: ejemplos de tests Pytest para el value object `Email`. Para habilitarlos:
  ```bash
  pip install -r requirements.txt  # define tus dependencias
  pytest tests/unit/python
  ```
  Si adoptas Pytest como runner principal, añade un script (`"test:py": "pytest tests/unit/python"`) o ejecútalo desde tu `Makefile`.

Aclara en tu documentación interna cuáles de estas suites forman parte del pipeline oficial. Si decides eliminarlas, bórralas o muévelas a `templates/` para evitar confusiones.

## 4. Hooks y automatización

- Configura `husky`/`pre-commit` sólo después de definir tus linters reales. El script `prepare` actual (`husky install`) es un
  recordatorio; no olvides ejecutar `npx husky add .husky/pre-commit "npm run lint"` (o su equivalente) una vez definas el flujo.
- Integra los comandos anteriores en tu CI (GitHub Actions, GitLab CI, etc.) para que la plantilla se comporte igual localmente
  y en el pipeline.

Siguiendo estas pautas, el starkit mantiene su naturaleza agnóstica y aún así te guía para aterrizar un tooling coherente con tu
stack.

## 5. Script interactivo `scripts/setup.sh`

| Opción | Prerequisitos obligatorios | Acción al faltar prereqs |
|--------|----------------------------|---------------------------|
| TypeScript | `git`, `npm`, `docker-compose` (o `docker compose`) | El script se detiene antes de copiar archivos y explica qué instalar. |
| Python | `git`, `python3`, `pip`, `docker-compose` | Se aborta el setup antes de crear `venv/` o copiar plantillas. |
| JSON/config | `git` | Solo valida la presencia de git. |

- Usa `./scripts/setup.sh --force` únicamente en pipelines automatizados o cuando estés seguro de que quieres sobrescribir archivos sin confirmación y continuar a pesar de prerequisitos faltantes.
- Al finalizar, el script pregunta si deseas conservar `templates/`, moverlos a `.templates/` o eliminarlos. Documenta tu elección en `dev-docs/context.md` si cambias el flujo estándar.
- Define `SETUP_SH_SKIP_INSTALLS=true` cuando ejecutes el script/harness en entornos sin acceso a npm o PyPI; la copia de plantillas y actualización de `.context/` se ejecutará igual, pero se omitirá `npm install`/`pip install`.

## 6. Dependabot y mantenimiento de dependencias

- Sigue [`PLAN_EJECUCION_DEPENDABOT.md`](../PLAN_EJECUCION_DEPENDABOT.md) para decidir qué alertas atender dentro del starkit.
- Configuración recomendada (TASK-016): `.github/dependabot.yml` con tres entradas → `npm` (raíz), `npm` (templates/typescript) y `github-actions`, frecuencia semanal y `open-pull-requests-limit: 5`.
- Baseline (TASK-017): alinear `package.json` raíz con las versiones publicadas en la plantilla TypeScript, ejecutar `npm run lint`, `npm test`, `npm run test:setup` y documentar la fecha del último `npm audit`.
- Opt-in: auto-merge, herramientas alternativas (Renovate, Snyk) o ecosistemas adicionales dependen de cada consumidor; documenta cualquier personalización en `dev-docs/context.md`.

## 7. Migrations y seeds reproducibles

- **Variables de entorno**: copia `.env.example` a `.env` y define `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DATABASE_URL`. Usa valores literales en `DATABASE_URL` (no referencias como `${DB_USER}`) porque `dotenv` no expande variables anidadas. `scripts/migrate.ts` y `scripts/seed.ts` cargan ese archivo automáticamente antes de conectarse.
- **Runner**: `npm run migrate:up`/`npm run migrate:down` ejecutan `scripts/migrate.ts`, que aplica archivos `db/migrations/` con el formato `YYYYMMDDHHMM__descripcion.sql` (`-- up` / `-- down`). Cada ejecución se registra en `kit_migrations`.
- **Creación de archivos**: `npm run migrate:create -- add_users` genera un archivo nuevo con la plantilla `-- up/-- down`. Documenta cualquier convención adicional en `db/migrations/README.md`.
- **Seeds**: `npm run seed` usa `scripts/seed.ts` para poblar `seed_users`. Extiéndelo con tus propios inserts, ORMs o llamadas HTTP; manténlo idempotente para poder ejecutar `make db:reset && npm run seed` en CI.
- **Makefile**: `make db:up`, `make db:down` y `make db:reset` envuelven `docker compose` para que puedas recrear la base local sin afectar otros servicios. Asegúrate de usar Docker Engine 20.10+ con el plugin `docker compose` v2.
- **Testing**: `npm run test:integration:db` (que exporta `RUN_DB_TESTS=true` por ti) confirma que la conexión funciona y que `000000000000__bootstrap.sql` fue registrada. Si prefieres ejecutarlo dentro de `npm test`, exporta `RUN_DB_TESTS=true` antes del comando para que la suite no se omita.
