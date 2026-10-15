# Kit Fundador LEGO — MVP para proyectos nuevos

**Estado:** GO para descargar y probar las dos plantillas mínimas; **no equivale a aprobación de producción**. Sin merge a `main`. Última validación funcional: [GitHub Actions](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38725632148).

Kit Fundador ya no necesita un instalador propietario para iniciar un backend. Usa **giget**, una carpeta del repositorio en un **commit SHA completo** y `pnpm` con un lockfile reproducible.

## Requisitos

- Node.js 24.
- pnpm 11.25.0 (instálalo, por ejemplo, con `npm install --global pnpm@11.25.0`).
- Acceso a GitHub y al registro npm durante la instalación inicial.
- Carpeta destino nueva y vacía: **no usar `--force`**.

El commit de plantilla auditado es:

```text
69b7873721a2693e58289631eea03482be8afe62
```

## Opción A — Fastify Core (sin servicios externos)

```bash
pnpm dlx giget@3.3.1 'gh:fegome90-cmd/kit_fundador/templates/fastify-core#69b7873721a2693e58289631eea03482be8afe62' mi-api
cd mi-api
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
pnpm start
```

Responde `GET http://127.0.0.1:3000/health` con `{"ok":true}`. El único paquete de ejecución directo es `fastify@5.12.7`.

## Opción B — Fastify Core + OpenAPI

```bash
pnpm dlx giget@3.3.1 'gh:fegome90-cmd/kit_fundador/templates/fastify-openapi#69b7873721a2693e58289631eea03482be8afe62' mi-api-docs
cd mi-api-docs
pnpm install --frozen-lockfile
pnpm run typecheck
pnpm test
DOCS_ENABLED=1 pnpm start
```

En sistemas Unix, la documentación activada aparece en `http://127.0.0.1:3000/docs/` y el esquema en `/docs/json`. En Windows PowerShell utiliza `$env:DOCS_ENABLED = '1'` y luego `pnpm start`.

**Documentación OFF por defecto**; se activa solo con `DOCS_ENABLED=1`. No publiques Swagger UI en Internet sin controles de acceso. El stack directo consta únicamente de Fastify, `@fastify/swagger@9.9.2` y `@fastify/swagger-ui@6.1.2`.

## ¿Qué se entregó?

| Propiedad | Core | Core + OpenAPI |
|---|---|---|
| Node 24 + TypeScript NodeNext | Sí | Sí |
| `buildApp()` sin abrir puertos | Sí | Sí |
| Health, 400/404/413/500 y JSON Problem Details | Sí | Sí |
| IDs de solicitud, logs sin URLs automáticas | Sí | Sí |
| SIGTERM/SIGINT y bind `127.0.0.1` por defecto | Sí | Sí |
| Sin Docker, PostgreSQL, auth ni Redis | Sí | Sí |
| OpenAPI y UI activables | No | Sí |
| `pnpm-lock.yaml` independiente, `--frozen-lockfile` | Sí | Sí |
| Tests tras descarga por SHA | 12 PASS | 15 PASS |
| `pnpm audit` completo al 15-10-2026 | Sin avisos conocidos | Sin avisos conocidos |

Se probó que giget no sobrescribe una carpeta ocupada ni una ruta simbólica hacia ella. No uses `--force`. El código generado pasa a ser propiedad del nuevo proyecto; no existe actualización automática in-place.

## Lo que deliberadamente NO está publicado

PostgreSQL, Better Auth y los workers BullMQ con PostgreSQL o Valkey **sí tienen prototipos E2E y benchmarks previos**, pero permanecen experimentales bajo `dev-docs/validation/`. Requieren todavía configuración de producción, autorización robusta, actualizaciones de esquemas y una política de distribución específica. No están dentro del Core ni se instalan automáticamente.

Tampoco hay un Marketplace VS Code, Homebrew tap, CLI propia, registro de plugins dinámico, agentes obligatorios ni servicios en background. El instalador protegido Python/Docker queda como banco de pruebas, **no como parte de estas plantillas**.

## Seguridad y mantenimiento

El starter utiliza una configuración HTTP prudente, pero **no es una aplicación lista para exponer públicamente**. Añade autenticación, autorización, rate limiting, cabeceras avanzadas, TLS en proxy, observabilidad y persistencia solo según tus necesidades. La protección de logs no sustituye políticas de privacidad.

Para comprobar la evidencia, consulta [el plan y auditoría previa](dev-docs/plans/lego-mvp-distribution-2026-10-15.md) y [la ejecución reproducible](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38725632148). Los detalles del cierre se guardan en `dev-docs/validation/2026-10-15-mvp-distribution/report.md`.
