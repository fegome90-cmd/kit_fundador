# RFC + auditoría previa — Distribución mínima Kit Fundador LEGO

**Fecha:** 2026-10-15 · **Rama:** `feat/fastify-lego-foundation` · **Estado de decisión:** implementar un MVP aislado; no fusionar a `main` sin gates.
**Baseline:** informe `dev-docs/validation/2026-10-15-gh-actions/registry-provenance-and-sandbox-audit.md` (commit `94671d53dbfe94ecdb00f4ddb57aefabd153f26a`).

## 1. Problema que resolvemos

El laboratorio probó que Fastify/OpenAPI/PostgreSQL/Better Auth/BullMQ funcionan en las variantes PostgreSQL y Valkey; pero la distribución transaccional in-place añadió cientos de líneas Python, locks, journal, servidor HTTP y sandbox, algo desproporcionado para arrancar **un proyecto nuevo**. El core debe ser mínimo y el sistema de distribución debe reutilizar software existente.

## 2. Decisión y alcance cerrado

**MVP:** dos plantillas autónomas para proyectos **nuevos y vacíos**, publicadas como subdirectorios de GitHub, descargables con `giget@3.3.1` y un **commit SHA completo**.

| Opción | Directorio | Dependencias runtime | Alcance |
|---|---|---|---|
| `core` | `templates/fastify-core/` | `fastify@5.12.7` únicamente | Fastify, TypeScript NodeNext, health, error handling, config mínima, logs redactados, cierre ordenado, tests |
| `core+openapi` | `templates/fastify-openapi/` | `fastify@5.12.7`, `@fastify/swagger@9.9.2`, `@fastify/swagger-ui@6.1.2` | Todo core + documentación opt-in, registrada antes de rutas |

Los dos templates deben contener **sus propios** `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `src/`, `tests/`, `tsconfig.json` y README; ninguna ruta `workspace:`, script de postinstall o dependencia del repositorio padre.

**Mecanismo de bootstrap**: `pnpm dlx giget@3.3.1 gh:fegome90-cmd/kit_fundador/templates/fastify-core#<FULL_SHA> mi-api` y `pnpm install --frozen-lockfile`. Ese comando es inicialmente un **contrato a verificar**, no una instrucción publicada hasta pasar el test remoto sobre SHA exacto. No usar `@latest`, ref de rama, ni `--force` para consumidores.

**El core no incluye** Docker, PG, Auth, Redis/Valkey, BullMQ, React, Tailwind, agentes ni plugin manager. Las variantes completas A/B con 4 bloques permanecen en `dev-docs/validation` (evidencia E2E) y **no se etiquetan publicables**. No escribir un registry marketplace o instalador transaccional como parte del MVP.

**API de composición futura:** Fastify plugins explícitos vía `app.register`. En el core se admiten funciones de registro `beforeRoutes` y `afterRoutes` opcionales que permiten al template OpenAPI registrar Swagger antes de `/health` y UI después; sin imports condicionales ni búsqueda dinámica de plugins.

## 3. Auditado contra alternativas (antes de ejecutar)

| Alternativa | Ventaja | Riesgo/coste | Dictamen |
|---|---|---|---|
| Copiar los cuatro módulos Python del laboratorio | Permite instalación segura sobre consumidores con recovery | Mucho código propio, Python+Node, privilegios Docker, updates y journal multi-OS no probados | **RECHAZADA** para bootstrap nuevo |
| Crear una CLI propia `create-project.mjs` | Personalización directa | Reimplementar extracción, fallos, rutas, versionado | **RECHAZADA** hasta necesidad demostrada |
| Template subdir + giget | Sin código de instalación propio, ref SHA, portable y no destructivo por defecto | La descarga sigue ejecutando tooling npm, subdir/ref debe probarse y mantener dos lockfiles | **ELEGIDA** |
| shadcn registry para editar consumidores existentes | Declarativo y extensible | Preview universal, conflictos y rollback requirieron wrapper; advisories toolchain | **FUERA DE MVP**, conservar PoC |
| Instalar en proyectos existentes mediante copiar archivos | Simple | Sobrescribe personalizaciones; no hay ownership de updates | **PROHIBIDO** en la distribución inicial |

