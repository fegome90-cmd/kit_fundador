# RFC — PostgreSQL opcional para Kit Fundador LEGO

**Fecha:** 2026-10-16 · **Rama:** `feat/lego-postgres` · **Origen:** `main@0e55d0884239c5687522b08f4781a652b7fa2c6c` · **Estado:** implementación aislada y revisión requerida.

## Decisión

1. **Separar** `addons/db-postgres` de `templates/fastify-core` y `templates/fastify-openapi`: importar el núcleo no crea pools ni conexiones.
2. Usar versiones **estables ya investigadas en el E2E del 14-10-2026**: Fastify 5.12.7 (peer), Drizzle ORM 0.45.4, Drizzle Kit 0.31.11, `pg` 8.23.1, TypeScript 5.9.3, Node 24, pnpm 11.25.0. No adoptar `@rc` pese a ejemplos actuales de la documentación.
3. **Encapsulación:** exportar `createPostgresPlugin(options)` que recibe URL explícita, valida límites de pool, verifica conexión en arranque, construye una instancia Drizzle en un scope Fastify, permite registrar rutas del consumidor allí y cierra el pool con `onClose`. No añadir decoradores globales ni rutas de datos por defecto.
4. **Migraciones:** `drizzle-kit generate/check/migrate` mediante comando explícito y archivos SQL versionados, **nunca** `push` ni migraciones automáticas en `buildApp()`. Usar el esquema propio `lego_app` y bitácora `drizzle.__drizzle_migrations`.
5. **Dos identidades de base:** migrador privilegiado (solo fase deploy) y cuenta de aplicación con `CONNECT` + `USAGE` del esquema + DML explícito, sin permisos DDL. URL de migración `MIGRATION_DATABASE_URL` separada de `APP_DATABASE_URL`. No publicar credenciales ni permitir que app ejecute migraciones.
6. Sin Better Auth, sesiones, BullMQ, workers, roles de usuario de app, Homebrew, marketplace ni instalador in-place. Sin modificar los templates preaprobados.

## Gates para GO de PR (NO es GO-producción)

- G0: fuentes pinneadas; CI read-only, checkout sin credenciales; instalación congelada en directorio limpio.
- G1: TypeScript NodeNext estricto para código propio, artefacto JS compilado y node:test. La declaración completa `skipLibCheck:false` es una condición pendiente **bloqueada por Drizzle #5187**; no afirmar aprobación completa hasta corregir upstream o aprobar un cambio de arquitectura documentado.
- G2: plugin apagado: core /health sin DB ni credenciales. Activado sin URL, DSN inválida o servidor caído: error de startup legible sin secretos.
- G3: PostgreSQL 16 real efímero; migrar dos veces, comprobar historial inalterado y modelo Drizzle consistente; no migrar automáticamente al arranque.
- G4: conexión con credenciales de aplicación no administradoras; CRUD tipado; rechazar CREATE en esquema y acceso al journal; sanitización de errores/logs.
- G5: Fastify registrado explícitamente, rutas dentro de scope, liberación de recursos tras `close()`, no dejar conexiones.
- G6: construir `templates/fastify-core` en otra carpeta y componer optativamente el plugin sin alterar su código ni deps directas.
- G7: dependencias verificadas, `pnpm audit --prod --no-optional` y `pnpm audit` por separado; sin ocultar advisories.
- G8: CodeRabbit, fixes trazables, tests verdes sobre HEAD final. **Merge solo por instrucción del usuario.**

## Riesgos, mitigaciones y límites

- Las migraciones y respaldos/upgrades operativos son responsabilidad de cada consumidor. E2E de esquema fresco/repetición no prueba cambios complejos sobre datos productivos ni rollback.
- Los DSN remotos exigen TLS y validación CA según proveedor. Esta demo no sustituye una configuración de red/seguridad de producción.
- La cuenta DML de ejemplo y la migración privilegiada se crean **solo en PostgreSQL efímero del CI**; no tocar bases existentes ni almacenar secretos reales.
- `drizzle-kit` es herramienta de build, no dependencia productiva. El código copiado/instalado pertenece al consumidor: versiones y cambios de esquema requerirán revisión consciente.
- No declarar “componente publicable por registry shadcn” hasta demostrar compatibilidad/ownership, migración y gestión de conflictos.
- La primera versión no promete transacciones compartidas con colas ni autorización de acceso a datos.

## Fuentes primarias

- Drizzle PostgreSQL: https://orm.drizzle.team/docs/get-started/postgresql-new
- Drizzle generate: https://orm.drizzle.team/docs/drizzle-kit-generate
- Drizzle migrate: https://orm.drizzle.team/docs/drizzle-kit-migrate
- Fastify encapsulación: https://fastify.dev/docs/latest/Reference/Encapsulation/
- Laboratorio E2E: `dev-docs/validation/2026-10-14-gh-actions/report.md` en `feat/fastify-lego-foundation`.

## Hallazgo de auditoría (16-10-2026, primera CI)

La CI inicial [run 38957279002](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38957279002) falló en TypeScript **antes de migrar**, con 70 errores en `drizzle-orm@0.45.4` (70/70 procedentes de `node_modules`; dialectos ajenos como MySQL, SingleStore, SQLite, Gel y parte de PG). Se reprodujo en Node 24 / TypeScript 5.9.3 sin `skipLibCheck`. Coincide con el issue upstream [drizzle-team/drizzle-orm#5187](https://github.com/drizzle-team/drizzle-orm/issues/5187), abierto a octubre de 2026.

**Waiver trazable y limitado al laboratorio:** `skipLibCheck:true` evita comprobar las declaraciones defectuosas; `strict:true` sigue validando el código propio. La CI ejecuta `tsc --skipLibCheck false` en un gate de diagnóstico que **exige que todos los errores sean exclusivamente de Drizzle ORM 0.45.4**, registra el conteo y falla si aparece cualquier error externo a ese paquete, o si no consigue diagnosticar el problema. Este gate NO equivale a TypeScript de dependencias aprobado: estado G1 completo **NO-GO**, incluso con el resto de tests verdes. No instalar paquetes ficticios para ocultar errores, no parchear `.d.ts` en `node_modules`.
