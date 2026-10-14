# Auditoría de continuación — Aislamiento, recuperación y runtime reducido

**Fecha:** 2026-10-14 · **Estado:** **GO-LAB / NO-GO para distribución o producción**.
**Repositorio:** `fegome90-cmd/kit_fundador` · **rama:** `feat/fastify-lego-foundation`.
**Punto de partida:** auditoría `dev-docs/validation/2026-10-14-gh-actions/registry-composition-audit.md` (commit `134990699a80ee2700c5735dc0fd254a06432969`).

## 1. Objetivo

Continuar con tests verificables sin integrar todavía el instalador al backend original. Prioridades: minimizar exposición de archivos sensibles durante instalación, asegurar recuperación **explícita** después de interrupción, verificar que la instalación de producción sin dependencias opcionales mantiene funcionalidad y preservar fallos de seguridad como evidencia.

## 2. Evidencia ejecutada

| Gate | Estado | Fuente |
|---|---|---|
| Nuevas pruebas negativas del instalador, rollback y journaling | **PASS 26/26** | [GitHub Actions registry safety](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38565414086) |
| Instalar ambas recetas A/B con shadcn real | **PASS** | Mismo workflow de registry |
| Preflight preview y diff sin tocar consumidor | **PASS** | Mismo workflow |
| No presentar archivos ajenos a receta al proceso de staging | **PASS** | Fake CLI falla si ve `private/credentials.json`/`secrets.txt` del consumidor; test pasa |
| HOME aislado y variables del instalador filtradas | **PASS limitado** | Fake CLI comprueba que HOME usa carpeta temporal; sin sandbox OS |
| Journal persistente antes de escribir archivos | **PASS** | Suite de fallos; manifest con old/new SHA256 y copias de recuperación, permisos 0700/0600 |
| SIGKILL en medio de commit de shadcn real | **PASS** | `SAFE_REAL_SIGKILL_RECOVERY_PASS` en GitHub Actions |
| Segunda instalación cuando existe journal | **PASS** | Rechazo y recuperación manual obligatoria |
| Recuperación con archivo editado después del crash | **PASS** | No sobrescribe; rechaza hasta reconciliar |
| Journal corrupto o con path traversal | **PASS** | Rechaza sin mutar archivos |
| Auditar runtime reducido de ambas recetas | **PASS condicionado** | [GitHub Actions registry safety](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38564515374): `pnpm audit --prod --no-optional` verde A/B |
| Runtime reducido: signup, sesión, route guards, worker real A/B | **PASS** | [GitHub Actions E2E](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38564890494) |
| Regresión E2E tras HOME aislado | **PASS** | [GitHub Actions E2E](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38565098359) |
| CI raíz tras actualizaciones de journaling | **PASS** | [CI](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38565414016) |

Todas las pruebas se ejecutaron en Linux Ubuntu 24.04 GitHub-hosted. La suite usa Node 24, pnpm 11.25 y fixtures/laboratorios versionados; PostgreSQL y Valkey son contenedores efímeros solo en el E2E.

## 3. Archivos modificados y propiedad

| Ruta | Cambio |
|---|---|
| `dev-docs/validation/2026-10-13-work/lego_safe.py` | Staging limitado, HOME temporal, exclusión de secretos, integración del journal y subcomando `--recover` |
| `dev-docs/validation/2026-10-13-work/lego_transaction.py` | Lock de instalación, backup persistente previo, reemplazos atómicos por archivo, validación de integridad y recuperación conservadora |
| `dev-docs/validation/2026-10-13-work/test_lego_safe.py` | 26 escenarios del wrapper/recuperación, negativos y regresión |
| `dev-docs/validation/2026-10-13-work/test_registry_real.sh` | SIGKILL sobre shadcn real, runtime sin opcionales y auditoría de ambos consumidores |
| `.github/workflows/lego-e2e-validation.yml` | Repetición completa del contrato de Auth+worker después de podar opcionales/devDependencies |

Todo permanece aislado en `dev-docs/validation` y workflows experimentales. No se modificaron `src/`, `web/`, `templates/`, `main`, ninguna DB existente ni despliegues.

## 4. Cómo funciona la recuperación

