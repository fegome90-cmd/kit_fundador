# LEGO — Validación E2E con PostgreSQL y Valkey en GitHub Actions

**Fecha:** 2026-10-14 (UTC en logs). **Estado:** funcionalidad E2E verificada en laboratorio, **NO-GO para distribución/producción**.
**Rama:** `feat/fastify-lego-foundation`. **Fuente previa:** `dev-docs/validation/2026-10-13-work/report.md` (Work, commit `3a812d8`).
**Run de evidencia:** [LEGO E2E Validation — 38553651730](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38553651730), commit `05504197d7040c7e20a70b96df05490d9c2ea3f2`.
**Primer E2E íntegro:** [38553284837](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38553284837), exitoso.

## Resumen

Se resolvió **sin modificar el backend existente** el bloqueo del runner previo (no disponible PostgreSQL como usuario no root). Se creó el workflow experimental `.github/workflows/lego-e2e-validation.yml` únicamente en la rama, usando GitHub-hosted Ubuntu 24.04 y servicios efímeros de **PostgreSQL 16.15** y **Valkey 8.1.4**.

El workflow utiliza el prototipo previo `dev-docs/validation/2026-10-13-work/prototype/` y el **lockfile `ui6` de Swagger UI 6.1.2** previamente probado. No instala componentes de producción ni despliega servicios persistentes. Cada ejecución crea servicios nuevos que se destruyen al terminar.

## Gates funcionales comprobados

| Gate | Estado | Evidencia ejecutada |
|---|---|---|
| Node 24 + pnpm 11.25 + instalación congelada | PASS | GitHub job Install |
| Compilación JS NodeNext, aplicaciones TypeScript | PASS condicionado | `pnpm exec tsc --skipLibCheck`; no resuelve declaraciones externas |
| Core HTTP/OpenAPI, docs off/on, 400/404/413/500 | PASS | `node --test tests/http.test.mjs`, 3/3 |
| Migraciones Drizzle auth contra PostgreSQL real | PASS | `pnpm exec drizzle-kit migrate` 2 veces |
| Migración independiente BullMQ/PostgreSQL | PASS | `runMigrations(pg.Client)` 2 veces |
| Tablas reales de Better Auth + esquema BullMQ | PASS | 4 tablas en `public`, namespace `bullmq`, PostgreSQL 16.15 |
| Better Auth: signup, sesión, logout, login | PASS | Node test HTTP real + consultas SQL, `AUTH_PG_PASS` |
| Rol `admin` en signup público | PASS limitado | La solicitud de rol no logró promover el usuario; DB mantiene `role=user`. La suite no cubre autorización completa multi-tenant. |
| Better Auth: `/private` 401/200 y `/admin` 403 para usuario básico | PASS | Node test real |
| BullMQ/PostgreSQL: worker separado + retries | PASS | 2 intentos y resultado confirmado |
| BullMQ/PostgreSQL: SIGKILL del worker + recuperación | PASS | 2 intentos; resultado correcto tras segundo worker |
| BullMQ/Valkey: 6 escenarios regresión | PASS | `node --test tests/jobs.test.mjs`, 6/6 |
| Microbenchmark A vs B en un único runner | PASS exploratorio | 12 pruebas cronometradas, 2400 jobs, dos modos y tres repeticiones cada uno |
| Auditoría de dependencias | FAIL | `pnpm audit --json` exit 1; intencionalmente `continue-on-error`, artifact guardado |
| shadcn registry preview, exclusividad/rollback | FAIL heredado | No reparado ni revalidado aquí; evidencia Work previa |
| Tipado completo `skipLibCheck: false` | FAIL heredado | No solucionado; no atribuir PASS a `.d.ts` externas |

**Conteo verificable:** 3 pruebas HTTP + 3 pruebas PG/Auth/worker + 6 pruebas BullMQ/Valkey = **12/12 tests Node**. El benchmark añade **12 corridas de medición** con aserción del resultado de 200 trabajos cada una, separadas del conteo de tests.

