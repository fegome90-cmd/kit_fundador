# Auditoría de ejecución — LEGO PostgreSQL / Drizzle

**Fecha:** 16 de octubre de 2026 · **Rama:** `feat/lego-postgres` · **Base:** `main@0e55d0884239c5687522b08f4781a652b7fa2c6c`.
**Decisión:** **GO-LAB / GO-PR condicionado** para probar add-on PostgreSQL aislado. **NO-GO para distribución general, producción y merge automático.**

## Alcance verificado

Se implementó únicamente `addons/db-postgres` con schema `lego_app`, un plugin Fastify opt-in y Drizzle ORM/Kit. Fuentes directas fijadas: Fastify 5.12.7 (peer), `drizzle-orm@0.45.4`, `pg@8.23.1`, `drizzle-kit@0.31.11`; Node 24, pnpm 11.25.0. El lockfile y archivos `drizzle/0000_init.sql`, `meta/0000_snapshot.json` y `meta/_journal.json` fueron **generados realmente** por CI de un solo uso [run 38956587599](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38956587599); retiramos el workflow temporal y conservamos `contents: read`.

No se modificaron `templates/fastify-core`, `templates/fastify-openapi` ni `examples/identity-access`. No se introdujeron Better Auth, Redis/Valkey, BullMQ, marketplace, instalador transaccional ni generación in-place.

## Evidencia CI ejecutada en PostgreSQL verdadero

**Última validación funcional sobre código verificado:** [PostgreSQL E2E run 38958745568](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38958745568) y [CI heredada run 38958745552](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38958745552), ambas **success** para `a0edb8fe00f709f2bac544b3b0a057efbb274294`; Node 24, PostgreSQL 16.15 efímero. El add-on aprobó **7/7** pruebas Node con los dos casos de socket/host añadido; regresión heredada **111 PASS, 2 omitidas**, Identity Access standalone **9/9 PASS**. Auditoría de producción: sin vulnerabilidades conocidas; auditoría completa: **1 moderate, 0 high/critical**. **Este resultado no resuelve D-01 ni D-02.**

- [LEGO PostgreSQL (isolated) — run 38957656346](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38957656346), **success** en commit `d215ff77776649fe53b17fa60b9077e75b5548b7`. GitHub-hosted Ubuntu 24.04, servicio PostgreSQL `postgres:16.15`, credenciales sintéticas efímeras.
- [CI heredada — run 38957656348](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38957656348), **success** en mismo commit. 111/113 tests ejecutados/aprobados, 2 omitidos; la suite independiente previa de Identity & Access aprobó 9/9.
- El add-on se copió a directorio temporal sin manifest padre: `pnpm install --frozen-lockfile --strict-peer-dependencies --ignore-scripts`, TypeScript `strict:true` sobre código propio, `drizzle-kit check`, build NodeNext y 7/7 pruebas Node nativas, todos **PASS**.
- `drizzle-kit migrate` se ejecutó **dos veces**. Journal `drizzle.__drizzle_migrations`: **una** entrada; tabla `lego_app.notes`: una tabla. Ninguna migración corre al arrancar Fastify. Marcador: `LEGO_PG_MIGRATIONS_APPLIED_ONCE`.
- Rol `lego_app_ci` creado por la migración CI: acceso `CONNECT`, `USAGE` y DML al esquema, sin `CREATE` ni permisos de lectura sobre el journal Drizzle ni tabla ajena. Tres pruebas negativas denegadas por PostgreSQL con SQLSTATE `42501`.
- Pruebas: núcleo sin plugin sigue con health y 404 de datos; URL ausente, mal formada o servicio caído abortan inicio sin exponer secreto; insert/select de datos mediante Drizzle tipado, cadenas de inyección tratadas como dato; al cerrar Fastify, `pg_stat_activity` no conserva conexiones del pool.
- Integración del *Core* compilado en otra carpeta, con el plugin registrado por `beforeRoutes`, sin editar `src/app.ts` ni agregar dependencias a la plantilla de origen: marcador `LEGO_PG_CORE_COMPOSITION_PASS`.

