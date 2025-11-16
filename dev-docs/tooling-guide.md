# Guía de Tooling y Scripts Personalizables

Este starkit no impone un stack final; en su lugar ofrece scripts y configuraciones "placeholder" que debes adaptar al lenguaje y
las herramientas que elijas. Usa esta guía como referencia al actualizar `package.json`, `lint-staged` y las suites de pruebas.

## 1. Entry points y scripts de npm

- `package.json` usa tokens como `<project-entrypoint>`, `<build-output>` y `<seed-script>`. Reemplázalos por las rutas reales
  de tu servicio. Ejemplos:
  - TypeScript: `src/http/server.ts` para desarrollo y `dist/http/server.js` tras compilar.
  - Python: crea un wrapper en `scripts/start_api.py` y ajusta los comandos para llamar a `python scripts/start_api.py`.
- Si tu stack no usa `ts-node`/`node`, modifica por completo los comandos `dev`/`start` para invocar tu runtime (por ejemplo,
  `uvicorn app.main:app --reload`).
- Actualiza `seed:dev` o crea nuevos scripts (`seed:local`, `db:reset`, etc.) apuntando a tus scripts reales.

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

Además de Jest, el repositorio contiene ejemplos de pruebas en otros lenguajes que **no están conectados a los scripts por
defecto**:

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
  Si adoptas Pytest como runner principal, añade un script (`"test:py": "pytest tests/unit/python"`) o ejecútalo desde tu
  `Makefile`.

Aclara en tu documentación interna cuáles de estas suites forman parte del pipeline oficial. Si decides eliminarlas, bórralas o
muévelas a `templates/` para evitar confusiones.

## 4. Hooks y automatización

- Configura `husky`/`pre-commit` sólo después de definir tus linters reales. El script `prepare` actual (`husky install`) es un
  recordatorio; no olvides ejecutar `npx husky add .husky/pre-commit "npm run lint"` (o su equivalente) una vez definas el flujo.
- Integra los comandos anteriores en tu CI (GitHub Actions, GitLab CI, etc.) para que la plantilla se comporte igual localmente
  y en el pipeline.

Siguiendo estas pautas, el starkit mantiene su naturaleza agnóstica y aún así te guía para aterrizar un tooling coherente con tu
stack.