1. Se validan todas las recetas, dependencias, archivos de destino y versiones.
2. La herramienta crea un **lock exclusivo** `.lego-install-txn` para impedir un segundo instalador durante el montaje.
3. shadcn ejecuta instalación en un directorio temporal que recibe **solo** package.json, pnpm-workspace.yaml, lockfile, tsconfig.json y targets de registry ya existentes.
4. Antes de modificar el consumidor, se escribe y sincroniza un `manifest.json` con hash y respaldo de cada archivo modificado.
5. Cada reemplazo es atómico por archivo, no como conjunto.
6. Si la operación falla por excepción controlable, intenta recuperación inmediata. Si termina por SIGKILL, el journal queda para ejecutar `python3 lego_safe.py --project <ruta> --recover`.
7. La recuperación comprueba **todas** las rutas y hashes antes de modificar. Si un archivo fue editado por el usuario después del crash, **rechaza** el proceso; no pisa silenciosamente esos cambios.

**Importante:** esto no constituye ACID general. `fsync` depende de soporte del sistema de archivos y no hemos probado caída eléctrica, volumen de red, procesos externos concurrentes ni fallo físico. El instalador tampoco revierte scripts npm o efectos de red.

## 5. Seguridad de dependencias y afirmaciones permitidas

- `pnpm audit --prod` (incluye opcionales) sigue reportando el aviso `GHSA-67mh-4wv8-2f99` (`esbuild@0.18.20`, moderado), incorporado de forma transitiva por Better Auth/Drizzle Kit.
- El mismo consumidor con `pnpm install --prod --no-optional` pasó `pnpm audit --prod --no-optional` **y** un E2E real de Auth y jobs (en ambas variantes). Esta es una **configuración de despliegue propuesta**, no una solución upstream del advisory ni una aprobación de la cadena completa.
- La CLI shadcn de laboratorio tiene un advisory alto conocido de `braces` (según la auditoría previa). Es herramienta de build, pero sí ejecuta código con permisos del usuario: requiere origen revisado y ejecución en sandbox.
- El advisory esbuild se refiere específicamente a su *development server*; un backend Fastify que no utiliza ese servidor no equivale automáticamente al escenario vulnerable, pero el lockfile incluye el paquete si se permiten opcionales. Referencia: https://github.com/advisories/GHSA-67mh-4wv8-2f99
- Mantener separadas las afirmaciones `audit completo FAIL`, `audit runtime no-optional PASS` y `E2E runtime no-optional PASS`.

## 6. Riesgos y decisiones abiertas

| ID | Severidad | Problema | Criterio para cerrar |
|---|---|---|---|
| B-01 | **Bloqueante publicación** | shadcn y pnpm pueden ejecutar scripts locales; HOME temporal no es sandbox | Entorno aislado con límites de FS/red o ejecución solo en proyecto nuevo/clon limpio, registries confiables fijados |
| B-02 | **Bloqueante publicación** | Repositorios de registry pueden cambiar entre preflight y descarga por shadcn | Fijar SHA/versiones y/o servir snapshot inmutable previamente verificado, luego comprobar integridad de bytes |
| B-03 | Alto | Aborto/pérdida eléctrica en mitad de journal/fsync no probado | Test SIGKILL antes/durante manifest, fsync, fallo disco y validación cruzada macOS si será soportado |
| B-04 | Alto | Toolchain high `braces`, transitivas opcionales `esbuild` y 72 errores externos de `.d.ts` | Gestión upstream/waiver formal y matriz de auditoría, no ignorarlos por CI verde |
| B-05 | Alto | Fixture de Auth tiene esquemas y rutas orientadas a laboratorio | Extraer configuración segura de producción, cookies HTTPS, CORS, multiusuario/tenancy, least privilege |
| B-06 | Medio | Instalador Python de ~600 LOC (incluye journal) + fixtures no es distribución mínima definitiva | Evaluar recorte, paquete/CLI estándar, documentación de ownership/upgrade |
| B-07 | Medio | Ausencia de prueba sobre consumers macOS/Windows y filesystem alternativo | Matriz de plataformas soportadas, rutas, locking, permisos y fallos |
| B-08 | Alto | A/B solo trabajos sintéticos y sin carga concurrente sobre auth | Benchmark de casos reales, recuperación DB, backup, red y aislamiento |

## 7. Siguiente recorte recomendado

Preservar el **core Fastify mínimo** desacoplado. No trasladar aún todo `dev-docs/validation/` a plantillas de producción: los scripts contienen fixtures, dependencias de herramientas y lógica experimental. Para la distribución inicial, preferir repositorios nuevos vacíos y registries versionados; permitir modificación de consumidores existentes solo después de decidir el modelo de sandbox/provenance y de recuperación multiplataforma.

**Dictamen:** resultados E2E y de journaling representan un avance verificable; **GO para continuar con pruebas y separación de bloques**. **NO-GO para release/merge de un marketplace o instalador productivo.**