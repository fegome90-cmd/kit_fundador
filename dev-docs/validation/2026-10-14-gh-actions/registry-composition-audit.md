# Auditoría de avance — composición LEGO y seguridad de distribución

**Fecha:** 2026-10-14 · **Rama:** `feat/fastify-lego-foundation` · **Veredicto:** GO para investigación en laboratorio; **NO-GO para publicar o fusionar un Kit Fundador de producción**.

## 1. Alcance y procedencia

Se continuó el trabajo documentado en `dev-docs/validation/2026-10-13-work/report.md` (commit `3a812d8`). La meta fue cerrar los gates del instalador (preview, exclusividad y rollback) y comprobar que **los cuatro bloques instalados por el registry funcionan realmente** contra PostgreSQL y Valkey. Ningún cambio se hizo en el backend Express original, frontend, plantillas de producción, `main` ni despliegues.

**Pruebas retenidas:**

- [Workflow de seguridad del instalador, 19 tests y shadcn real](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38558515255) — PASS; incluye instalación A/B, diff, idempotencia, exclusividad y rollback inyectado.
- [E2E de composición más reciente, ambos backends instalados y funcionando](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38558592888) — PASS; incluye auth fail-fast y benchmark.
- [Primera comparación A/B probada](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38553651730) — PASS exploratorio, no dimensionamiento de producción.
- [Artefacto de seguridad del registry](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38558515255/artifacts/11891780775): diffs, instalaciones, previsualizaciones y `pnpm audit --prod --json` para ambas variantes.

Los workflows se ejecutaron en GitHub-hosted Ubuntu 24.04 con Node 24, pnpm 11.25, PostgreSQL 16.15 y Valkey 8.1.4. Las credenciales son **solo de servicios efímeros de CI**; no se tocó ninguna base real del usuario.

## 2. Cambios implementados (solo laboratorio)

| Archivo | Función |
|---|---|
| `dev-docs/validation/2026-10-13-work/lego_safe.py` | Wrapper experimental: lectura de registry, validación transitiva, exclusiones, protección de archivos, `--preview`, `--diff` sobre instalación de prueba, staging y rollback por excepción |
| `dev-docs/validation/2026-10-13-work/test_lego_safe.py` | 19 tests unitarios/negativos; paquetes no declarados, versiones, symlinks, secretos de entorno, paths y rollback |
| `dev-docs/validation/2026-10-13-work/test_registry_real.sh` | Comprueba shadcn universal real sobre A y B, pnpm frozen, typecheck parcial, JS compilado, idempotencia, preview/diff y rollback inyectado |
| `dev-docs/validation/2026-10-13-work/registry.py` | Actualiza la receta Swagger UI a 6.1.2, añade migraciones Drizzle y worker separado, elimina credenciales PostgreSQL incrustadas en factories y protege auth activada sin secret/base URL |
| `dev-docs/validation/2026-10-13-work/verify_assembled.mjs` | E2E adicional contra consumidores realmente generados: salud, docs, signup, sesión, 403 admin, worker por backend y fail-fast auth |
| `.github/workflows/lego-registry-safety.yml` | Ejecuta las pruebas del wrapper y shadcn real en CI |
| `.github/workflows/lego-e2e-validation.yml` | PostgreSQL y Valkey efímeros: migraciones, auth, workers, ensamblaje A/B y benchmark |

Los prototipos previos de BullMQ PG, autenticación y benchmarks también permanecen únicamente en `dev-docs/validation`.

## 3. Resultados de gates

