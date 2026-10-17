# RFC — Jobs Valkey como add-on optativo (Kit Fundador LEGO)

**17-10-2026 · Rama `feat/lego-worker-valkey` · Base `main@66cd685c8ce16bd82ca249c6f81d462675fa980e`**

## Decisión y evidencia

Después de PR #79 Core, #80 seguridad registro, #81 aislamiento Identity, #82 PostgreSQL y #83 Better Auth, el siguiente elemento es **`addons/jobs-valkey`**, con BullMQ 6.3.15 y Valkey 8.1.4 como servicio efímero, Node 24 y pnpm 11.25.0. Se seleccionó backend Redis-compatible porque la investigación de 14-10-2026 ejecutó 6/6 casos Valkey en laboratorio (rama `feat/fastify-lego-foundation`). **No se mezcla con `jobs-postgres`** ni se realiza elección automática de backend.

- Producer de corta espera (`maxRetriesPerRequest:1`, offline queue false), sin rutas por defecto; Fastify plugin optativo encapsulado que abre y cierra su propia conexión.
- Worker en proceso separado, conexión con `maxRetriesPerRequest:null`, reintento ante desconexión y cierre SIGTERM/SIGINT; trabajo de demo real y determinista: resumen SHA-256+bytes.
- Payload `{version:1,text}` estricto de 16 KiB; no PII/secretos, sin cargo administrativo ni remisión de sesiones HTTP. `jobId` SHA-256 del texto para dedup mientras permanezca retenido.
- 3 intentos y backoff exponencial; resultados y fallos retenidos temporalmente para inspección, con límites. At-least-once implica no prometer exactamente una vez ni effects-once.
- Servicio debe tener `maxmemory-policy=noeviction` y AOF; CI lo comprueba en Valkey 8.1.4 real; sin Redis/Valkey no pasa runtime activado, pero Fastify Core sigue arrancando solo.
- Opciones URL requieren TLS fuera de loopback y rechazan query/fragment/db no admitidas. Credenciales nunca se exponen en errores ni logs.

## Gates antes de considerar merge

1. Reproducción desde carpeta copiada: pnpm lock congelado, pnpm scripts inertes, Node 24 + TS estricto sin waiver nuevo no probado.
2. Valkey efímero con AOF noeviction; dos conexiones del producer y worker separadas, health y salida limpia.
3. Ejecución real, duplicados, invalidaciones de payload y fallos de conexión sin secretos.
4. Reintentos, crash `SIGKILL` del worker procesando, recuperación de job sin pérdida, SIGTERM limpio.
5. Core Fastify compilado en directorio separado, sin dependencia ni rutas de jobs antes de componer; plugin explícito y cierre en onClose.
6. `pnpm audit --prod --no-optional`, auditoría full high/crítico, registro de warnings moderados y riesgos residuales.
7. Diff limitado al addon, workflow y documentación; revisión de CodeRabbit y fixes mínimos con tests sobre HEAD final.
8. **GO experimental ≠ GO producción**; merge únicamente por instrucción del usuario. No crear cola en producción ni desplegar Valkey.

## Investigación de prácticas reales

Los manuales oficiales de BullMQ recomiendan AOF y `noeviction`; productores con fallo rápido y worker con reintentos sin límite para interrupciones; `Worker.close()` para recuperar correctamente. La semántica de entrega es **al menos una vez**, con trabajos stalled que pueden repetir efectos. Valkey mantiene compatibilidad RESP Redis OSS 7.2, sin implicar compatibilidad de RDB de Redis CE >=7.4.

También se auditó el aviso de tipos de [BullMQ #4595](https://github.com/taskforcesh/bullmq/issues/4595) entre ioredis6 y `ConnectionOptions`: por eso esta receta instancia explícitamente `new Redis(url, options)` en vez de expandir `RedisOptions` sobre las opciones BullMQ; exige TypeScript estricto de código propio.

Fuentes: https://docs.bullmq.io/guide/going-to-production · https://docs.bullmq.io/guide/connections · https://docs.bullmq.io/patterns/idempotent-jobs · https://docs.bullmq.io/guide/workers/stalled-jobs · https://github.com/valkey-io/valkey-doc/blob/main/topics/migration.md
