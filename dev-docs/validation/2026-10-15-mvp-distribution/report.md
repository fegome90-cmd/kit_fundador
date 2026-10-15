# Informe de auditoría y ejecución — Kit Fundador LEGO MVP

**Fecha:** 15 de octubre de 2026 · **Rama auditada:** `feat/lego-mvp-scaffold` · **Dictamen:** **GO para bootstrap aislado de proyectos nuevos**; **NO-GO para sustituir Express en `main`, despliegue público o distribución productiva de los cuatro bloques**.

## 1. Objetivo y decisión revisada

Se ejecutó el plan `dev-docs/plans/lego-mvp-distribution-2026-10-15.md`. La revisión rechazó trasladar al primer producto el instalador Python/Docker/journal del laboratorio (necesario únicamente al modificar consumidores ya existentes) y rechazó una CLI propia que duplicara un sistema de plantillas.

**Arquitectura elegida:** `giget@3.3.1` obtiene **una subcarpeta** fijada por **SHA de commit de 40 caracteres**; `pnpm@11.25.0` instala con lockfile propio. Dos opciones independientes:
- `templates/fastify-core`: `fastify@5.12.7` como **única** dependencia directa de ejecución.
- `templates/fastify-openapi`: el mismo core + `@fastify/swagger@9.9.2` y `@fastify/swagger-ui@6.1.2`. La UI no está activada por defecto.

Se preservaron los prototipos de PostgreSQL, Drizzle, Better Auth y BullMQ/Valkey bajo `dev-docs/validation`; **no se presentaron como producto terminado** ni se incorporaron al core.

## 2. Evidencia primaria

- **Commit de plantillas efectivamente probado con giget:** `69b7873721a2693e58289631eea03482be8afe62`.
- **Workflow completo:** [LEGO MVP distribution (isolated), run 38725632148](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38720093190), conclusión `success`, mismo SHA de commit.
- **Run previo:** [38719749137](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38719749137), primera prueba de giget por SHA y rechazo de directorio ocupado, `success`.
- El lockfile de la variante OpenAPI se generó mediante un install auténtico de pnpm y quedó versionado; el workflow tuvo temporalmente permiso de escritura para ese único archivo y **se restauró a `contents: read`** inmediatamente después. La CI definitiva exige el lockfile existente; **no lo regenera**.
- El pipeline tradicional de Express permanece separado del pipeline `lego-mvp-distribution.yml`.

## 3. Matriz final de gates

| Gate | Core | Core + OpenAPI | Evidencia y matiz |
|---|---|---|---|
| Node 24 y pnpm 11.25 | **PASS** | **PASS** | Ubuntu 24.04 Github-hosted, versiones pinneadas |
| Descarga `giget@3.3.1` usando ref SHA completo | **PASS** | **PASS** | Proyecto nuevo fuera del repo; origen `gh:fegome90-cmd/kit_fundador/templates/...#b851...` |
| Rechazo de carpeta destino ocupada | **PASS** | **PASS** | Sin `--force`, sentinel intacto |
| `pnpm install --frozen-lockfile --strict-peer-dependencies` | **PASS** | **PASS** | Sobre checkout y proyecto descargado |
| `tsc --noEmit` con `strict` y `skipLibCheck:false` | **PASS** | **PASS** | Sin ocultar fallos en declaraciones de terceros |
| Tests nativos Node sobre artefacto JS compilado | **12/12 PASS** | **15/15 PASS** | Los mismos se repitieron después de descargar con giget |
| Configuración `PORT`/`HOST` inválida | **PASS** | **PASS** | Fallo antes de `listen` |
| Health, 400/404/413/500 y cuerpo 500 sanitizado | **PASS** | **PASS** | `app.inject` real de Fastify |
| Cabeceras de protección, request ID, CORS no permisivo | **PASS** | **PASS** | No implica seguridad de proxy ni `helmet` |
| SIGTERM y SIGINT contra `node dist/server.js` | **PASS** | **PASS** | Se observó exit code 0 |
| Token de consulta en logs de salida | **PASS** | **PASS** | Canary `CANARY_DO_NOT_LOG_849312` ausente; request logging automático deshabilitado |
| OpenAPI/UI apagados por defecto | N/A (paquetes ausentes) | **PASS** | `/docs/` y `/docs/json` = 404 |
| OpenAPI habilitado cubre `/health` y sirve UI | N/A | **PASS** | Swagger antes de rutas, UI después |
| Dependencias directas acotadas | **1** | **3** | Gate CI de frontera de dependencias |
| Identidad del core en ambas variantes | **PASS** | **PASS** | `cmp` de `app.ts`, config, runtime, health, tests y tsconfig |
| `pnpm audit --prod --no-optional` | **PASS** | **PASS** | `No known vulnerabilities found` en fecha de prueba |
| `pnpm audit` completo (dev y opcionales incluidos) | **PASS** | **PASS** | `No known vulnerabilities found` en fecha de prueba |
| Ausencia de PostgreSQL, Redis, BullMQ, Auth, React y Docker en Core | **PASS** | **PASS** | Sin servicios en boot, imports ni deps runtime |