| Gate | Estado observado | Alcance |
|---|---|---|
| Previsualización manifest sin mutación | **PASS** | Ids transitivos, dependencias y rutas previstas; ningún archivo escrito al consumidor |
| `--diff` mediante instalación de prueba completa | **PASS** | Diff para TS y package/lock con hashes, fragmentos de hasta 40 líneas y aviso de truncamiento; sin mutación al consumidor |
| Exclusividad jobs-postgres/jobs-valkey | **PASS** | Rechazo antes de shadcn y antes de escribir archivos, incluso sin colisión de rutas |
| Instalar A/B desde shadcn real | **PASS** | `pnpm install --frozen-lockfile`, TS (`skipLibCheck`) y `node dist/server.js` en proyectos temporales |
| Reinstalación sin cambios | **PASS** | package, lock y entrypoint conservan hashes |
| Preservación de archivos del consumidor | **PASS limitado** | Rechaza destinos existentes de contenido diferente; no ofrece actualizaciones automáticas |
| Rollback por error de stage | **PASS** | Instalador simulado falla sin tocar consumidor |
| Rollback por excepción durante commit | **PASS** | Falla inducida tras segunda escritura, recupera contenido anterior y elimina nuevos archivos de esa transacción |
| Protección de rutas y symlinks | **PASS** | Rechaza traversal, targets protegidos, symlink a directorio, registry fuera de origen y paquetes inválidos |
| Protección de versiones | **PASS** | Rechaza versiones distintas a las ya presentes y dependencias adicionales no declaradas |
| Higiene del entorno del instalador | **PASS** | 19a prueba introduce un secreto señuelo que no llega al proceso hijo |
| Migraciones Drizzle trasladadas a consumidores | **PASS** | Los dos proyectos generados ejecutan Drizzle Kit contra PostgreSQL real |
| Autenticación y jobs tras instalación completa | **PASS** | Ambos proyectos nuevos: signup, private 200, admin 403 y worker separado devuelve 18 para value=9 |
| Secret/URL obligatorios al activar auth | **PASS** | E2E con arranques negativos: sin secreto o URL falla antes de escuchar |
| Recuperación fallos de workers y A/B benchmark | **PASS exploratorio** | Los tests del prototipo previos pasan; no comparar como performance de producción |
| Auditoría de dependencias producción | **FAIL** | Un advisory MODERATE por variante; detalles abajo |
| Tipado completo de dependencias de terceros | **FAIL preexistente** | `skipLibCheck=false` reportó 72 errores externos en informe Work; no resuelto |
| SIGKILL / pérdida eléctrica a mitad de commit | **NO TEST / NO-GO** | Rollback solo síncrono; no hay recovery journal persistente |
| Ejecución sin Python, Windows y macOS | **NO TEST** | `lego_safe.py` es prototipo Python; la base deseada sigue siendo Node/TS |
| Aislamiento contra un registry verdaderamente malicioso | **NO-GO** | Validaciones y filtrado de entorno no son un sandbox; shadcn/npm ejecutan procesos con permisos del usuario |

**Conteo:** 19 pruebas Python del wrapper, 3 pruebas HTTP + 3 PG/Auth/worker + 6 Valkey por corrida de E2E, dos ensamblajes completos A/B, 12 corridas de benchmark sintético con 200 jobs cada una. No sumar benchmarks a los 12 tests de Node ni extrapolarlos a producción.

## 4. Auditoría de seguridad de las dependencias

Los archivos `registry-safety-audit-prod-a.json` y `registry-safety-audit-prod-b.json` del artefacto de CI (última lectura) indican exactamente:

- **A:** 0 críticos, 0 altos, **1 moderado**, 0 bajos.
- **B:** 0 críticos, 0 altos, **1 moderado**, 0 bajos.
- El paquete reportado es `esbuild@0.18.20`, vulnerable según [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99), transitivo desde `better-auth > drizzle-kit > @esbuild-kit/esm-loader > @esbuild-kit/core-utils > esbuild`; en auditoría de producción aparece como **optional**. El aviso se relaciona con la exposición de un servidor de desarrollo de esbuild; no se ha demostrado su explotación en el servicio generado.
- La herramienta de instalación shadcn instalada **en el laboratorio** tiene un advisory adicional de `braces` (alto) en el tooling según el informe previo de Work. No se añadió shadcn al runtime de los consumidores generados; aun así, el instalador requiere evaluación propia y pinning.
- Evitar overrides ciegos y no declarar PASS de seguridad únicamente porque la funcionalidad E2E pasó. Separar gestión de advisories del core de la herramienta instaladora.

## 5. Hallazgos de revisión independiente / de seguridad

### P0-01 — Riesgo de ejecución de código de paquetes/registries

El wrapper valida origen, archivos, versiones y comportamiento de escritura, pero la etapa de instalación puede ejecutar scripts npm y tiene permisos de filesystem del usuario. El filtrado del entorno evita heredar variables sensibles comunes; **no impide leer archivos del HOME** ni elimina riesgo supply-chain. Solo usar registries de confianza, versions/SHAs fijados, restricciones de script build y aislar los builds en sandbox para fuentes externas. No anunciar 'sandbox' en el README.

