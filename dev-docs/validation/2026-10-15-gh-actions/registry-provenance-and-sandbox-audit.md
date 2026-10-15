# Auditoría — Origen verificable y ejecución aislada del instalador LEGO

**Fecha:** 2026-10-15 (hora Chile). **Alcance:** laboratorio, no producto publicado.
**Rama:** `feat/fastify-lego-foundation`. **Estado:** GO-LAB condicionado; **NO-GO** para publicar y para modificar repositorios productivos con fuentes no confiables.
**Baseline:** informe `dev-docs/validation/2026-10-14-gh-actions/installer-hardening-followup.md` (commit `c1305ebe8bc532d46826627d42fc3e1f74850820`).

## 1. Objetivo y cambio mínimo de criterio

Mitigar el riesgo TOCTOU en registries mutables y reducir la superficie de acceso del instalador shadcn sin implementar marketplace, autenticación propia, sistema de plugins en ejecución ni sustituir Fastify.

La CLI experimental ahora:

1. Rechaza manifiestos con campos con efectos no autorizados (`envVars`, `css`, `tailwind`, otros no permitidos), destinos protegidos, dependencias ajenas y formatos inválidos.
2. Lee cada item fuente **una sola vez** y conserva SHA-256 del contenido **tal como llegó por HTTP**.
3. Exige `--registry-lock` con `{version:1,origin,items:{name:sha256}}` para preflight de orígenes HTTPS no loopback; ningún `--latest` ni URL mutable sin hashes se admite como prueba de identidad.
4. El instalador **no vuelve a hablar con el origen**. Recibe únicamente copias en memoria a través de un servidor HTTP efímero, con referencias internas reescritas a ese snapshot.
5. Solo permite instalación/diff de **orígenes loopback de laboratorio**. Un `--install` o `--diff` remoto continúa bloqueado hasta que exista una solución con límites de red probados, aunque tenga lockfile.
6. Durante preflight abre únicamente los archivos del consumidor necesarios para la composición (`package.json`, configuración pnpm/TS y targets declarados). Archivos ajenos no se leen ni se montan en el stage.
7. Permite usar `--sandbox docker` exclusivamente en laboratorio con imagen explícita (`--sandbox-image`). No expone Docker socket, HOME real, checkout ni carpetas personales al contenedor.

## 2. Evidencia de integridad del origen (ejecutada)

| Prueba | Resultado | Evidencia |
|---|---|---|
| Rechazo de remote sin `--registry-lock` | **PASS** | Unit fixture llama al validador en modo no local |
| Lock correcto permite instalar | **PASS** | Hash real de dos items en el fixture |
| Un SHA cambiado se rechaza antes de escribir | **PASS** | Test de mismatch |
| Falta un item del lock | **PASS** | Test de dependencia transitiva |
| Origen modificado durante la ejecución | **PASS** | Servidor cambia `api-docs.json` después del primer fetch; el consumidor conserva el código original |
| Snapshot sirve solo items del grafo aprobado | **PASS** | GET autorizado 200; item ajeno 404 |
| Campo extra peligroso en item | **PASS** | Rechaza `envVars` |
| URL remota en campo `files[].path` | **PASS** | Rechaza archivo remoto |
| Regresión del instalador y shadcn real | **PASS** | **35/35** en [CI](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38715376125), incluidos archivos ajenos sin permiso de lectura |

**Referencia:** `dev-docs/validation/2026-10-13-work/lego_registry_snapshot.py` y `test_lego_registry_snapshot.py`. La aserción TOCTOU cuenta exactamente un fetch del origen por item y demuestra que la versión mutada no entra en el consumidor. No prueba autenticidad de la persona que redactó el `registry-lock`.

### Semántica de bloqueo

Un lockfile exige digest de **bytes del item**: si una fuente modifica espacios, orden de claves o el contenido, la comparación falla. El archivo de lock **debe guardarse, revisarse y versionarse independientemente**; un atacante que controle simultáneamente registry y lock puede reemplazar ambos. El lockfile no es firma digital, provenance SLSA ni validación de npm tarballs.

## 3. Restricción de ejecución y prueba real de Docker

| Control | Cómo se implementó y validó |
|---|---|
| Contenedor sin acceso a filesystem del host | Solo etapa `/work` RW y `node_modules` RO montados |
| Sistema de archivos raíz RO | `docker run --read-only` |
| Privilegios reducidos | `--cap-drop=ALL`, `--security-opt=no-new-privileges`, UID/GID del usuario llamador |
| Recursos acotados | `--pids-limit=192`, `--memory=1024m`, `--cpus=2`, tmpfs de HOME/cache |
| Sin secretos heredados | No se monta HOME, socket Docker, secretos del repo ni variables arbitrarias |
| Imagen con herramientas pinned | Dockerfile de laboratorio Node 24 + `pnpm@11.25.0`; **base Node no fijada por digest** |
| Separación de red | `--network=bridge`; `host.docker.internal` solo para llegar al registry congelado servido en el gateway Docker |
| Host loopback inaccesible | Contenedor no llega al servidor origen del runner escuchando en `127.0.0.1:4380` |
| shadcn real dentro del contenedor | `lego-full-a` instala, se congela el lockfile, compila y arranca desde proyecto temporal |

