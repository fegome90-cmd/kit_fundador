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
| #7 | 🔵 Bajo | No hay test harness automatizado para `setup.sh`. | ⏳ Pendiente (Fase C – TASK-013). |
| #8 | 🔵 Bajo | Dependencia implícita de `date -u`/formato hardcodeado en `update_context`. | ⏳ Pendiente (Fase C – TASK-014). |
| #9 | 🔵 Bajo | Makefile asume `docker-compose.dev.yml` existente sin verificación. | ⏳ Pendiente (Fase C – TASK-014). |

## 2. Trabajo realizado vs pendiente

- **Implementado (Fases A y B)**: ajustes de dependencias, manejo de errores Python, modernización de tooling TypeScript, validación de prerequisitos, confirmación de sobrescrituras y manejo guiado de `templates/`. Documentación, plan y tablero actualizados.
- **Pendiente (Fase C)**: automatización (tests Bash), observabilidad opcional, integridad de contextos (`date -u` fallback y guardas Makefile). Estas tareas no se han implementado aún para mantener el starkit libre de tooling adicional hasta que un equipo decida activarlas.

## 3. Plan detallado por minitareas pendientes

### C3.1 – Test harness Bash (`tests/setup/setup_script.test.sh`)
- **Objetivo**: Validar automáticamente las tres opciones del menú sin intervención manual.
- **Minitareas**:
  1. Crear `tests/setup/setup_script.test.sh` con `set -euo pipefail` y `trap cleanup EXIT`.
  2. Generar un `TMPDIR` por caso (`ts`, `py`, `json`) y ejecutar el script redirigiendo la opción deseada.
  3. Verificar artefactos clave (`package.json`, `pyproject.toml`, `.context/project-state.json`) y que el script termine con exit code 0.
  4. Integrar el test en el Makefile (`make test:setup`) y documentar el comando en README/tooling guide.
- **Revisión de código**: comprobar rutas relativas, limpieza completa del TMPDIR, compatibilidad con shells POSIX.
- **Testing**: `bash tests/setup/setup_script.test.sh` (local) y, opcionalmente, incluirlo dentro de `npm test` para asegurar ejecución continua.

### C3.2 – Observabilidad mínima (`--verbose` y `--no-color`)
- **Objetivo**: Facilitar el debugging y uso en CI.
- **Minitareas**:
  1. Extender el parser inicial para aceptar `--verbose`, `--no-color` y `--log-file=<path>` (opcional).
  2. Centralizar `log_info/log_warn/log_error` que respeten la configuración de color/TTY.
  3. Hacer que `--verbose` imprima comandos antes de ejecutarlos (por ejemplo, `run_cmd "npm install"`).
- **Revisión de código**: asegurar compatibilidad backward con ejecuciones sin flags y cobertura de mensajes multi-línea.
- **Testing**: ejecutar `./scripts/setup.sh --verbose --force` en entorno aislado y verificar salida, además de `./scripts/setup.sh --no-color | cat` para confirmar ausencia de secuencias ANSI.

### C3.3 – Integridad de contextos y guardas Makefile
- **Objetivo**: Producir metadatos consistentes y advertir sobre dependencias externas.
- **Minitareas**:
  1. Crear helper `utc_timestamp` que intente `date -u` y, si falla, use `python3 -c 'import datetime; print(...)'`.
  2. Centralizar la escritura de `.context/project-state.json` usando `jq` o `python - <<'PY'` para garantizar JSON válido.
  3. Añadir chequeo opcional para `docker-compose.dev.yml` y mostrar advertencia si falta (sin abortar).
- **Revisión de código**: verificar que el script sigue siendo portable (sin dependencias adicionales fuera de Bash/Python estándar).
- **Testing**: ejecutar `./scripts/setup.sh --force` en entornos Linux/macOS (o contenedores) y validar con `jq empty .context/project-state.json`; renombrar temporalmente `docker-compose.dev.yml` para observar el warning.

### C3.4 – Actualización de documentación y backlog
- **Objetivo**: Mantener sincronizados README, plan y tablero tras cada entrega.
- **Minitareas**:
  1. Registrar en `dev-docs/setup/setup-sh-remediation-plan.md` el avance de cada subfase.
  2. Actualizar `dev-docs/task.md`, `.context/active-context.md` y `.context/project-state.json` indicando qué minitareas fueron completadas.
  3. Añadir comandos de prueba (`make test:setup`, `npm run test:setup`) en README/tooling guide.
- **Revisión**: confirmar enlaces cruzados correctos y consistentes.
- **Testing**: N/A (documentación), pero verificar que los comandos documentados existan.

## 4. Resumen de implementación

| Componente | Implementado | No implementado | Notas |
|------------|--------------|-----------------|-------|
| Dependencias Python/TypeScript | ✅ | – | Fase A completa; se documentó el flujo de verificación manual debido a restricciones de red en CI. |
| Manejo de sobrescritura/prerequisitos/templates | ✅ | – | Fase B completa; README y tooling guide describen el uso de `--force`. |
| Test harness Bash | – | ❌ | A la espera de decidir si se integra en `npm test` o `make test`. |
| Flags `--verbose/--no-color`, logging estructurado | – | ❌ | Pendiente para mantener script liviano hasta que un consumidor lo solicite. |
| Integridad de contextos (`date -u` fallback, warning Docker Compose) | – | ❌ | No implementado; requiere coordinación con quienes consuman `.context/*`. |

## 5. Próximos pasos sugeridos

1. Priorizar C3.1 para asegurar regresiones mínimas antes de seguir expandiendo el script.
2. Cuando exista capacidad, abordar C3.2 y C3.3 en paralelo (ambas comparten el parser y la capa de logging).
3. Tras completar cada bloque, actualizar este informe y el plan maestro para mantener visibilidad histórica.

> Este documento puede adjuntarse a los reportes de avance del starkit para demostrar qué recomendaciones de la auditoría ya se ejecutaron y cuáles quedan abiertas.
