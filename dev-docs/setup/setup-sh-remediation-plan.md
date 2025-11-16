# Plan de ejecución para `scripts/setup.sh`

Este plan toma como insumo la auditoría publicada en `document/informes_CC/AUDITORIA_SETUP_SH.md` y transforma los hallazgos en iteraciones accionables. El objetivo es mantener el repositorio como starkit agnóstico mientras se documentan los pasos que cada consumidor debe seguir para endurecer el script antes de usarlo en producción.

## Objetivos generales

1. Restablecer la funcionalidad completa de las tres opciones del menú (TypeScript, Python y JSON) sin modificar el carácter de plantilla.
2. Reducir a cero las vulnerabilidades conocidas en la ruta TypeScript y evitar dependencias inexistentes en la ruta Python.
3. Mejorar la experiencia de uso para evitar sobrescrituras accidentales y reportes de estado engañosos.
4. Añadir pruebas, validaciones y limpieza opcional que faciliten la mantenibilidad futura del script.

## Fase A – Correcciones críticas (P0-P1)

**Estado:** ✅ Completada el 2025-01-16. Versiones nuevas en `templates/python/requirements.txt`, plantilla TypeScript y manejo de errores de `pip` ya viven en la rama principal.

### A1.1 – Revisar `requirements.txt`
**Objetivo.** Garantizar que la opción Python pueda instalar dependencias sin errores.

**Minitareas.**
1. Auditar cada constraint de `templates/python/requirements.txt` contra PyPI.
2. Reemplazar exporters OpenTelemetry `>=1.x` por las versiones beta reales (`>=0.59b0`) o, si aplica, usar OTLP estable.
3. Eliminar dependencias obsoletas (Jaeger exporter) y alinear `redis`, `psycopg`, `fastapi` con versiones mantenidas.
4. Documentar en README/plan que los consumidores deben revisar versiones según su backend.

**Revisión de código.**
- Confirmar que sólo se editan los archivos del template (no tocar dependencias reales del starkit).
- Verificar consistencia alfabética y comentarios explicativos dentro de `requirements.txt`.

**Testing.**
- `python3 -m venv .audit && source .audit/bin/activate && pip install -r templates/python/requirements.txt` debe completar sin errores.
- Ejecutar `pip list | grep opentelemetry` dentro del entorno para verificar que se instalaron las bibliotecas esperadas.

### A1.2 – Ajustar plantilla TypeScript
**Objetivo.** Reducir a cero las vulnerabilidades conocidas de `npm audit`.

**Minitareas.**
1. Elevar `eslint`, `@typescript-eslint/*`, `redis` y otras dependencias observadas en la auditoría.
2. Regenerar `package-lock.json` dentro de `templates/typescript` para capturar el nuevo grafo.
3. Actualizar `dev-docs/tooling-guide.md` y README con las versiones mínimas sugeridas.

**Revisión de código.**
- Comparar `package.json` y `package-lock.json` para asegurar que las versiones coinciden.
- Revisar notas de breaking changes en los repos oficiales antes de subir la versión (documentar excepciones si no se puede actualizar algo).

**Testing.**
- `cd templates/typescript && npm install` en un árbol limpio.
- `npm audit --production` debe devolver 0 vulnerabilidades.
- `npm run lint` y `npm test` para comprobar compatibilidad con las nuevas dependencias.

### A1.3 – Mensajería honesta en Python
**Objetivo.** Asegurar que los mensajes reflejan el estado real de la instalación y que los fallos detienen el script.

**Minitareas.**
1. Envolver `pip install` con comprobación de estatus (`if ! pip install ...; then exit 1`).
2. Añadir logs `[INFO]/[ERROR]` alrededor de la instalación.
3. Actualizar README/plan para explicar el nuevo comportamiento.

**Revisión de código.**
- Confirmar que `set -e` aplica también dentro del bloque que activa el `venv`.
- Validar que los mensajes en verde sólo se imprimen en rutas de éxito.

**Testing.**
- Ejecutar `./scripts/setup.sh` opción 2 en un entorno limpio con `requirements.txt` corregido: debe terminar en verde.
- Introducir un error temporal (por ejemplo, dependencia inexistente) y verificar que el script aborta mostrando mensaje rojo y código de salida distinto de 0.

## Fase B – Usabilidad y seguridad operativa (P2)

### B2.1 – Protección ante sobrescritura
**Objetivo.** Evitar la pérdida accidental de código cuando el script se ejecuta sobre un repositorio existente.

**Minitareas.**
1. Implementar `confirm_overwrite` que inspecciona `src/`, `tests/`, `package.json`, `pyproject.toml`, etc.
2. Permitir continuar sólo si el usuario confirma (`y/N`) o si se pasa `--force`.
3. Documentar el flag y el flujo en README/quick start.

**Revisión de código.**
- Revisar que la función sea reutilizable entre TypeScript y Python.
- Comprobar que no se sobreescriben archivos fuera del listado controlado.

**Testing.**
- Crear archivos dummy, ejecutar `./scripts/setup.sh` y elegir “No”: el script debe salir sin modificaciones.
- Repetir con “Sí” y confirmar que los archivos se reemplazan según lo esperado.

### B2.2 – Hooks de prerequisitos
**Objetivo.** Fallar temprano si faltan herramientas básicas.

**Minitareas.**
1. Crear `validate_prerequisites <mode>` que verifique `git`, `npm`, `python3`, `pip`, `docker-compose`, etc.
2. Añadir tabla de requisitos por modo en `dev-docs/tooling-guide.md#setup-script`.
3. Mostrar mensajes de ayuda cuando falte algún binario.