## Hallazgos y límites de seguridad

**D-01 — declaraciones Drizzle upstream, no corregidas.** La primera [CI 38957279002](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38957279002) falló con **70 errores** TS en `drizzle-orm@0.45.4` bajo `skipLibCheck:false` (70/70 desde `node_modules/.pnpm/drizzle-orm@`). Símbolos implicados: Gel, MySQL, SingleStore, SQLite y PG. Coincide con [drizzle-orm#5187](https://github.com/drizzle-team/drizzle-orm/issues/5187). **NO-GO para declarar verificación completa de .d.ts**. Como excepción de laboratorio, TypeScript mantiene `strict:true` con `skipLibCheck:true` y CI ejecuta separadamente `tsc --noEmit --skipLibCheck false`: exige que todos los errores estén confinados a Drizzle 0.45.4 y publica `PG_UPSTREAM_DECLARATION_WAIVER 70`; si aparece un error diferente, falla. No afirmar `skipLibCheck:false PASS`.

**D-02 — advisory moderado en dependencia de desarrollo, no corregido.** La auditoría `pnpm audit --prod --no-optional` devuelve `No known vulnerabilities found`. La auditoría **completa** devuelve 1 **moderate**, 0 high, 0 critical. Artefacto JSON del run 38957656346, ID `12071760756`: `GHSA-67mh-4wv8-2f99` en `esbuild@0.18.20`, ruta `drizzle-kit -> @esbuild-kit/esm-loader -> @esbuild-kit/core-utils -> esbuild`, `dev:true`. Advisory de exposición de *development server*, no evidencia de explotación en backend PostgreSQL. [Drizzle issue #5304](https://github.com/drizzle-team/drizzle-orm/issues/5304). Se registra explícitamente, sin un override inseguro ni fingir que quedó reparado; `pnpm audit --audit-level high` exige cero vulnerabilidades altas o críticas. Herramientas de build se ejecutan solo en CI temporal sin checkout credentials.

**D-03 — cobertura de producción no demostrada.** No se probaron TLS con certificado CA, cargas reales, rotación de credenciales, despliegue externo, escalado de pools múltiples, migraciones *expand/contract*, backups/restore, failover, drift externo, ventanas de upgrade ni migración de datos reales. No hay sesiones ni autorización de usuario final, tampoco multi-tenant. Todo dato insertado fue sintético. La imagen de Postgres está fijada por tag, no digest de imagen firmado.

**D-04 — cierre por revisión humana.** Las CI de laboratorio no autorizan publicar un paquete npm/shadcn ni aplicar la pieza sobre un repositorio ocupado. CodeRabbit publicó un hallazgo verificable; se corrigió en `a0edb8f`, se validó y el thread quedó **resuelto**. La PR permanece **draft**, sin autorización de merge. El código del consumidor pasa a su propiedad y requiere migraciones explícitas, política de upgrades y observabilidad antes de producción.

## Dictamen

**GO limitado:** primer add-on optativo integrable, reproducible y probado con PostgreSQL verdadero y cuenta de mínimo privilegio. **NO-GO de release:** depende de resolver/aceptar explícitamente D-01 y D-02, además de seguridad, restore y operaciones del despliegue real. El *Core* mantiene 0 dependencias de persistencia y no crea pools al iniciar.

## CodeRabbit CR-01 (16-10-2026)

La revisión de [PR #82](https://github.com/fegome90-cmd/kit_fundador/pull/82) detectó que las URLs de socket Unix `postgresql:///db?host=/var/run/postgresql` (soportadas por `pg-connection-string`) no superaban el gate que exigía `hostname`. Se corrigió la validación para admitir un `host` query no vacío cuando no existe hostname, conservando rechazo cuando faltan ambos. Se añadieron dos pruebas negativas: socket inexistente produce error seguro de inicialización sin DSN, y URL vacía sin host falla antes de conectar. No se habilita ningún socket por defecto ni se amplía el conjunto de protocolos.