**Total:** 27 casos de prueba definidos a través de las dos variantes, más checks automáticos de distribución, paridad, typecheck y auditoría. No duplicar el conteo al ejecutarlos una segunda vez después de descargar.

## 4. Defectos reales encontrados y correcciones

1. **TypeScript TS18046:** el error de Fastify en el error handler está tipado `unknown`. Se corrigió leyendo `statusCode` después de estrechar el tipo, sin habilitar `skipLibCheck`. Los primeros workflows rojos conservan evidencia.
2. **Riesgo de filtración de parámetros URL:** el logging HTTP automático puede incluir query strings. Se deshabilitó el logging de accesos automático, conservando logs JSON estructurados y errores genéricos con request ID. Se añadió prueba de canary sobre stdout/stderr.
3. **Lockfile OpenAPI ausente:** se generó mediante un `pnpm install --lockfile-only` real en CI, se versionó y se restituyó el permiso `contents:read` del workflow. El último run verificó instalación congelada y auditoría completa.
4. **Riesgo de deriva entre variantes:** CI compara byte por byte todo archivo Core compartido. Solo `server.ts`, documentación, configuración de paquetes y pruebas OpenAPI difieren deliberadamente.

## 5. Auditoría de seguridad y límites no negociables

- **GO-MVP significa bootstrap aislado, no servidor de producción.** No hay autenticación, autorización, TLS, rate limiting, persistencia, telemetría, `@fastify/helmet` completo ni protección de Swagger UI en un entorno público.
- **No hay control de origen sobre el instalador giget tan profundo como un SLSA attest:** se pinneó `giget` por versión npm y el origen de los archivos por SHA GitHub. No se certificó la procedencia de todos los tarballs más allá de sus integridades pnpm y auditoría.
- **Código duplicado:** dos subdirectorios precompuestos y testeados, en lugar de un sistema de composición arbitraria. CI de paridad mitiga deriva, pero requiere mantenimiento explícito.
- **Node 24 es el baseline:** no se verificó Node 22 ni 26, Windows, macOS u otros filesystems. Las instrucciones usan sintaxis Unix y ofrecen nota Windows para `DOCS_ENABLED`.
- **Validación HTTP:** los tests cubren la superficie mínima descrita, no amenazas complejas, saturación ni estrés. No reutilizar el ejemplo con pacientes, credenciales clínicas ni datos sensibles sin arquitectura de seguridad adecuada.
- **GitHub Actions:** algunas acciones v4 emiten advertencia de Node 20 deprecado; mantenimiento CI pendiente, no falso fracaso de la aplicación en Node 24.
- **Sin cutover legado:** `main`, `src/`, `web/` y plantillas históricas `templates/typescript`, `templates/python` no se modificaron; los E2E con cuatro bloques son fuente de evidencia experimental, no parte del release.
- **Sin instalador in-place:** una instalación sobre proyecto con personalizaciones queda fuera de este contrato; no se copió `lego_safe.py` ni su journal al MVP.
- **Sin distribución npm/Homebrew:** no existe `create-kitfundador` publicado, tap Brew, marketplace VS Code ni extensiones; para bootstrap se usa `giget` existente.

## 5bis. Auditoría de código independiente de la PR #79 (15-10-2026)

**PR:** https://github.com/fegome90-cmd/kit_fundador/pull/79 — mantiene estado **draft**, sin merge. Se revisaron `src/app.ts`, `src/runtime.ts`, composición Swagger, pruebas de errores, tests de logging, lockfiles, CI y bootstrap giget.

