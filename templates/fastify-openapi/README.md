# Kit Fundador — Fastify Core + OpenAPI

Plantilla independiente para un proyecto **nuevo**, con Node 24, pnpm 11.25, Fastify 5 y documentación OpenAPI opcional.

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm typecheck
pnpm test
DOCS_ENABLED=1 pnpm start
```

La documentación **está desactivada por defecto**. Con `DOCS_ENABLED=1`, la UI aparece en `/docs/` y el JSON OpenAPI en `/docs/json`. No publiques estas rutas en Internet sin autenticación y autorización adecuadas.

El orden está declarado explícitamente en `src/server.ts`: Swagger antes de las rutas y su UI después. El core funciona sin PostgreSQL, sesiones, colas ni servicios externos.

Variables HTTP: `HOST` (127.0.0.1 por defecto) y `PORT` (3000 por defecto). Usa `pnpm exec tsc --watch` y `node --watch dist/server.js` en dos terminales para desarrollo.

El código copiado pertenece al nuevo proyecto. No se incluyen seguridad de despliegue avanzada, proxy TLS, rate limiting ni actualizaciones automáticas sobre proyectos personalizados.
