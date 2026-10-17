# Valkey Jobs — auditoría inicial (17-10-2026)

**PR:** [#84](https://github.com/fegome90-cmd/kit_fundador/pull/84) · **rama:** `feat/lego-worker-valkey` · **base:** `main@66cd685c8ce16bd82ca249c6f81d462675fa980e` · **estado:** GO de laboratorio condicionado a revisión; **NO-GO producción**.

## Arquitectura y pruebas reales

- `addons/jobs-valkey` se instala con Node 24 + pnpm 11.25 sin archivos del repositorio padre; no altera ninguna plantilla Fastify, PostgreSQL, auth o ejemplo Identity & Access.
- BullMQ 6.3.15 con ioredis 6.0.0 **versionados y congelados** en `pnpm-lock.yaml`. Se generó en GH Actions con acceso al registro real y se eliminó el bootstrap dinámico.
- Contenedor `valkey/valkey:8.1.4` efímero configurado con `appendonly yes` y `maxmemory-policy noeviction`; el test valida ambas directivas.
- Producer fail-fast y Worker con conexión separada, proceso Node independiente, SIN rutas HTTP de encolado o consulta preinstaladas. `registerRoutes` es callback de proyecto, que tiene la responsabilidad de autorización y ownership. Versión de payload explícita `digest-text`, 16 KiB máximo, SHA-256+bytes, sin payload real/PII.
- Retries 3 intentos, backoff exponencial, retención acotada y deduplicación por hash **mientras retiene el job** (no exactamente una vez). Prueba de crash `SIGKILL` *después* de iniciar un job, recuperación con nuevo Worker y resultado verificado; `SIGTERM` de worker compilado limpia su proceso.
- [Run 39034476693](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39034476693) **PASS**: 7/7 tests Node incluyendo crash/recovery, retries, dedup, validaciones, apagado, configuración AOF/noeviction; Core compilado separado e integración opt-in `LEGO_JOBS_CORE_OPT_IN_PASS`. `pnpm audit --prod --no-optional` y `pnpm audit --audit-level high` PASS, full audit **0 avisos**.
- [Run 39034476686](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39034476686) **PASS**: CI histórica de raíz e Identity Access independientes sin regresiones.

## Defectos encontrados y corregidos

- [Run 39034242559](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39034242559) no ejecutó tests porque la imagen `valkey:8.1.4` no existía en el repositorio Docker. Se corrigió a `valkey/valkey:8.1.4` oficial. No atribuir ese fallo al software.
- [Run 39034297298](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39034297298) generó el lock real, pero TypeScript detectó import por defecto no construible con ioredis 6. Se cambió a `import { Redis } from 'ioredis'` y se repitieron verificaciones. **No hay waiver nuevo de TypeScript**.

## Limitaciones y condiciones de producción

- BullMQ garantiza entrega **al menos una vez**, no ejecución exactamente una vez; se requiere idempotencia de efectos externos, límites de concurrencia y outbox para cambios DB+cola atómicos.
- La deduplicación por hash vence al eliminar trabajos retenidos; SHA-256 de texto conocido revela correlación, por eso no usar datos reales ni exponer IDs/resultados sin autorización.
- AOF habilitada no significa durabilidad perfecta ni reemplaza backups, restore y HA; la CI no prueba un reinicio real del contenedor Valkey ni failover.
- Worker en red externa requiere TLS, ACL mínimas, límites de red y tratamiento de secretos; la URL valida esquema TLS remoto pero **no certifica** certificados/infraestructura.
- Ausentes: límites de tasa distribuidos, alertas, métricas, tenant isolation, DLQ operativo, retención por categoría y migraciones de payload. `maxmemory-policy=noeviction` debe verificarse en el entorno.
- Sin registro de componentes ni despliegue; **solo add-on experimental**. Revisar CodeRabbit sobre el HEAD final, corregir hallazgos y fusionar únicamente por instrucción del usuario.
