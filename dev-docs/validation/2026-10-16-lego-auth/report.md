# Auditoría — LEGO Better Auth opt-in / PostgreSQL

**Fecha:** 2026-10-16 · **PR:** [#83](https://github.com/fegome90-cmd/kit_fundador/pull/83) · **Base:** `main@5920396bdba391d66caf7b36e4f15dec56fa3f41` · **Estado:** **GO-LAB / NO-GO publicación, producción y merge automático**.

## Alcance materializado

Se añadió únicamente `addons/auth-better-auth/` (y workflow/docs). No se alteró el código de `templates/fastify-core`, `templates/fastify-openapi`, `addons/db-postgres` ni `examples/identity-access`. El ejemplo es opt-in mediante `app.register(createAuthPlugin(...))`. Sin plugin, Fastify no monta rutas de sesiones ni abre un pool.

Versiones fijadas y verificadas desde lock independiente: `better-auth@1.7.10`, `@better-auth/drizzle-adapter@1.7.10`, `drizzle-orm@0.45.4`, `pg@8.23.1`, `drizzle-kit@0.31.11`, Fastify 5.12.7 peer, pnpm 11.25.0 y Node 24.

El schema Drizzle de Better Auth se inspiró en el prototipo de octubre y fue **generado de nuevo** por CI temporal [run 38962065822](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38962065822), conservando la migración versionada `drizzle/0000_init.sql` y snapshot. SQL crea `auth.user`, `auth.session`, `auth.account` y `auth.verification`, con FK internas. `auth_meta.__drizzle_migrations` pertenece a auth; `drizzle.__drizzle_migrations` y `lego_app.notes` conservan su owner independiente. Nunca se migran esquemas en startup.

## Evidencia de E2E real

**HEAD funcional verificado** `b162da7529c5b109ac57eca2ba0b616b762cbacf`:
- [LEGO Better Auth + PostgreSQL, run 38963707902](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38963707902): **success** Ubuntu 24.04 con PostgreSQL 16.15 real en servicio descartable.
- [CI heredada, run 38963707838](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38963707838): **success**, 111/113 pruebas raíz aprobadas, 2 omitidas; Identity Access standalone 9/9.
- Instalación de `db-postgres`, `auth-better-auth` y Fastify Core en **tres directorios separados**, lockfile congelado, sin scripts de instalación, TypeScript estricto sobre fuentes propias, `drizzle-kit check`, build y migraciones de los dos owners ejecutadas dos veces.
- Marcador `AUTH_NEVER_AUTOMIGRATES_PASS`: esquema auth ausente produce fallo de inicio y **ninguna tabla creada** por Fastify. Migrado explicitamente: `LEGO_AUTH_MIGRATIONS_ISOLATED {"authHistory":1,"appHistory":1,"tables":["account","session","user","verification"]}`.
- Rol PG `lego_auth_ci`: `CONNECT`, `USAGE` y DML de schema `auth` únicamente. PostgreSQL deniega `CREATE TABLE auth`, lectura `auth_meta`, `drizzle` y `lego_app.notes` con `42501`. Credenciales sólo sintéticas dentro del contenedor temporal.
- **8/8 pruebas Node**: Core sin auth sigue en health/404; configuración sin secreto fuerte o URL válida falla sin filtrar secretos; autorización 401 anónimo, 403 cuenta ajena/rol no autorizado; 2 cuentas + cookies HTTPOnly distintas, signup enviando `role:'admin'` no logra escalar (DB mantiene `user`); secreto débil de menos de 15 caracteres no crea cuenta; login/contraseña incorrecta, signOut invalida cookie; origen malicioso sin sesión; y pool se cierra sin conexiones residuales.
- `LEGO_AUTH_CORE_OPT_IN_PASS` y `LEGO_AUTH_CORE_COMPOSITION_PASS`: integración desde Core compilado inalterado, sesiones solo cuando el consumidor registra explícitamente el plugin.
- Auditoría de runtime: `pnpm audit --prod --no-optional` devuelve **No known vulnerabilities found**. La auditoría full `pnpm audit --audit-level high` aprueba con **1 moderate, 0 high/critical**.

## Hallazgos, verificaciones parciales y NO-GO

**AUTH-01 — Declaraciones externas TS sin solución upstream:** `drizzle-orm@0.45.4` falla con 70 errores `.d.ts` si `skipLibCheck:false`, la misma limitación documentada en [#82](../2026-10-16-lego-postgres/report.md). Better Auth 1.7.10 / `@better-auth/core` añade 1 `TS2307` por la referencia opcional a `bun:sqlite` en Node 24. La CI usa `strict:true`, `skipLibCheck:true` **sólo para comprobar código del proyecto** y ejecuta un diagnóstico separado `tsc --noEmit --skipLibCheck false`: `LEGO_AUTH_UPSTREAM_WAIVER 70 Drizzle declaration errors; 1 optional Better Auth bun:sqlite declaration`. Rechaza cualquier error distinto y no declara que las declaraciones externas pasen.

**AUTH-02 — Advisory moderado no corregido:** artefacto de [run 38963303113](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38963303113) revisado manualmente, id `12074095898`: `GHSA-67mh-4wv8-2f99`, `esbuild@0.18.20`, vía `drizzle-kit` y la ruta `better-auth > drizzle-kit`. El informe full incluye una ruta marcada `dev:false`, aunque `pnpm audit --prod --no-optional` no encuentra vulnerabilidades. **Esta discrepancia de clasificación no permite declararlo inequívocamente “solo dev”**. No se ejecutó un servidor esbuild ni se encontró explotación, pero **permanece abierto** antes de distribución. No forzar overrides sin evaluación de compatibilidad.

**AUTH-03 — Rate limiting no productivo:** Better Auth 1.7.10 advierte durante tests que, sin IP fiable, usa un solo bucket por ruta. El rate limiter configurado en memoria no funciona como control multiinstancia ni equivale a protección de abuso para Internet. No confiar en `X-Forwarded-For` proporcionado directamente por clientes; configurar una cadena de proxies confiables y rate limiting compartido antes de producción. Las solicitudes de orígenes maliciosos se rechazaron, pero no se ha certificado comportamiento de navegadores/proxies.

**AUTH-04 — Autorización limitada:** `getPrincipal()` verifica una sesión real, pero la demostración de 403 verifica únicamente propietario de recurso (`userId`) y un rol no administrativo. **No existe un sistema RBAC/tenancy global** ni admin plugin; la autorización de toda ruta y recurso real sigue siendo de la aplicación. Login con email no verificado, recuperación de contraseña, MFA, bloqueo de credenciales filtradas y procesos de mail tampoco fueron aprobados para producción.

**AUTH-05 — Operación externa sin certificar:** TLS y CA gestionados, proxy, rotación de secretos y claves, SMTP, límites centralizados, recuperación, failover, backups/restores, upgrade de sesiones/migraciones en datos existentes, pruebas de navegadores/CSRF y distribución por npm/shadcn permanecen fuera de alcance. No se migró ningún usuario de la demostración Express.

**AUTH-06 — Revisión automática (historial):** La primera solicitud a CodeRabbit fue limitada por cuota. La revisión posterior del commit `0d206b6` sí concluyó y detectó **dos hallazgos concretos**: falta de disparadores CI al cambiar `addons/db-postgres` o `templates/fastify-core`, y exposición a IP falsificada por `X-Forwarded-For`. El addendum del 17-10-2026 documenta la corrección y su validación. El dictamen final debe referirse al HEAD y CI final; mientras se revisan los fixes, la PR permanece en **draft, sin merge**.

## Dictamen

**GO para laboratorio y revisión del add-on opcional**, con conexión PostgreSQL real, sesiones y checks ejecutados. **NO-GO para despliegue público ni publicación como componente estable**; además, no llevar la PR a merge sin revisar AUTH-01..06 y comprobar el estado de CodeRabbit/CI sobre el HEAD final. No alterar la garantía de aislamiento del Core.

## Addendum: regresión TDD de esquema parcial (17-10-2026)

**Defecto reproducido:** el preflight original comprobaba solamente `SELECT 1 FROM auth."user" LIMIT 0`. Con un esquema `auth` creado manualmente y únicamente esa tabla, Fastify aceptaba `ready()`, aunque faltasen `session`, `account` y `verification`. Ese arranque permitía fallos posteriores durante solicitudes con cookies y sesiones.

- **RED:** [run 39030643063](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39030643063) falló con `AssertionError: Missing expected rejection` en la comprobación de migración parcial.
- **Fix:** `createAuthPlugin` comprueba explícitamente las cuatro tablas, con `LIMIT 0` y el rol de acceso ordinario. Sigue sin leer `auth_meta.__drizzle_migrations`, crear esquemas, insertar datos ni ejecutar migraciones durante el arranque.
- **GREEN:** [run 39030755551](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39030755551) PASS sobre `067b30b87eea184fd35a7b6bd45da3155601f264`, 8/8 tests E2E, migraciones repetidas, privilegios mínimos, Core independiente, diagnóstico de typings y auditoría. [CI heredada 39030755575](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39030755575) PASS.
- **Limitación:** estas comprobaciones no sustituyen el control formal de versiones de migración; el rol runtime carece deliberadamente de permiso para leer el journal. Un esquema incompleto con tablas pero columnas obsoletas podría superar este smoke; los upgrades requieren gates de despliegue dedicados.
- **Pendientes inalterados:** Drizzle 0.45.4 falla verificaciones `.d.ts` externas, Better Auth 1.7.10 hace referencia opcional a `bun:sqlite`; advisory moderado `GHSA-67mh-4wv8-2f99` en esbuild, límites de tasa en memoria, TLS/proxy y controles de producción no validados. **GO-LAB, NO-GO publicación/producción**. La revisión CodeRabbit del HEAD final continúa como gate de admisión.

## Addendum: revisión CodeRabbit y límite de confianza IP (17-10-2026)

**Hallazgo AUTH-07 (mayor, confirmado por CodeRabbit):** el plugin enviaba `fromNodeHeaders(request.headers)` a Better Auth 1.7.10. El paquete puede usar la cabecera `X-Forwarded-For` como IP cliente para rate limit y `auth.session.ip_address`; el valor provenía del usuario, aunque Fastify se ejecutaba con `trustProxy: false`.

- **RED:** [run 39031438963](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39031438963) falló al comprobar la IP persistida: con cabecera `X-Forwarded-For: 203.0.113.71`, PostgreSQL registró `session.ip_address = '203.0.113.71'` en lugar de la IP real. Esta prueba reproduce la suplantación sin atacar servicios externos.
- **Fix:** `trustedHeaders(FastifyRequest)` borra las cabeceras externas de IP (`X-Forwarded-For`, `X-Real-IP`, `CF-Connecting-IP`, `Forwarded` y el propio `X-Kit-Auth-Client-IP`) y crea un encabezado interno con `request.ip` de Fastify. Better Auth se configura con `advanced.ipAddress.ipAddressHeaders: ['x-kit-auth-client-ip']`. Se utiliza el mismo origen confiable en `auth.handler` y `auth.api.getSession`.
- **GREEN:** [run 39031696502](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39031696502) PASS sobre `8e1ad1af41b9cc378ad8f1c53112c8bd76a32800`: **10/10 E2E**, incluido `session.ip_address` no falsificable y un escenario de **siete intentos fallidos** rotando cabeceras que confirma respuesta HTTP 429; migraciones, aislamiento y límites de credenciales continúan verdes. [CI heredada 39031696455](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39031696455) PASS con 111 pruebas raíz aprobadas y 9/9 del ejemplo.
- **Hallazgo AUTH-08 (menor, confirmado):** la CI de integración cargaba `addons/db-postgres` y `templates/fastify-core` sin reaccionar a sus cambios. Los filtros de `pull_request` y `push` ahora incluyen ambos directorios. No se alteraron las plantillas ni PostgreSQL.
- **Modelo de confianza:** `request.ip` depende de la configuración de Fastify: `trustProxy:false` en el test y en el Core; si hay proxy de producción, **solo se podrá confiar en proxies específicos** con cabeceras sobrescritas. Esta mitigación no certifica la topología de red ni el rate limiting multiinstancia.
- **Pendientes no cerrados:** waiver upstream de 70 errores Drizzle + referencia opcional Better Auth `bun:sqlite`; advisory moderado `GHSA-67mh-4wv8-2f99` (esbuild) sin fix upstream validado en el lockfile; límites en memoria, MFA/recuperación/tenancy, TLS/proxy y restore no probados. **GO-LAB; NO-GO publicación o producción**. Código no instalado en los starters y sin deploy.

