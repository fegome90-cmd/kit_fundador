# Plan de ejecución para `scripts/setup.sh`

Este plan toma como insumo la auditoría publicada en `document/informes_CC/AUDITORIA_SETUP_SH.md` y transforma los hallazgos en iteraciones accionables. El objetivo es mantener el repositorio como starkit agnóstico mientras se documentan los pasos que cada consumidor debe seguir para endurecer el script antes de usarlo en producción.

## Objetivos generales

1. Restablecer la funcionalidad completa de las tres opciones del menú (TypeScript, Python y JSON) sin modificar el carácter de plantilla.
2. Reducir a cero las vulnerabilidades conocidas en la ruta TypeScript y evitar dependencias inexistentes en la ruta Python.
3. Mejorar la experiencia de uso para evitar sobrescrituras accidentales y reportes de estado engañosos.
4. Añadir pruebas, validaciones y limpieza opcional que faciliten la mantenibilidad futura del script.

## Fase A – Correcciones críticas (P0-P1)

| Tarea | Descripción | Entregables | Validación |
|-------|-------------|-------------|------------|
| A1.1 – Revisar `requirements.txt` | Actualizar constraints para todos los paquetes OpenTelemetry/infra: usar exporters `0.59b0`, API/SDK `1.38.x`, `redis>=5`, remover dependencias deprecadas (Jaeger). | `templates/python/requirements.txt` actualizado + nota en README que indica que los consumidores deben ajustar versiones según su backend de observabilidad. | `python3 -m venv .audit && source .audit/bin/activate && pip install -r templates/python/requirements.txt` sin errores. |
| A1.2 – Ajustar plantilla TypeScript | Elevar toolchain (`eslint@^9`, `@typescript-eslint@^8`, `redis@^5`) y regenerar `package-lock.json` para que `npm audit` no reporte vulnerabilidades moderadas. | `templates/typescript/package.json` y `package-lock.json` regenerados; README/tooling guide actualizados. | `npm install && npm audit --production` dentro de `templates/typescript` con 0 vulnerabilidades. |
| A1.3 – Mensajería honesta en Python | Encapsular `pip install` dentro de `set -e` explícito, chequear retorno y abortar con mensaje rojo al fallar. | Bloque `setup_python` actualizado + pruebas manuales descritas. | Ejecutar `./scripts/setup.sh` opción 2 en sandbox; debe detenerse cuando `pip` falla y no imprimir mensajes verdes. |

## Fase B – Usabilidad y seguridad operativa (P2)

| Tarea | Descripción | Entregables | Validación |
|-------|-------------|-------------|------------|
| B2.1 – Protección ante sobrescritura | Antes de copiar archivos, verificar si existen `src/`, `tests/`, `package.json`, etc. Solicitar confirmación interactiva o requerir `--force`. | Nueva función `confirm_overwrite` + documentación en README/QUICK_START explicando el flag. | Ejecutar script en repo con archivos existentes y confirmar que muestra advertencia y respeta respuesta del usuario. |
| B2.2 – Hooks de prerequisitos | Añadir `validate_prerequisites` que chequee `git`, `npm`, `python3`, `pip`, `docker-compose`. Permitir continuar sólo cuando las herramientas requeridas para la opción elegida estén presentes. | Función compartida + tabla de prerequisitos en `dev-docs/tooling-guide.md#setup-script`. | `./scripts/setup.sh` debe abortar con mensaje claro si falta `npm` (simular con `PATH` temporal). |
| B2.3 – Limpieza/retención de templates | Convertir `cleanup_templates` en un prompt (el usuario elige conservar, mover a `.templates/` o eliminar). Documentar implicaciones en README. | Función actualizada + sección nueva en README `Plantillas post-setup`. | Ejecutar script y elegir cada opción para verificar resultado. |

## Fase C – Hardening y automatización (P3-P4)

| Tarea | Descripción | Entregables | Validación |
|-------|-------------|-------------|------------|
| C3.1 – Test harness bash | Crear `tests/setup/setup_script.test.sh` que: (1) crea directorio temporal, (2) ejecuta cada opción del menú, (3) valida archivos clave y (4) limpia recursos. | Script de pruebas + instrucciones en README y Makefile (`make test:setup`). | `./tests/setup/setup_script.test.sh` retorna 0 en CI local y se integra a `npm test` o `make test`. |
| C3.2 – Observabilidad mínima | Añadir banderas `--verbose`/`--no-color` y logs estructurados (prefijos `[INFO]`, `[WARN]`, `[ERROR]`) para facilitar debugging. | Actualización de `setup.sh` + documentación en plan. | Ejecutar script con `--verbose` y comprobar que imprime comandos ejecutados. |
| C3.3 – Integridad de contextos | Extraer a función reutilizable la actualización de `.context/project-state.json`, validando que `date -u` exista y ofreciendo fallback en macOS (usar `python - <<'PY'`). | Nueva función `utc_timestamp` + pruebas manuales documentadas. | `./scripts/setup.sh` genera timestamps con la misma forma en Linux/macOS (validado por script quickcheck). |
| C3.4 – Guardas para Makefile | Detectar ausencia de `docker-compose.dev.yml` y mostrar advertencia durante el setup (sin fallar). | Mensaje adicional + checklist actualizada. | Ejecutar script sin el archivo y confirmar que se imprime la advertencia. |

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