**Revisión de código.**
- Validar que los chequeos usan `command -v` y no introducen dependencias adicionales.
- Asegurar que la función se invoca antes de copiar plantillas.

**Testing.**
- Simular ausencia de una herramienta (`PATH="" ./scripts/setup.sh"`) y verificar que el mensaje sea claro y el script termine.
- Ejecutar normalmente para asegurar que los mensajes de éxito siguen apareciendo.

### B2.3 – Limpieza/retención de templates
**Objetivo.** Dar control al usuario sobre el directorio `templates/` después de la copia.

**Minitareas.**
1. Convertir `cleanup_templates` en un prompt con tres opciones: conservar, mover a `.templates/`, eliminar.
2. Registrar la elección en consola y documentarla en README.

**Revisión de código.**
- Revisar que se respete la elección del usuario y que las rutas se calculen con `realpath`/`pwd` cuando sea necesario.

**Testing.**
- Ejecutar el script y seleccionar cada opción para confirmar el comportamiento.
- Validar que al eliminar se borre el directorio y al mover quede oculto.

## Fase C – Hardening y automatización (P3-P4)

### C3.1 – Test harness bash
**Objetivo.** Automatizar la verificación de las tres opciones del menú.

**Minitareas.**
1. Crear `tests/setup/setup_script.test.sh` que levante un directorio temporal por opción.
2. Incluir asserts para archivos críticos (`package.json`, `pyproject.toml`, `.context/project-state.json`).
3. Integrar el test en el Makefile (`make test:setup`) y documentarlo en README.

**Revisión de código.**
- Verificar uso de `set -euo pipefail` y limpieza (`trap 'rm -rf "$TMP"' EXIT`).
- Revisar que el script no dependa de rutas absolutas.

**Testing.**
- Ejecutar `./tests/setup/setup_script.test.sh` manualmente y revisar que retorna 0.
- Asegurar que el comando se encadena dentro de `npm test` o `make test` según la guía.

### C3.2 – Observabilidad mínima
**Objetivo.** Facilitar el debugging del setup.

**Minitareas.**
1. Añadir banderas `--verbose` y `--no-color` al parser inicial.
2. Prefijar los mensajes con `[INFO]`, `[WARN]`, `[ERROR]` y permitir redirigirlos a un log file.

**Revisión de código.**
- Confirmar que el color se desactiva correctamente cuando se usa `--no-color` o cuando `stdout` no es TTY.

**Testing.**
- Ejecutar `./scripts/setup.sh --verbose` y validar que imprime los comandos antes de ejecutarlos.
- Probar `./scripts/setup.sh --no-color | cat` para confirmar que no se ven secuencias ANSI.

### C3.3 – Integridad de contextos
**Objetivo.** Asegurar timestamps consistentes y centralizar la escritura de `.context/project-state.json`.

**Minitareas.**
1. Implementar `utc_timestamp` con fallback en Python cuando `date -u` no esté disponible.
2. Centralizar la serialización JSON para evitar errores de formato.

**Revisión de código.**
- Revisar que la función maneje locales y que siempre emita ISO8601.

**Testing.**
- Ejecutar script en Linux/macOS (o simular con contenedores) y comparar el timestamp generado.
- Utilizar `jq` para validar que el JSON resultante es válido (`jq empty .context/project-state.json`).

### C3.4 – Guardas para Makefile
**Objetivo.** Prevenir fallos cuando `docker-compose.dev.yml` no existe.

**Minitareas.**
1. Durante el setup, comprobar la existencia del archivo y mostrar advertencia si falta.
2. Añadir nota en README sobre cómo crear el archivo antes de usar `make dev`.

**Revisión de código.**
- Confirmar que la advertencia no aborta el script (solo informativa).

**Testing.**
- Renombrar temporalmente `docker-compose.dev.yml` y ejecutar el setup para observar la advertencia.
- Restaurar el archivo y repetir para verificar que no aparece el mensaje.

## Gobernanza y seguimiento

- **Backlog dedicado**: añadir TASK-011 a TASK-014 en `dev-docs/task.md` para rastrear cada bloque de trabajo (Fases A, B y C).
- **Estado**: inicialmente "Pendiente"; mover a "En progreso" cuando un equipo adopte el plan.
- **Contexto**: actualizar `.context/active-context.md` y `.context/project-state.json` con el nuevo frente de trabajo `setup.sh` para que futuros agentes vean la prioridad.
- **Documentación cruzada**: enlazar este plan desde `README.md` (sección de scripts) y `dev-docs/plan.md` (nuevo subcapítulo "Remediación setup.sh").

## Estrategia de validación

1. **Verificación manual guiada** (checklist ya incluida en la auditoría) tras cada fase.
2. **Automatización**: integrar el test bash en `npm test` y como job del pipeline que los consumidores puedan activar.
3. **Mediciones**: publicar en `dev-docs/post-adaptation-validation.md` un bloque dedicado al script (éxito de menú, `npm audit`, `pip install`).

## Consideraciones para el starkit

- Ninguna corrección debe acoplar el script a un stack específico; toda referencia a servicios reales debe quedar documentada como "personaliza aquí".
- Proveer valores seguros por defecto (por ejemplo, versiones estables sugeridas) pero recordar en README que los consumidores pueden reemplazarlos.
- Mantener las plantillas de TypeScript/Python como ejemplo; el script debe permitir copiar sólo partes relevantes si el usuario así lo decide.

## Próximos pasos

1. Socializar este plan con los equipos que consumen el starkit y priorizar Fase A.
2. Una vez aplicadas las correcciones críticas, ejecutar nuevamente la auditoría para verificar que la opción Python sea utilizable.
3. Planificar ventanas cortas para Fase B y C, o permitir que cada consumidor las ejecute antes de su primera release.