| Hallazgo | Severidad | Solución y evidencia |
|---|---|---|
| Event listeners `SIGTERM/SIGINT` acumulados cuando una app es cerrada fuera del manejador de señales | P1 / ciclo de vida | Hook `onClose` retira los handlers; test inicia, cierra y comprueba `listenerCount` |
| Configuración `PORT/HOST` inválida dejaba `app` creado sin ejecutar teardown | P1 / recursos | `listen()` cierra el Fastify app incluso si falla `readServerConfig`; prueba cuenta cierre |
| Puerto ocupado no se probaba como error de arranque | P1 / edge case | Test con servidor `node:net` ocupando el puerto; verifica `EADDRINUSE` y ausencia de manejadores residuales |
| `disableRequestLogging` top-level deprecado en Fastify 5 (`FSTDEP023`) | P1 / compatibilidad | Uso del `LogController` oficial con `disableRequestLogging:true`, sin registrar parámetros URL |
| Title RFC 9457 incorrecto para 403 y 502 | P2 / protocolo HTTP | Uso de `STATUS_CODES[status]` y tests del body `application/problem+json`; errores privados no se exponen |
| Test añadía una nueva ruta después de una primera llamada `inject()` | P1 / tests | Definir rutas antes de inicializar el router. Fallo y fix quedaron en GitHub Actions |
| `SIGINT` no tenía E2E contra JS compilado | P2 / regresión | Ejecuta SIGTERM y SIGINT en procesos distintos y verifica salida cero |
| giget en directorios ocupados no verificaba inventario completo/symlink | P1 / no destrucción | CI prueba archivo sentinel, inventario exacto y symlink hacia directorio poblado |
| CI por push + PR duplicaba ejecución en la rama de revisión | P2 / coste CI | Sólo investigación por push; `pull_request: main` para branch de PR, `concurrency.cancel-in-progress` |

**Prueba concluyente de source y distribución tras fixes:** [run 38725632148](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38725632148) **PASS** (12/12 Core, 15/15 OpenAPI en checkout y proyecto descargado por SHA). La auditoría completa `pnpm audit` y el typecheck con `skipLibCheck:false` conservaron estado PASS. Esto no demuestra seguridad de producción ni ausencia universal de bugs.

**CodeRabbit:** el PR estaba marcado `draft`; se solicitó manualmente un full review, pero el bot canceló ese intento porque la rama cambió mientras analizaba. Se requiere solicitar nuevamente cuando termine la corrección de los hallazgos, para que exista una revisión externa válida.

## 6. Aislamiento realizado para revisión

**PASS:** se creó `feat/lego-mvp-scaffold` desde `main` en un único commit `ae8e6f232e996f9b75f8b36c3f4e5c80e04c0f0e`, con **34 archivos** y ningún archivo de los prototipos experimentales. La comparación GitHub confirmó `ahead=1`, `behind=0` y cero rutas fuera de las plantillas, el workflow MVP, el quickstart y los dos informes. El origen está en `feat/fastify-lego-foundation`; el backend Express existente permanece intacto.

**Gate ejecutado:** PR #79 abierta en borrador; se revisaron errores HTTP, lifecycle y CI. **Pendiente:** revisión externa válida de CodeRabbit y eventual aprobación humana. No fusionar antes de review humano/CodeRabbit y verificación de seguridad. No integrar automáticamente el código de cuatro piezas A/B.

No autorizar despliegue público solo porque el starter de Fastify pase CI. Para ese objetivo requerir revisión de threat model, middleware/cabeceras de seguridad, control de acceso, rate limit y observabilidad, según la aplicación.

## 7. Dictamen

**GO para el flujo de descarga y arranque de las dos plantillas minimalistas desde el commit verificado**. **NO-GO para publicar Kit Fundador como framework general o liberar el instalador in-place y los cuatro bloques productivos**. Esta separación preserva el valor demostrado por los E2E anteriores sin imponer complejidad ni dependencias externas a todo proyecto nuevo.

Instrucciones de uso: [`LEGO-MVP.md`](../../../LEGO-MVP.md). Plan y auditoría previa: [`dev-docs/plans/lego-mvp-distribution-2026-10-15.md`](../../plans/lego-mvp-distribution-2026-10-15.md).