**CI Docker con host-network previo:** [38714442487](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38714442487), PASS solo de filesystem/procesos.
**CI Docker en bridge con prueba explícita de localhost host inaccesible:** [38714993680](https://github.com/fegome90-cmd/kit_fundador/actions/runs/38714993680), PASS. Marcadores: `DOCKER_FILESYSTEM_BOUNDARY_PASS`, `DOCKER_LOOPBACK_ORIGIN_BLOCKED_PASS`, `DOCKER_SHADCN_INSTALL_PASS 13`, `DOCKER_SANDBOX_LAB_PASS`.

**Límite crítico:** la red de Docker bridge **no es un cortafuegos de egress**. El contenedor puede acceder a npm y posiblemente a otros servicios alcanzables a través del gateway/red. No llamar a este entorno `network-isolated` ni permitir fuentes no confiables como si estuvieran confinadas. No se ensayó bloqueo de exfiltración, DoS de Docker daemon ni escapes del kernel.

## 4. Ajustes de seguridad adicionales

- El preflight de entrada ya no lee archivos fuera de las rutas autorizadas. Se añadió un caso con archivo privado sin permiso de lectura, cuyo preflight debe funcionar sin abrirlo.
- Se preserva el journal de recuperación de la iteración anterior y las pruebas de `SIGKILL`, locks y rechazo de manifest corrupto.
- El sandbox Docker usa el **namespace de red del bridge**; la instalación final sigue ejecutándose **solo en directorio temporal creado por la suite**, jamás sobre consumidores reales.
- El adaptador aborta ante rutas/paquetes fuera del manifiesto, cambios de versión, colisiones de destinos o payload alterado.

## 5. Defectos encontrados y reparación (transparencia de pruebas)

Al restringir campos del manifiesto apareció una regresión en un test antiguo: el parser daba `Unsupported file entry` antes de devolver el error específico `Path traversal`. Se ajustó el rechazo para identificar traversal explícitamente. El run rojo está conservado y el run posterior pasó sin esa discrepancia. No se corrigió maquillando el resultado del test.

Las pruebas preliminares del cambio de Docker host → bridge fallaron cuando el servidor de snapshot seguía escuchando en `127.0.0.1` del runner. Se corrigió haciendo que el servidor de snapshot escuche en el gateway Docker y publique su nombre de acceso exclusivamente al contenedor. El run posterior de bridge terminó PASS. No se dio por válido el estado intermedio.

## 6. Validación global que no cambia

El E2E previo sigue demostrando funcionamiento de Fastify, PostgreSQL/Drizzle, Better Auth y BullMQ sobre PostgreSQL o Valkey, incluyendo migraciones y prueba de jobs sobre dos consumidores generados. Esta iteración modifica el **instalador** y no introduce cambios en esos servicios ni en el core original.

El full `pnpm audit` permanece con advisories de dependencias opcionales/build. La variante `pnpm install --prod --no-optional` pasó su propia auditoría y E2E en la investigación previa. No afirmar que los advisories se repararon upstream.

## 7. NO-GO restantes para distribución pública

| Gate | Estado | Motivo |
|---|---|---|
| Origen autenticado / firma o commit SHA oficial | Pendiente | Hashes protegidos por commit, sin cadena de confianza criptográfica del publicador |
| Egress restringido a npm/registros permitidos | Pendiente | Docker bridge no restringe destinos de salida |
| Herramienta de instalación auditada | Pendiente | shadcn/Toolchain con avisos, mayor superficie de dependencias |
| Tipado de terceros sin `skipLibCheck` | Pendiente | Errores upstream Better Auth/Drizzle |
| Recovery multiplataforma y almacenamiento externo | Pendiente | Solo Linux + archivos locales + SIGKILL controlado |
| Actualización de consumidores ya personalizados | Pendiente | El wrapper evita sobrescribir; no hay migración/mantenimiento publicado |
| Reducción de complejidad | **Obligatoria antes de merge** | Cuatro módulos Python de laboratorio exceden el ideal de Kit Fundador mínimo |

## 8. Recomendación del auditor

**Mantener el instalador protegido como banco de pruebas, NO copiar los cuatro módulos Python directamente al Kit Fundador Core.** Para la primera distribución, restringir la superficie a crear **proyectos nuevos vacíos** con una plantilla Fastify versionada y piezas shadcn respaldadas por GitHub ref fijado a **SHA completo** y lockfiles reproducibles. Reservar el instalador in-place transaccional para un release separado si hay demanda real.

Esta recomendación respeta el objetivo original: el valor es una base backend que funciona y piezas integrables, **no** un marketplace, un gestor de plugins propio o cientos de líneas de instalación especializadas.

Referencias: https://ui.shadcn.com/docs/registry/github · https://docs.docker.com/engine/containers/run/ · https://docs.docker.com/engine/network/drivers/host/ · https://docs.docker.com/engine/security/

**Dictamen final de este avance:** GO-LAB para integridad del origen y aislamiento de filesystem/procesos/red-namespace en Docker; NO-GO para uso en fuentes externas no confiables y publicación. Sin merge ni deploy.