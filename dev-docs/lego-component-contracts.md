# LEGO — Contratos de consumo (R1)

**Estado:** laboratorio, no distribuido públicamente. **Baseline:** `main@fa8839e3f17fb34d812290fd8c8163fc00df583a`, después de la PR #84.

Este catálogo especifica qué se puede importar de cada pieza y qué queda fuera del contrato. El core Fastify y la variante OpenAPI se descargan como proyectos nuevos con [giget y SHA inmóvil](../LEGO-MVP.md); **los add-ons aún no son productos npm**. Todos mantienen `"private": true`. El empaquetado local de la CI prueba el contrato de importación, no concede permiso para publicar.

| Pieza | Entrada de paquete | Servicio al activarse | Alcance de pruebas |
|---|---|---|---|
| `@kit-fundador/db-postgres` | `.` y `./schema` | PostgreSQL 16 | Plugin, tipos, esquema, migración explícita, cuenta DML, cierre de pool |
| `@kit-fundador/auth-better-auth` | `.` | PostgreSQL 16 y esquema `auth` | Sesiones, login/logout, cookies, roles, permisos, fallo de esquema |
| `@kit-fundador/jobs-valkey` | `.` | Valkey 8.1.4 y worker separado | Enqueue, digest SHA-256, reintentos, caída del worker y recuperación |

## Política de instalación y archivos

- Node 24; Fastify 5 es `peerDependency` en los tres. Cada add-on conserva `pnpm@11.25.0`, dependencias fijadas y lockfile propio para sus pruebas. El core sigue sin base, auth ni jobs obligatorios.
- Las pruebas de contrato **compilan, empaquetan e instalan un `.tgz` privado en un directorio temporal fuera del repositorio**, consumen las entradas públicas desde JavaScript y TypeScript, y comprueban archivos obligatorios.
- En DB y Auth el artefacto de laboratorio incorpora además `src/`, migraciones versionadas, `drizzle.config.ts` y el guard de URL de migración. Esto permite inspeccionar y trasladar explícitamente las migraciones; **no las aplica automáticamente** ni garantiza gestión de actualizaciones del esquema de un proyecto consumidor.
- El paquete Jobs incluye `dist/` y README. Su JS compilado conserva el entrypoint del worker, pero no instala ni arranca el servicio.
- Se excluyen pruebas, archivos de entorno, credenciales, `node_modules` y artefactos internos del instalador. La CI comprueba el contenido real del archivo tar.
- El consumidor es dueño de sus rutas HTTP, permisos, configuración, secretos, migraciones y efectos de los jobs. **Ningún import ni empaquetado levanta servicios externos.**

## Dependencias y fronteras de seguridad

```text
Fastify Core                    [sin servicios externos]
  ├─ Core + OpenAPI             [variante propia; docs OFF por defecto]
  ├─ db-postgres                [PostgreSQL y schema lego_app]
  ├─ auth-better-auth           [requiere servicio PostgreSQL/schema auth;
  │                             no importa el paquete db-postgres]
  └─ jobs-valkey                [Valkey + worker separado; no necesita PostgreSQL]
```

El add-on Auth y DB mantienen pools y migradores distintos. Los journals son `drizzle.__drizzle_migrations` y `auth_meta.__drizzle_migrations`; las rutas necesitan autorización por recurso. Para BullMQ la entrega sigue siendo al menos una vez: no hay atomicidad de escritura DB + queue.add ni exactly-once.

## Evidencia y límites

- `.github/workflows/lego-package-contracts.yml` comprueba manifiestos, contenido de tarball, instalación externa, compilación de tipos y exportación JavaScript, sin bases ni colas. La prueba usa `skipLibCheck:true` en el **consumidor**, exclusivamente por errores de declaraciones upstream ya documentados de Drizzle y Better Auth; no certifica tipado de dependencias completo.
- Los workflows PostgreSQL, Better Auth y Valkey validan por separado el comportamiento con servicios reales efímeros y la composición opt-in. **No prueban aún la receta Full B integrada**; esa es R2.
- La CI de distribución del MVP debe ejecutarse cuando cambie `main` y los archivos de sus dos plantillas; la CI PostgreSQL también debe reaccionar ante cambios en `templates/fastify-core/**`.
- El registro público, shadcn Universal Registry, actualización de proyectos ocupados, TLS/proxy productivo, backup/restore, multi-tenant y despliegue siguen fuera del alcance R1.
- Los reportes de validación anteriores contienen waivers y riesgos residuales. Un PASS de paquetes privados **no equivale a GO para publicación o producción**.

**Próximo gate R2:** generar y probar fuera del repo Core + OpenAPI + DB + Auth + Jobs Valkey con autorización por recurso, migraciones idempotentes y worker separado, antes de declarar una receta distribuible.
