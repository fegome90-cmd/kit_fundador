# LEGO PostgreSQL + Drizzle — opt-in, sin producción

Este directorio es el **primer add-on** de Kit Fundador. Es independiente de `templates/fastify-core` y `templates/fastify-openapi`. **No está publicado en npm, shadcn ni un marketplace**. Los consumidores deben revisar el código y las migraciones antes de adoptarlo.

## Dependencias y versiones probadas

Node 24, pnpm 11.25.0, Fastify 5.12.7 (peer), `drizzle-orm@0.45.4`, `pg@8.23.1`, `drizzle-kit@0.31.11`. Dependencias de ejecución directas: **dos** (`drizzle-orm` y `pg`). Fastify es peer; no se instala un segundo framework en producción.

## Modelo

- `createPostgresPlugin({ databaseUrl, registerRoutes })` se registra **explícitamente** dentro de `app.register(...)`. El plugin hace una conexión de prueba en `ready`, y la falla cancela el arranque sin registrar detalles de credenciales.
- `registerRoutes(scope, db)` recibe Drizzle tipado y un scope Fastify encapsulado; las rutas de ejemplo pertenecen al consumidor. **No se generan rutas CRUD ni decoradores globales** al importar el paquete.
- Se abre como máximo un pool de 4 conexiones por instancia por defecto; `app.close()` lo libera.
- Los SQL/migraciones viven en `./drizzle`. **No** se ejecutan al inicializar el plugin. La carpeta define solamente la tabla `lego_app.notes`, sin usuarios ni sesiones.
- Requiere dos DSN: `APP_DATABASE_URL` (cuenta DML) y `MIGRATION_DATABASE_URL` (cuenta capaz de crear esquemas y migraciones). Nunca expongas ninguna en URLs, logs o documentación compartida.

## Instalación independiente

```sh
cd addons/db-postgres
pnpm install --frozen-lockfile --strict-peer-dependencies
pnpm run typecheck
pnpm run build
pnpm run db:check
```

Con PostgreSQL en un entorno **descartable** ya creado, aplica una sola vez (y vuelve a ejecutar para comprobar idempotencia):

```sh
MIGRATION_DATABASE_URL='postgresql://<migrator>@<host>/<db>' pnpm run db:migrate
```

Crear y conceder los permisos necesarios para la cuenta de aplicación **fuera de este código**, con una operación de infraestructura supervisada; el CI lo demuestra con `scripts/setup-ci-db.mjs` **solo contra su servicio temporal**.

Ejemplo de composición desde una aplicación Fastify con `buildApp` del Core:

```ts
import { buildApp } from './app.js';
import { createPostgresPlugin } from '@kit-fundador/db-postgres';
import { notes } from '@kit-fundador/db-postgres/schema';

const app = buildApp({
  beforeRoutes(core) {
    core.register(createPostgresPlugin({
      databaseUrl: process.env.APP_DATABASE_URL ?? '',
      registerRoutes(scope, db) {
        scope.get('/notes', async () => db.select().from(notes));
      },
    }));
  },
});
```

Este ejemplo **no implementa autenticación, autorización ni redacción de datos sensibles de la aplicación**, de modo que no expongas esas rutas a Internet. En una API pública el acceso a cada operación se debe proteger de manera independiente.

## Qué certifica la CI

En Ubuntu 24.04, Node 24 y PostgreSQL 16.15 efímero: lockfile congelado, Drizzle Kit `check`, migrations `migrate` dos veces, cuenta de aplicación sin DDL, CRUD Drizzle, inyección de SQL como dato, ausencia de rutas por defecto, cierre del pool, rechazo de URL inválida y composición con el Core original compilado. No se requieren bases personales ni claves reales.

No garantiza respaldos, failover, upgrades online ni configuración TLS de proveedores. **El despliegue real exige TLS/CA, restauración probada, gestión externa de secretos y migraciones planificadas.** Los fixtures de laboratorio anteriores no constituyen una distribución de producción.

## Gate de tipado upstream — pendiente

Drizzle ORM 0.45.4 genera 70 errores externos en `.d.ts` cuando `skipLibCheck:false` ([issue #5187](https://github.com/drizzle-team/drizzle-orm/issues/5187)). El repositorio conserva `strict:true` para su propio código pero establece `skipLibCheck:true` solo para las declaraciones de bibliotecas. En CI se ejecuta además el chequeo completo, se contabilizan los errores y se exige que estén confinados a Drizzle. **La validación completa de declaraciones no está aprobada; no declarar esta receta apta para producción ni distribuirla sin cerrar o aceptar formalmente ese riesgo.**