## Bench A/B — mismo runner

PostgreSQL: contenedor `postgres:16.15` con WAL predeterminado. Valkey: contenedor `valkey:8.1.4`, configurado por el benchmark a `appendonly=yes`, `appendfsync=always`, `maxmemory-policy=noeviction`. Ambos accesibles en loopback desde el mismo runner Ubuntu.

**Carga:** jobs aritméticos `value*2`, 200 por corrida, concurrencia 4; secuencial y bulk; tres repeticiones de cada modo/backend, con orden A/B alternado. Se verificaron los **2.400 resultados**; job p95 se midió como `finishedOn - processedOn` y no captura el tiempo total en cola.

| Modalidad, mediana de 3 repeticiones | PostgreSQL | Valkey |
|---|---:|---:|
| Enqueue secuencial (jobs/s) | 1600.53 | 1663.75 |
| Processing secuencial (jobs/s) | 1514.59 | 2320.59 |
| Enqueue bulk (jobs/s) | 13161.51 | 15380.58 |
| Processing bulk (jobs/s) | 1293.80 | 2341.06 |
| Job p95 procesado secuencial, ms (baja resolución) | 4 | 2 |
| Job p95 procesado bulk, ms (baja resolución) | 6 | 2 |

**Interpretación:** Valkey fue alrededor de 1.53x más rápido en processing secuencial y 1.81x en processing bulk. La comparación **no demuestra capacidad de producción**: una sola VM, tres repeticiones cortas, dataset trivial, estrategias de almacenamiento no equivalentes en todos sus matices, sin prueba de impacto de jobs sobre consultas de auth concurrentes, ni failover/restore de base de datos.

**Artefacto verificable:** [auditoría y datos JSON del benchmark](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38553651730/artifacts/11888100670).

## Cambios de la rama (no de producción)

- `.github/workflows/lego-e2e-validation.yml`: ejecución experimental sobre Postgres/Valkey efímeros.
- `dev-docs/validation/2026-10-13-work/prototype/ci/pg-worker.mjs`: worker PG separado.
- `dev-docs/validation/2026-10-13-work/prototype/ci/full-pg.test.mjs`: tests PostgreSQL/Auth/recuperación.
- `dev-docs/validation/2026-10-13-work/prototype/ci/benchmark-ab.mjs`: benchmarks pareados.
- Esta nota de validación. Los archivos `src/` y `web/` originales no han sido modificados.

## Qué falta para pasar a GO de receta LEGO completa

1. **Registry:** solucionar previsualización universal, exclusividad antes de mutar y rollback transaccional (shadcn no lo entrega en la forma requerida). Pruebas negativas obligatorias.
2. **Seguridad:** remediar/adoptar excepciones documentadas de avisos npm y proteger docs de producción; el job exitoso tiene audit `continue-on-error` y **NO indica security PASS**.
3. **Tipado:** `skipLibCheck` permite verificar código propio, pero la suite con declaraciones externas falla; no marcar como typecheck completo.
4. **Autorización:** pruebas con dos usuarios, tenant ownership, CORS/CSRF y Host/proxy HTTPS con cookies realmente válidas.
5. **Robustez DB+Jobs:** transacción+enqueue/outbox, trabajos repetidos, caída de DB/Valkey durante operación, backup/restore y upgrades de esquema, aislamiento de esquemas/roles y presupuestos de conexión.
6. **Performance:** medir tráfico real concurrente de autenticación mientras funcionan workers A y B; repetir benchmarks con más cargas, contenedores y hardware.

## Estado final

**PASS:** core, OpenAPI, Drizzle migrado en PostgreSQL, auth básica real, BullMQ/Postgres worker/recovery, BullMQ/Valkey regresión, microbenchmark reproducible A/B.

**NO-GO:** distribución de la receta completa y cualquier declaración de producción. Mantener aislados los prototipos, sin merge de `main` ni despliegue.