Documentación externa: https://github.com/unjs/giget (subdirectorios y refs), https://ui.shadcn.com/docs/registry/github (SHA completo), https://fastify.dev/docs/latest/Reference/Plugins/ (registro explícito), https://pnpm.io/cli/install (lockfile).

## 4. Controles funcionales obligatorios

1. **G0 integridad**: SHA completo confirmado en GitHub; descarga solo la subcarpeta indicada. Rechazo efectivo de destino no vacío (no usar `--force`).
2. **G1 independencia**: plantilla instalada en otra carpeta fuera de Kit Fundador, `pnpm install --frozen-lockfile`, typecheck, build, test y `node dist/server.js` real.
3. **G2 HTTP**: `/health` 200, 404, JSON malformado 400, body grande 413, 500 sin secretos, request IDs y cierre por SIGTERM.
4. **G3 configuración/seguridad**: `PORT`/`HOST` malformados fallan antes de listen, host loopback por defecto, no CORS permisivo, no header/trazas sensibles en errores/logs.
5. **G4 docs**: core no contiene swagger, docs OFF = 404, docs ON = especificación con `/health` + UI opt-in, orden de registro probado.
6. **G5 reproducibilidad**: Node 24, pnpm 11.25; deps pinneadas y lockfiles completos, sin scripts de instalación ejecutados por el template.
7. **G6 CI**: pruebas de las dos plantillas y prueba real de giget desde GitHub SHA, diferenciadas de la suite Express heredada.
8. **G7 auditoría**: `pnpm audit --prod --no-optional` sin vulnerabilidades conocidas o registrar y bloquear release; resultado full audit igualmente disponible; verificar diff que `src/`, `web/`, `templates/` antiguos y `main` permanezcan intactos.

## 5. Orden de ejecución

**Fase A — plan y auditoría previa:** esta nota, limitación explícita a bootstrap no destructivo. **Fase B — construir `core`** desde el lockfile Fastify único ya probado, mejorar HTTP/config/tests. **Fase C — docs variant**: mismo core, dependencias Swagger pinneadas, generar lockfile real con CI si no hay lock de esas 3 dependencias. **Fase D — CI y descarga giget desde commit inmóvil** (incluidos fallos negativos). **Fase E — auditar resultados y registrar NO-GO precisos**.

## 6. Riesgos y decisiones de mantenimiento

- **Fuente:** GitHub ref de 40 caracteres, no cadena SHA mutable; usuario puede comparar el SHA con fuente auditada. No se promete firma SLSA.
- **Toolchain:** giget y pnpm son ejecutores externos; fijar versiones, CI en runner desechable, revisar advisories. No usar `--install` de giget; instalación pnpm como paso explícito.
- **Compatibilidad:** bootstrap sobre carpeta nueva. El código copiado pertenece al consumidor. Para actualizaciones futuras ofrecer cambios revisables, nunca overwrite silencioso.
- **Duplicación:** dos templates con código core duplicado en el MVP; gate CI puede comparar archivos comunes. Reevaluar si conviene empaquetar la base propia **solo si** se necesita mantenimiento compartido.
- **Seguridad:** sin base externa ni auth habilitados en core. Documentación API apagada por defecto y no expuesta por obligación del template.
- **Cutover:** se conserva Express heredado, y las integraciones A/B son fixtures investigativos, no módulos productivos liberados.

## 7. Condición de aceptación

**GO-MVP** únicamente si **ambas plantillas** descargadas desde SHA ejecutan sus gates completos en runners limpios; si una no supera reproducibilidad/HTTP/docs/seguridad se mantiene `NO-GO` y se documenta evidencia. Sin merge ni publicación automática.
