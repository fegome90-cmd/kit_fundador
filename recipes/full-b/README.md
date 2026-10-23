# R2 · LEGO Full B (laboratorio)

**Estado:** diseño y pruebas en progreso. NO-GO para publicación y producción. Solo datos sintéticos.

## Arquitectura

Fastify Core + OpenAPI (opt-in) contiene Better Auth (pool/sesión), luego PostgreSQL (pool DML y datos), y Jobs Valkey (productor y rutas protegidas). El worker Node corre en un proceso distinto.

Las capacidades se pasan por cierres léxicos entre plugins anidados con `app.register`, sin decoradores globales ni pools compartidos.

Las notas `lego_app.fullb_notes` almacenan `owner_id`. La tabla `lego_app.fullb_jobs` asocia cada nota y propietario con un `jobId`. El mismo texto puede deduplicarse entre dos usuarios, pero **el ID hash no concede permisos**.

## Reproducibilidad y CI

El workflow `.github/workflows/lego-full-b.yml` usa Node 24, pnpm 11.25, PostgreSQL 16.15 y Valkey 8.1.4 efímeros con AOF y noeviction.

El orquestador `ci/run.mjs` copia y compila cada add-on aislado, aplica explícitamente dos veces sus migraciones, crea tres tarballs privados, y los instala por sus entradas públicas en una copia de la plantilla OpenAPI. Los archivos propios de R2 se agregan al consumidor, se resuelve un lockfile y se repite una instalación `--frozen-lockfile` en una segunda carpeta nueva. El lockfile se registra como artefacto de CI.

El paso `ci/init-db.mjs` aplica la migración de ejemplo **dos veces**, crea roles DML de aplicación y autenticación separados y exige un único asiento por cada journal de Drizzle. Nada ejecuta migraciones al iniciar el servidor.

Las pruebas exigen Core solo sin servicios, docs OFF/ON, sesiones reales, autorización 401/403, dos usuarios con texto idéntico y un job deduplicado, verificación de SHA-256, worker en proceso separado, trabajos pendientes y cierre seguro.

## Límites

Los paquetes siguen privados; nunca se publican en npm o shadcn ni se despliegan. El API de laboratorio escucha solamente en loopback. No hay outbox transaccional, exactly-once, protección multi-tenant general, backup/restore ni failover probado. Los errores de declaraciones upstream de Drizzle y Better Auth justifican `skipLibCheck:true` **solo en el consumidor** y no equivalen a certificación de tipos externos.

**Fuente:** [LEGO-ROADMAP.md](../../LEGO-ROADMAP.md), R2. GO de laboratorio no autoriza merge ni producción.

## Arranque independiente del consumidor de laboratorio

La copia del proyecto generada por el workflow dispone de dos comandos explícitos: `pnpm run start:full-b` para iniciar la API y `pnpm run worker:full-b` para ejecutar el worker en otro proceso. El `pnpm start` del starter permanece Core-only; R2 no altera la plantilla original. La API Full B exige `FULLB_DB_URL`, `FULLB_AUTH_URL`, `FULLB_AUTH_SECRET`, `VALKEY_URL` y `FULLB_BASE_URL` obligatorios; `FULLB_DOCS_ENABLED` es opcional. `FULLB_BASE_URL` debe coincidir con el origen (protocolo, host y puerto) de la API; solo acepta HOST loopback. Las migraciones y roles deben existir **antes** del arranque.