### P0-02 — Rollback incompleto ante interrupción del proceso

El rollback recupera archivos ante excepciones capturadas, y el workflow lo verificó tras una segunda escritura. No hay journal/backup persistente ni protocolo de recuperación de SIGKILL, reinicio eléctrico, disco lleno a mitad de reemplazo, escritura concurrente o unmount. No publicar una garantía de transacción ACID o rollback universal.

### P1-01 — Preview recortado

`--preview` lista archivos y dependencias sin instalar. `--diff` sí instala en staging, compara package/lock y contenidos e incluye SHA-256, pero limita cada parche a 40 líneas: usar hashes/artefactos completos y revisión humana para grandes cambios. No afirmar que se revisó línea por línea un lockfile por mirar el excerpt.

### P1-02 — Tipos y configuración del backend

El typecheck del prototipo y de consumidores usa `skipLibCheck`. Hay errores en declaraciones externas y el contrato de auth aún requiere políticas explícitas de trusted origins, HTTPS, dominio de cookies, tenants y autorización por recurso. Swagger puede exponer docs sin control cuando se activa manualmente. La configuración por defecto sigue marcada como fixture de laboratorio, no despliegue de producción.

### P1-03 — Migraciones/datos y cargas

El registro demuestra migraciones repetibles y la coexistencia del esquema `bullmq` con auth en `public`. No se probaron upgrades/despliegues sin downtime, backups/restore, regresión bajo fallos del datastore ni esquema/roles de mínimo privilegio. No hay outbox transaccional ni prueba de tenencia/cambio concurrente de roles. A/B sigue siendo sintético y dependiente de un runner.

### P1-04 — Distribución y mantenimiento

El wrapper está en el área experimental Python (no es un CLI Node publicado). Las URLs del registry son loopback; no existe registry versionado por tags/SHA público ni mecanismo de migrar consumidores modificados. Los archivos distribuidos son de propiedad del consumidor y no reciben updates automáticas.

### P2 — Riesgo de PR acumulativo

Tras validación, migrar **solo bloques verdes** a plantillas de producción en PRs pequeños; mantener fixtures y trabajos históricos fuera del scaffold final. La rama no debe fusionarse como está solo por tener CI verde.

## 6. Incidencias observadas y correcciones en esta sesión

1. El primer test de rollback local detectó una operación de conjuntos inválida; se corrigió y pasó 12/12.
2. La prueba de auth sin URL inicialmente enviaba secreto vacío y falló antes de llegar al gate de URL. Se corrigió para aislar la variable; la E2E posterior pasó ambas condiciones.
3. La primera generación de la guarda de Auth escapó incorrectamente los saltos de línea, causando un fallo de compilación. Se corrigió el generador y se validaron otra vez ambas composiciones.
4. El filtrado del entorno interrumpió la prueba simulada que dependía de inyectar una variable al instalador; se rediseñó el fixture con ejecutable fallido explícito y se pasó 19/19.

Los workflow runs fallidos intermedios permanecen como evidencia, en vez de presentarlos como éxitos. Los PASS citados corresponden a ejecuciones **posteriores a sus correcciones**.

## 7. Dictamen de admisión

**GO-LAB:** seguir desarrollando y validar el mecanismo sobre clones y servicios efímeros. Se logró demostrar que la composición completa Fastify + Swagger + Drizzle + Better Auth + BullMQ sobre PostgreSQL o Valkey se instala y ejecuta en CI.

**NO-GO para publicar/merge de producción:** hasta cubrir seguridad de la distribución, recovery persistente, audit de dependencias y tipado externo, autenticación multiusuario/tenancy, configuración de producción, outbox cuando se necesite atomicidad, registry versionado y regresiones sobre hosts soportados.

**Siguiente recorte técnico recomendado:** proteger el instalador con un sandbox real y recuperación durable o restringir oficialmente el instalador a proyectos nuevos vacíos; separar las opciones de auth/jobs como plugins de prueba independientes y mantener el mínimo core Fastify sin servicios obligatorios.
