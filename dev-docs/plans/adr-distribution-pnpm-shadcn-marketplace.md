# ADR: distribución LEGO con pnpm, registries existentes y descubrimiento tipo Marketplace

**Estado:** candidato para prueba de concepto (no adopción definitiva).
**Fecha:** 2026-10-13.
**Contexto:** complementa `fastify-lego-foundation.md` y su auditoría P0-01/P0-02. No hay migración ni registry publicados.

## Decisión propuesta

**Reutilizar componentes de distribución existentes y evitar inicialmente una CLI o marketplace propio.**

| Herramienta | Rol | ¿Obligatoria en runtime? |
|---|---|---|
| `fastify-cli` o plantilla Git existente | Bootstrap del backend mínimo | No; solo construcción |
| pnpm | Workspace de desarrollo, paquetes, versiones y lockfile | No; solo instalación/build |
| `pnpm dlx` / `npx` | Ejecutar instaladores sin instalación global | No |
| shadcn Universal Registry | Distribuir archivos de configuración, módulos Fastify y recetas con destinos explícitos | No; solo instalación de pieza |
| npm registry (paquetes) | Versionar bibliotecas y plugins compartidos | Solo las dependencias instaladas |
| GitHub `registry.json` | Descubrimiento estático de bloques, sin servidor adicional | No |
| Docker Compose / OCI | Obtener y arrancar servicios externos opt-in | No para el core |
| Homebrew tap | Vía secundaria para distribuir una CLI estable | No; aplazado |
| UI tipo VS Code Marketplace | Buscar, filtrar, instalar y revisar piezas | No; aplazado |

## Evidencia primaria

- Universal Registry Items de shadcn (anunciados en julio 2025) no requieren React, Tailwind ni `components.json`, si todos los archivos declaran destinos absolutos respecto del proyecto: https://ui.shadcn.com/docs/changelog/2025-07-universal-registry
- GitHub registry puede ser un repositorio con `registry.json` en su raíz, consumido directamente sin hosting: https://ui.shadcn.com/docs/registry/github
- El formato `registry:item` declara `files`, `dependencies` y `registryDependencies`; también tiene campos opcionales para variables de ejemplo: https://ui.shadcn.com/docs/registry/registry-item-json
- CLI shadcn soporta `list`, `search`, `view`, `add`, `--dry-run` y `--diff`: https://ui.shadcn.com/docs/registry/getting-started
- API de registro permite añadir piezas programáticamente: https://ui.shadcn.com/docs/registry/api-reference
- Fastify CLI ya genera proyectos TS y plugins: https://github.com/fastify/fastify-cli
- `@fastify/autoload` ya permite cargar plugins desde una carpeta, con compatibilidad Fastify 5 en la serie 6.x: https://github.com/fastify/fastify-autoload
- pnpm workspaces y catalogs: https://pnpm.io/workspaces y https://pnpm.io/catalogs
- `pnpm dlx`/`pnx` ejecuta paquetes remotos; `pnpm create` invoca un generador `create-*`: https://pnpm.io/cli/pnx y https://pnpm.io/cli/create
- Brew taps son repositorios de fórmulas y sirven para instalar una CLI en macOS/Linux: https://docs.brew.sh/Taps.html
- Marketplace VS Code ofrece descubrimiento, manifiestos y seguridad de editores; no distribuye servicios backend: https://code.visualstudio.com/docs/configure/extensions/extensions

## Dos modos de distribución: no confundir

**Modo A: código que pertenece al proyecto consumidor**

- Publicar un item universal de shadcn con `type: registry:item` y `files[].type: registry:file`, siempre con `target` explícito.
- Usar este modo para glue Fastify, rutas de ejemplo, políticas, composición de plugins, plantillas de tests y documentación.
- La CLI shadcn se ocupa de resolver dependencias declaradas y de copiar archivos. Probar el orden de registro Fastify y que `--dry-run`/`--diff` detectan sobrescrituras.
- El código pasa a ser propiedad del consumidor; cambios futuros no se aplican automáticamente. Documentar migraciones y evitar `--overwrite` automático.

**Modo B: biblioteca compartida que recibe actualizaciones versionadas**

- Preferir paquetes npm existentes (`fastify`, `@fastify/...`, `better-auth`, `drizzle-orm`) con semver y lockfile.
- Publicar un paquete propio solo cuando haya funcionalidad real reutilizada por varios proyectos y requiera mantenimiento coordinado.
- En paquetes propios declarar compatibilidad real mediante `peerDependencies`/`engines`; incluir pruebas de compatibilidad.

**Modo C: servicio externo / microservicio**

- Mantener imagen OCI oficial/versionada, contrato de red, configuración, readiness/health y perfil de Compose; no instalar un servidor de datos mediante pnpm como si fuera una librería.
- Documentar licencias de imágenes, tags/digests, secretos, backups y estado persistente.

