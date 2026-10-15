# Kit Fundador — Fastify Core

Proyecto backend mínimo e independiente. Solo requiere **Node.js 24**, **pnpm 11.25** y Fastify 5.

## Arrancar

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
pnpm start
```

Por defecto escucha en `127.0.0.1:3000`. Variables optativas: `HOST` (`127.0.0.1`, `localhost`, `0.0.0.0`, `::1`, `::`) y `PORT` (0–65535).

`/health` indica que el proceso HTTP responde; **no equivale** a comprobar bases de datos ni servicios externos. No hay CORS permisivo, base de datos, sesiones, colas, frontend, IA, ni acciones al instalar. `buildApp()` no abre puertos.

Para desarrollo, usa `pnpm exec tsc --watch` y, en otra terminal, `node --watch dist/server.js`.

## Composición

Los plugins se registran en `src/app.ts` con `app.register(...)`. El orden `beforeRoutes → routes → afterRoutes` se conserva deliberadamente para capacidades como OpenAPI. No hay motor propio de extensiones.

El código copiado pertenece al proyecto nuevo. Las actualizaciones requieren revisar los diffs; no habrá sobrescrituras silenciosas.

**Este template es el núcleo, no la receta clínica ni la aplicación de cuatro bloques.** Antes de ponerlo en Internet añade configuración de despliegue adecuada, TLS en el proxy, controles de acceso, límites de tráfico y el plugin de seguridad correspondiente a tu entorno.
