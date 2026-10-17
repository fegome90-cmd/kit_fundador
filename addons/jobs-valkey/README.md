# Jobs / BullMQ + Valkey — pieza LEGO optativa

**Experimental y no apta para producción.** `addons/jobs-valkey` contiene un productor reutilizable y un worker Node independiente que procesa el trabajo versionado `digest-text` calculando SHA-256 y el tamaño UTF-8 de una cadena sintética. No instala nada en los starters Fastify; nunca inicia Valkey, HTTP, DB, sesiones o un worker por importar un módulo. **No usar texto clínico, datos de pacientes, secretos ni tokens en cargas de prueba**.

## Dependencias y ejemplo

Node 24, pnpm 11.25; BullMQ 6.3.15, ioredis 6.0.0; Valkey 8.1.4 probado por CI. Se requiere servicio Valkey explícito y URL `redis://127.0.0.1:6379` **solo loopback**, o `rediss://` para conexiones externas con TLS. No hay Compose obligatorio.

```sh
cd addons/jobs-valkey
pnpm install --frozen-lockfile --strict-peer-dependencies --ignore-scripts
pnpm run typecheck
pnpm test # requiere VALKEY_URL sobre Valkey aislado
VALKEY_URL=redis://127.0.0.1:6379 pnpm run worker
```

El productor se registra solo cuando lo pide el consumidor:

```ts
import { buildApp } from './app.js';
import { createJobsPlugin } from '@kit-fundador/jobs-valkey';

const app = buildApp({
  beforeRoutes(core) {
    core.register(createJobsPlugin({
      valkeyUrl: process.env.VALKEY_URL ?? '',
      registerRoutes(scope, producer) {
        // Definir rutas del negocio CON autenticación, autorización y ownership.
        // No se crea ninguna ruta predeterminada de enqueue/consulta.
        void scope;
        void producer;
      },
    }));
  },
});
```

`openDigestProducer()` devuelve `enqueueDigest({version:1,text})`, `getDigestStatus(jobId)` y `close()`. Nunca exponer `getDigestStatus` a desconocidos: incluso los hashes pueden constituir datos derivados sensibles. Payload restringido a `{version,text}`, máximo 16 KiB, sin campos arbitrarios ni secretos. Misma cadena produce el mismo ID SHA-256 **mientras el job permanezca retenido**; no garantiza deduplicación permanente. Cada proyecto debe adoptar una estrategia propia de idempotencia y autorización por recurso.

El worker `src/worker-entry.ts` es un **proceso distinto** y no hereda la sesión HTTP. No enviar `actorId` como sustituto de permisos validados. La cola usa máximo 3 intentos con backoff exponencial, retiene un máximo de 1000 resultados por estado y limpia por antigüedad. Producer falla rápido si Valkey no responde; Worker reintenta conexiones y acepta cierre SIGTERM/SIGINT.

## Valkey y seguridad operativa

**Requisitos para servir jobs:** `maxmemory-policy noeviction`, persistencia AOF activada (política fsync según riesgo), instancia privada/no expuesta y autenticación/TLS fuera de loopback. La CI usa un contenedor efímero; no es prueba de restore ni HA. BullMQ entrega al menos una vez; el job puede ejecutarse **más de una vez** tras caída/reanudación, por eso el handler de ejemplo no produce efectos colaterales. No asumir atomicidad entre PostgreSQL y `queue.add`: casos críticos necesitan outbox transaccional. No utilizar `keyPrefix` de ioredis; BullMQ tiene prefijo propio.

NO-GO producción: no incluye dead-letter/exploración operativa, métricas y alertas, ACL por comando, autoscaling, recuperación de Valkey tras failover, idempotencia de efectos externos, backup/restores, protección multi-tenant ni outbox. Exige pruebas adicionales en cada entorno real. La rama PostgreSQL BullMQ es alternativa, no combinar ambos backends para una misma cola.

Fuentes primarias: [BullMQ producción](https://docs.bullmq.io/guide/going-to-production), [Conexiones](https://docs.bullmq.io/guide/connections), [Idempotencia](https://docs.bullmq.io/patterns/idempotent-jobs), [Valkey compatibilidad](https://github.com/valkey-io/valkey-doc/blob/main/topics/migration.md).
