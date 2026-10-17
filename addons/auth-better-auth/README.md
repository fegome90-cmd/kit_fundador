# Kit Fundador — Better Auth experimental (opt-in)

Add-on de autenticación para **Fastify 5 + PostgreSQL + Drizzle**, opcional y **no productivo**. No se instala al copiar Fastify Core y no modifica Identity & Access heredado.

## Dependencias y composición

- Node.js 24, pnpm 11.25.0, Fastify 5.12.7 como peer del consumidor.
- Better Auth + adapter **1.7.10**, `drizzle-orm@0.45.4` + `pg@8.23.1`. Drizzle Kit es herramienta de build/migración; no hay CORS global ni admin plugin.
- PostgreSQL servicio obligatorio **solo cuando se activa el auth add-on**. Funciona junto a `addons/db-postgres` pero no lo importa directamente.
- Schema `auth` para las cuatro tablas de Better Auth y journal **`auth_meta.__drizzle_migrations`**, independientes de `lego_app` y `drizzle.__drizzle_migrations`.
- `createAuthPlugin({databaseUrl,baseURL,secret,registerRoutes})` se registra explícitamente dentro del `buildApp({ beforeRoutes })` de Fastify Core. La sesión se resuelve por cada petición contra DB (sin cache de cookie).

## Migraciones y permisos

El plugin comprueba `auth.user`, `auth.session`, `auth.account` y `auth.verification` antes de aceptar su inicialización. Un esquema ausente o parcialmente creado provoca un error de arranque sin filtrar secretos; la cuenta de ejecución no consulta el journal del migrador ni ejecuta DDL.

Nunca se migran tablas durante el arranque. Primero deben ejecutarse las migraciones de `addons/db-postgres` (si se utiliza ese add-on) y luego las de auth:

```sh
cd addons/auth-better-auth
pnpm install --frozen-lockfile --strict-peer-dependencies --ignore-scripts
pnpm run typecheck
pnpm run db:check
AUTH_MIGRATION_DATABASE_URL='postgresql://<migrator>@<host>/<db>' pnpm run db:migrate
```

El migrador DB puede crear esquemas; el usuario de ejecución del servidor recibe únicamente `CONNECT`, `USAGE` y permisos DML para `auth`, sin acceso al historial de migraciones ni `lego_app`. La CI crea roles sintéticos únicamente en su PostgreSQL temporal.

## Ejemplo de composición

```ts
import { buildApp } from './app.js';
import { createAuthPlugin } from '@kit-fundador/auth-better-auth';

const app = buildApp({
  beforeRoutes(core) {
    core.register(createAuthPlugin({
      databaseUrl: process.env.AUTH_APP_DATABASE_URL ?? '',
      baseURL: process.env.AUTH_BASE_URL ?? '',
      secret: process.env.AUTH_SECRET ?? '',
      registerRoutes(scope, { getPrincipal }) {
        scope.get('/private', async (req, reply) => {
          const user = await getPrincipal(req);
          if (!user) return reply.code(401).send({ error: 'Unauthorized' });
          return { id: user.id };
        });
      },
    }));
  },
});
```

La ruta `/api/auth/*` es de Better Auth y **solo existe al activar el add-on**. El campo `role` del registro público es controlado por servidor con `input:false`: una petición que mande `role:admin` no crea administradores. No se incorpora el plugin de administración. Ninguna ruta de negocio se habilita automáticamente y sus permisos pertenecen al consumidor.

## Seguridad pendiente antes de producción

- Política de contraseña mínima de 15 caracteres en este ejemplo de un factor. Se necesita blocklist, MFA y evaluación NIST completa para entornos reales.
- HTTPS estricto fuera de loopback. Cookies seguras en HTTPS, sin session-cache; CORS de credenciales no habilitado. Origines confiables exactos, sin wildcard. No se confía en Host para construir la URL.
- **IP confiable para Better Auth:** el adaptador toma `FastifyRequest.ip` y elimina los encabezados enviados por el cliente `X-Forwarded-For`, `Forwarded`, `X-Real-IP`, `CF-Connecting-IP` y `X-Kit-Auth-Client-IP`. Inserta su propio `X-Kit-Auth-Client-IP`, configurado como única fuente de IP en Better Auth. El mismo encabezado se usa al iniciar sesión y al consultar la sesión. Con `trustProxy: false` (valor predeterminado) un cliente no puede suplantar la IP enviando cabeceras. Tras un proxy, configurar `trustProxy` **solo con las direcciones/redes de proxies confiables** que sobrescriben la cabecera; jamás confiar en cualquier origen.
- Rate limiting en memoria es **solo del laboratorio**, sin garantía multiinstancia. La corrección anterior impide evadir el bucket local rotando `X-Forwarded-For`, pero **no implementa rate limiting distribuido ni reemplaza controles de infraestructura**. Nunca exponerlo a Internet sin protecciones de infraestructura, gestión central de límites, reverse proxy configurado, TLS y CSRF/origin test de navegador real.
- No implementa multi-tenancy general, políticas de roles admin, recuperación de cuenta, verificación de email, MFA, respaldos/restore, escalado de pool ni rotación segura de secretos.
- Drizzle ORM 0.45.4 tiene fallos externos con `skipLibCheck:false` documentados en el add-on PostgreSQL. El propio código mantiene TypeScript estricto y separa el diagnóstico upstream; **esto no equivale a verificar todos los tipos de terceros**.
- No publicar npm/shadcn, no desplegar público y no copiar/migrar datos reales desde `examples/identity-access`.

La CI de esta PR usa PostgreSQL 16 efímero, ejecuta migraciones por separado y comprueba cookies, altas, sesiones, invalidación, 401/403, roles y propietarios distintos.