## Ejemplo conceptual de una pieza: health module universal

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry-item.json",
  "name": "fastify-health",
  "type": "registry:item",
  "title": "Fastify Health",
  "description": "Ruta de liveness y contrato mínimo",
  "files": [
    {
      "path": "registry/fastify-health/health.ts",
      "type": "registry:file",
      "target": "~/src/plugins/health.ts"
    }
  ]
}
```

Este manifiesto es **un ejemplo de diseño**, no se ha publicado ni comprobado en runtime; no resuelve por sí solo la activación de un plugin. Elegir registro explícito en `app.ts` o `@fastify/autoload` tras una prueba de orden, encapsulación y ESM.

## Ejemplos de experiencia deseada (NO comandos disponibles todavía)

```bash
# Crear un proyecto mínimo: elegir entre fastify-cli existente o template Git
# Instalar un item desde la rama/tag de un registry GitHub publicado:
pnpm dlx shadcn@<version-probada> add fegome90-cmd/kit_fundador/fastify-health

# Dependencias externas dentro de un proyecto:
pnpm add @fastify/swagger @fastify/swagger-ui

# Publicación futura de CLI, solo si aporta valor:
# pnpm create kitfundador mi-api
# npx create-kitfundador@<version> mi-api
# brew install <usuario>/<tap>/kitfundador
```

`fastify-health` y `create-kitfundador` no están publicados. No prometerlos en README operativo antes de implementar y probarlos. El uso de GitHub registry debe verificarse con el `registry.json` del repo y una revisión que confirme nombres y rutas realmente instalables.

## Posible Marketplace futuro, sin servidor nuevo

Primera etapa: `registry.json` público y CLI shadcn con comandos `list/search/view/add` son suficiente descubrimiento.
Segunda etapa opcional: web estática sobre el mismo registry para buscar por categorías (HTTP/DB/Auth/Jobs), dependencias, compatibilidad, licencia, pruebas y comandos de instalación.
Tercera etapa opcional: extensión VS Code si existe demanda, reutilizando su API de extensiones; no crear ni emular el Marketplace de Microsoft.

Referentes a rescatar de VS Code: publisher verificado, semver, descripción, motor compatible, permisos/confianza, estado de mantenimiento, instalaciones conscientes y posibilidad de desinstalar. No copiar la implementación del host de extensiones de VS Code.

## Prueba de concepto exigida antes de resolver P0-01

- [ ] Base Fastify Node 24 creada desde `fastify-cli` o plantilla Git, con tests y build de JS real.
- [ ] `registry.json` válido en rama de GitHub: 1 item universal `fastify-health`, con todos sus `target` explícitos.
- [ ] Instalar en directorio TS **sin React/Tailwind/components.json** con CLI shadcn actual fijada; comparar archivos antes/después.
- [ ] Verificar con `pnpm install --frozen-lockfile`, typecheck, test, build y `node dist/server.js` en entorno aislado.
- [ ] Verificar `--dry-run`/`--diff`, instalación repetida, colisiones, reemplazos, fallo de red, item ausente y dependencia inválida.
- [ ] Instalar una segunda pieza no trivial (`api-docs`) junto con `health`, garantizar compatibilidad y orden Swagger antes de rutas.
- [ ] Probar modo con registro explícito frente a `@fastify/autoload`: orden, dependencia env, cierre, scopes, tests y comportamiento de ESM compilado.
- [ ] Verificar instalación via `npx`/npm y `pnpm dlx`, lockfile correcto y ausencia de toolchain en producción.
- [ ] Registrar versiones exactas de Fastify, shadcn CLI, pnpm y Node probadas; los ejemplos genéricos no sirven como evidencia.
- [ ] Comparar tiempo de bootstrap, líneas de glue y fallos vs el generador custom propuesto. Si no cumple, reconsiderar una CLI mínima basada en el SDK de shadcn, no rehacer un package manager.

## Condiciones de seguridad y mantenimiento

- Las recetas ejecutan código de terceros. Usar fuentes allowlist/versionadas y controles de diffs; no ejecutar scripts arbitrarios desde URLs sin revisión.
- Conservar lockfile, verificar proveniencia, licencias y advisories; no confiar en estrellas, ratings o README.
- `npx` y `pnpm dlx` descargan código que se ejecuta localmente: probar una versión fijada, no usar `@latest` en CI.
- Usar `pnpm-workspace.yaml` para desarrollar varios paquetes/recetas en el repo, pero **cada backend generado es independiente** y no contiene dependencias `workspace:` sin resolver.
- No introducir `catalog:` en proyectos generados que deban poder instalarse con npm sin transformación; declarar soporte multi-package-manager solo cuando existan tests.
- Los módulos tipo auth, DB y worker no forman parte del core. Si un plugin requiere credenciales/servicios, fallar claramente al activarlo.

## Dictamen de este addendum

**Preferir un registry abierto existente (shadcn Universal Registry) + pnpm + Fastify CLI/autoload (solo si pasan PoC), frente a construir una CLI, plugin manager y marketplace propietarios de entrada.**

Esto mitiga conceptualmente P0-01 y reduce P0-03, pero **P0-01 sigue abierto hasta que la prueba de composición sea verde**; P0-02 (actualización del código copiado) requiere política de versiones/migraciones antes de declarar madurez.
