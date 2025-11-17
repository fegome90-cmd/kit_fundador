# Informe de remediación `scripts/setup.sh`

Este informe resume los hallazgos del documento `document/informes_CC/AUDITORIA_SETUP_SH.md`, el estado actual de las correcciones y el plan accionable pendiente. El objetivo es mantener la naturaleza de starkit mientras dejamos claro qué se corrigió y qué falta por implementar.

## 1. Problemas identificados

| ID | Severidad | Descripción resumida | Estado actual |
|----|-----------|----------------------|---------------|
| #1 | 🔴 Crítico | Dependencias inexistentes en `templates/python/requirements.txt` (Prometheus exporter >=1.22). | ✅ Corregido en Fase A (versiones reales 1.38/0.59). |
| #2 | 🟠 Alto | Tooling TypeScript obsoleto, 19 vulnerabilidades de `npm audit`. | ✅ Corregido en Fase A (ESLint 9, @typescript-eslint 8, redis 5). |
| #3 | 🟡 Medio | Sobrescritura silenciosa de archivos existentes. | ✅ Corregido en Fase B (confirmación + `--force`). |
| #4 | 🟡 Medio | Mensajes de éxito engañosos en ruta Python al fallar `pip install`. | ✅ Corregido en Fase A (abortos explícitos y logs). |
| #5 | 🔵 Bajo | Falta de flujo para eliminar/mover `templates/`. | ✅ Corregido en Fase B (prompt de conservación/movido/eliminación). |
| #6 | 🔵 Bajo | Sin validación previa de prerequisitos por modo. | ✅ Corregido en Fase B (validator reutilizable). |
| #7 | 🔵 Bajo | No hay test harness automatizado para `setup.sh`. | ✅ Corregido (Fase C – harness Bash + `npm run test:setup`). |
| #8 | 🔵 Bajo | Dependencia implícita de `date -u`/formato hardcodeado en `update_context`. | ✅ Corregido (helper `utc_timestamp` + serialización con Python). |
| #9 | 🔵 Bajo | Makefile asume `docker-compose.dev.yml` existente sin verificación. | ✅ Corregido (warning `warn_missing_compose_file`). |

## 2. Trabajo realizado vs pendiente

- **Implementado (Fases A y B + parte de Fase C)**: ajustes de dependencias, manejo de errores Python, modernización de tooling TypeScript, validación de prerequisitos, confirmación de sobrescrituras, manejo guiado de `templates/`, harness Bash (`tests/setup/setup_script.test.sh`), helper `utc_timestamp` y advertencia cuando falta `docker-compose.dev.yml`.
- **Pendiente/Opt-in**: la observabilidad mínima (`--verbose`, `--no-color`, `--log-file`) se documenta como mejora opcional para los consumidores del starkit; no se incluye por defecto para evitar sobre-ingeniería (ver `TASK-015`).

## 3. Estado por bloque de la Fase C

### C3.1 – Test harness Bash (`tests/setup/setup_script.test.sh`)
**Estado:** ✅ Completado. El harness crea tres workspaces temporales, ejecuta las opciones TS/Python/JSON con `SETUP_SH_SKIP_INSTALLS=true`, valida `.context/project-state.json` y se expone vía `npm run test:setup`/`make test:setup`.

### C3.2 – Observabilidad mínima (`--verbose` y `--no-color`)
**Estado:** ⏸️ Aplazado. Documentado como mejora opcional para equipos que necesiten más telemetría; no forma parte del starkit base (seguimiento en `TASK-015`).

### C3.3 – Integridad de contextos y guardas Makefile
**Estado:** ✅ Completado. `scripts/setup.sh` usa `utc_timestamp` con fallback Python, escribe el JSON desde una única función y advierte cuando falta `docker-compose.dev.yml` sin interrumpir el flujo.

### C3.4 – Documentación y backlog
**Estado:** ✅ Completado. README, tooling guide, plan, checklist y reporte reflejan el nuevo harness, la variable `SETUP_SH_SKIP_INSTALLS` y el estado parcial de la Fase C; el backlog registra explícitamente la decisión de diferir las banderas verbosas.

## 4. Resumen de implementación

| Componente | Implementado | No implementado | Notas |
|------------|--------------|-----------------|-------|
| Dependencias Python/TypeScript | ✅ | – | Fase A completa; se documentó el flujo de verificación manual debido a restricciones de red en CI. |
| Manejo de sobrescritura/prerequisitos/templates | ✅ | – | Fase B completa; README y tooling guide describen el uso de `--force`. |
| Test harness Bash | ✅ | – | `tests/setup/setup_script.test.sh` + scripts `npm run test:setup`/`make test:setup`. |
| Flags `--verbose/--no-color`, logging estructurado | – | ❌ | Aplazadas a `TASK-015` para mantener el starkit liviano. |
| Integridad de contextos (`utc_timestamp`, warning Docker Compose) | ✅ | – | Helper `utc_timestamp`, serialización con Python y `warn_missing_compose_file`. |

## 5. Próximos pasos sugeridos

1. Decidir si el proyecto que adopte el starkit requiere las banderas de observabilidad (C3.2); de ser así, usar `TASK-015` como punto de partida.
2. Mantener el harness Bash en CI (`npm run test:setup`/`make test:setup`) para detectar regresiones antes de tocar `scripts/setup.sh`.
3. Repetir esta auditoría cuando se agreguen nuevas opciones de stack o se modifiquen las plantillas copiadas por el setup.

> Este documento puede adjuntarse a los reportes de avance del starkit para demostrar qué recomendaciones de la auditoría ya se ejecutaron y cuáles quedan abiertas.
