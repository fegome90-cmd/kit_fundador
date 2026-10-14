# Validación E2E de Kit Fundador LEGO

Fecha local: 13 de octubre de 2026, America/Santiago. Ejecuciones registradas en UTC, 14 de octubre de 2026. Rama: `feat/fastify-lego-foundation`. Base inspeccionada: `f5ad18115f9740c3650f65dcdb8ee213752d52cf`.

## Dictamen

**NO-GO para incorporar o publicar la receta completa A o B.** Hay ejecución real de Fastify, OpenAPI, generación de esquema/migración, distribución experimental y BullMQ sobre Valkey. **No hay validación de PostgreSQL operativo, registro/login/sesiones sobre PostgreSQL ni jobs sobre PostgreSQL. No existe una comparación de rendimiento A/B válida.** Los gates pendientes se conservan como bloqueados; no se convierten en PASS por inspeccionar documentación.

La combinación original también falla la auditoría de dependencias, el typecheck de declaraciones de terceros y dos contratos de distribución: previsualización universal y rechazo preventivo de los dos backends de jobs.

**GO limitado para continuar el prototipo:** core Fastify independiente; HTTP/OpenAPI con Swagger UI `6.1.2` como corrección comprobada; cola BullMQ/Valkey en laboratorio. Esto no certifica producción ni la receta completa.

## Alcance y aislamiento

Se inspeccionaron la receta, auditoría y ADR indicados, el manifiesto raíz, HTTP Express existente, configuración TypeScript, árbol de templates y workflows. No se encontró `AGENTS.md` en el repositorio. La rama contiene planes, no una implementación Fastify ya existente. Los candidatos exactos propuestos en la receta se descargaron del registry npm real.

Los prototipos se construyeron fuera del backend, en un directorio hermano del checkout. Este directorio de `dev-docs` conserva copias de esos fixtures, lockfiles y evidencias. No son componentes publicados, ni reemplazan `src`, `templates`, `web`, configuración o secretos del proyecto. No se instaló el backend heredado ni se corrió su suite: esta misión valida una composición aislada y no hace afirmaciones sobre su baseline.

### Limitaciones comprobadas del runner

- Ubuntu 24.04, x64; Node `24.19.0`, pnpm `11.25.0`, npm `11.9.0`. Presupuesto cgroup: 8 CPU y 8 GiB. Hardware observado: AMD EPYC 9V74.
- No hay Docker/Podman/containerd/runc ni socket Docker. `unshare` falla con `Operation not permitted`; UID/GID map solo permite UID 0, sin capacidades Linux.
- Se descargaron binarios PostgreSQL `16.15` de Ubuntu. Tras recuperar descargas inicialmente truncadas, el SHA256 del servidor coincide con metadata apt: `d60ae76fb862cd4cca7bfdcdcdcc271c5e1d75f6b7915305ce2d962735a4b666`. `initdb` rechaza UID 0 y `runuser -u nobody` no puede cambiar grupos. Un ensayo de PRoot también falló por `ptrace` denegado. No se parchearon esos controles ni se emuló PostgreSQL con otra base.
- Valkey `8.1.4` sí pudo compilarse y ejecutarse como proceso nativo, desde el tag oficial, commit `5f4bae3ea10174a7c872cc099c953b0e91afa93a`. **No se ejecutó en contenedor**. Solo escucha en loopback, puerto de prueba 56379.
- Los procesos persistentes de invocaciones distintas no comparten la misma sesión de red. El primer ensayo de jobs acabó en timeout por un servidor iniciado en otra invocación. El harness corregido inicia servicio y clientes bajo la misma invocación; sus pruebas posteriores pasan. Es un fallo del harness, no evidencia contra BullMQ.

Evidencias: [preflight](evidence/preflight.log), [PostgreSQL rechazado](evidence/complete-deb-integrity.log), [cambio de usuario rechazado](evidence/native-postgres-final-blocker.log), [PRoot rechazado](evidence/proot-capability.log), [hardware](evidence/hardware.log).

## Matriz de gates

`PASS` significa prueba ejecutada con resultado observado. `FAIL` significa contrato incumplido. `BLOQUEADO` significa sin prueba funcional suficiente; cuenta como gate no aprobado. No se agregan estos estados para fabricar un porcentaje de éxito.

| Gate / componente | Estado | Evidencia / límite |
|---|---|---|
| Node 24 + pnpm + descarga npm | PASS | Versiones y tarballs reales, `package-metadata.json` |
| Instalar candidatos con peers estrictos | PASS condicionado | `compatible-install.log`; configurar `allowBuilds` antes de instalar |
| Lockfile reproducible | PASS | `frozen-install.log`, `ui6-frozen.log`, `core-frozen.log` |
| Core independiente sin DB, auth ni cola | PASS | `core-only-install/build/smoke.log`; único runtime directo: Fastify |
| Typecheck de aplicación y factories A/B | PASS condicionado | `application-types.log`, `registry-types-a/b.log`, con `skipLibCheck` |
| Typecheck completo de dependencias | FAIL | `strict-types-final.log`: 72 errores en `.d.ts` de terceros; cero errores propios finales |
| Build y ejecutar JavaScript NodeNext | PASS | `modular-build/http.log`; imports `.js` reales |
| HTTP 200, 400, 404, 413, 500 sanitizado | PASS | `modular-http.log`, test con servidor HTTP real |
| Swagger antes de rutas y spec válida | PASS | Swagger Parser valida `/docs/json`, paths propios presentes |
| Docs OFF elimina UI y JSON | PASS | HTTP 404 para `/docs` y `/docs/json` |
| UI opt-in | PASS | `/docs/` HTTP 200; no se habilita por defecto |
| Operaciones Better Auth en Swagger de Fastify | FAIL si se promete cobertura automática | Catch-all oculto; `/api/auth/sign-up/email` ausente del spec Fastify |
| Spec Better Auth separado | PASS | Endpoint real entrega 30 paths, incluyendo signup/signin; no prueba DB |
| Generar esquema Better Auth | PASS | CLI `auth@1.7.7`, 4 tablas; repetición sin mismatch |
| Generar y revisar migración Drizzle | PASS | SQL versionado, `drizzle-check.log`, repetición sin cambios |
| Aplicar/reaplicar migración contra PG real | BLOQUEADO | `migration-real-attempt.log`, exit 1; no servidor operativo |
| Integridad DB / SQL injection / namespaces / usuarios mínimos | BLOQUEADO | No conexión real; schema generado usa `public`, no aislamiento `auth` validado |
| Registro/login/session/logout/refresh | BLOQUEADO | Requiere PostgreSQL real |
| 401 sin cookie | PASS limitado | Guard del fixture rechaza anónimo; no prueba sesión válida |
| 403 por rol, anti-admin y ownership de jobs | BLOQUEADO | `input:false` del rol es configuración, no prueba anti-escalada |
| CORS permitido y origen hostil | PASS limitado | Allowlist observada y signup con Origin hostil devuelve 403 antes de DB |
| Cookies Secure/SameSite, múltiples cookies, Host/proxy HTTPS | BLOQUEADO | Glue usa URL configurada y `getSetCookie`; falta round-trip con sesión y HTTPS |
| DB habilitada sin DSN | PASS | Arranque termina antes de listen, mensaje útil |
| Readiness con caída de PG | BLOQUEADO | Hay fixture; no caída/reconexión real de PG |
| A: migración BullMQ y repetición | BLOQUEADO | Factory tipada instalada; sin servidor PG |
| A: producer/worker, retries, dedup y recuperación | BLOQUEADO | No ejecutar contra PG impide declararlo funcional |
| B: producer → worker separado, resultado | PASS | JS compilado en proceso hijo; `valkey-jobs-tests-live.log` |
| B: retry exponencial acotado | PASS | 3 intentos; al menos 300 ms de backoff acumulado |
| B: deduplication + `jobId` | PASS | Colisión antes de consumo no duplica trabajos |
| B: fallo permanente y payload inválido | PASS | Estado failed; payload inválido detiene retries con UnrecoverableError |
| B: worker SIGKILL y recuperación | PASS | Lock expira, segundo worker completa el mismo trabajo |
| B: efecto antes de ack | PASS limitado | 2 ejecuciones, 1 archivo de efecto mediante clave idempotente; no exactly-once universal |
| B: SIGTERM con trabajo activo | PASS | Worker drena trabajo antes de salir |
| B: backend SIGKILL + AOF + reconexión | PASS | 100 pendientes persistidos y completados; producer rechaza durante outage |
| B: política `noeviction` | PASS | Flags reales del servicio; no prueba de saturación de memoria |
| B: TLS, failover y crash de host/disco | BLOQUEADO / no ensayado | Un único proceso local; SIGKILL no equivale a pérdida eléctrica |
| Transacción app → enqueue atómica / outbox | BLOQUEADO | No implementado ni probado; compartir PG no garantiza atomicidad |
| Rendimiento A/B equivalente y auth bajo jobs | BLOQUEADO | Solo benchmark B; no ranking ni p95 auth inventados |
| Registry universal sin frontend | PASS condicionado | Instala 4 bloques en A/B con bootstrap previo; no components.json |
| Registry en orden A y orden inverso B | PASS limitado | Dos consumidores generan y compilan; no prueba todos los subconjuntos/órdenes |
| Registry repetido | PASS | 8 archivos idénticos omitidos; snapshot sin cambios |
| Registry `--dry-run` / `--diff` sin components.json | FAIL | CLI pide frontend config, sale 0 por stdin cerrado, no muestra preview útil |
| Rechazar ambos jobs antes de mutar | FAIL | Instala deps y escribe backend; prompt de colisión, exit 0 |
| Preservar archivo editado por consumidor | PASS limitado | Sentinel permanece; colisión requiere interacción, no flujo autónomo completo |
| Item ausente / versión inexistente | PASS | Error explícito, invalid file ausente y package.json preservado en ensayo inválido |
| Fallo de instalación con rollback total | FAIL | Primer pnpm falla después de mutar package/lock; shadcn no revierte automáticamente |
| Registry GitHub/tag/SHA publicado, `pnpm dlx`/`npx` | BLOQUEADO / no ensayado | CLI instalada y fijada, fixtures servidos en loopback; no publicación ni prueba remota |
| Auditoría original sin advisories | FAIL | 2 high + 2 moderate; `audit.log` |
| Corrección Swagger UI 6.1.2 | PASS limitado | Install, frozen, build y 3 HTTP tests pasan; desaparecen advisories de static |
| Auditoría completa posterior | FAIL | Persisten braces high en toolchain y esbuild moderate; prod: esbuild optional moderate |

El registry experimental distribuye factories y el entrypoint de composición; el worker probado vive en `prototype/src/worker.ts`. **No se certifica que esos items constituyan una distribución completa de workers y migraciones para consumidores.** La matriz de subconjuntos, un worker A, exposición protegida de docs en producción, backup/restore PG, actualización de schema y rollback siguen pendientes.

Los documentos OpenAPI obtenidos del servidor de prueba se conservan completos en `evidence/fastify-openapi.json` y `evidence/better-auth-openapi.json`; permanecen separados.

## Versiones exactas

| Pieza | Versión instalada y probada |
|---|---|
| Node / pnpm / npm | 24.19.0 / 11.25.0 / 11.9.0 |
| fastify / @fastify/cors | 5.12.7 / 11.3.1 |
| @fastify/swagger | 9.9.2 |
| @fastify/swagger-ui | 5.2.6 original; **6.1.2 corrección HTTP comprobada** |
| drizzle-orm / drizzle-kit | 0.45.4 / 0.31.11 |
| better-auth / drizzle-adapter / auth CLI | 1.7.7 / 1.7.7 / 1.7.7 |
| bullmq / pg / ioredis | 6.3.14 / 8.23.1 / 5.11.1 |
| TypeScript / @types/node / @types/pg | 5.9.3 / 24.19.2 / 8.23.1 |
| shadcn / Swagger Parser | 4.21.4 / 13.1.0 |
| PostgreSQL | 16.15, binario verificado; **no operativo** |
| Valkey | 8.1.4, compilación oficial; operativo nativo |

Los primeros metadatos de latest daban ioredis 6, TypeScript 7 y tipos Node 26. Se eligieron deliberadamente ioredis 5, TypeScript 5.9 y tipos Node 24 para mantener el baseline de la receta; no se presenta ese cambio como una incompatibilidad probada de las versiones latest.

`prototype/pnpm-lock.yaml`, `ui6/pnpm-lock.yaml` y los lockfiles de consumidores contienen integridades y transitivas exactas. `evidence/package-metadata.json` conserva engines, peers, licencias y dist metadata de las dependencias directas; `dependencies.log` conserva el grafo de instalación. Drizzle ORM y TypeScript declaran Apache-2.0; las demás dependencias JS directas consultadas declaran MIT. Valkey usa BSD-3-Clause y PostgreSQL PostgreSQL License. No se auditó legalmente cada transitiva/imagen. No hubo imágenes de contenedores ni SBOM estándar certificado.

**Compatibilidad funcional parcial, no aprobación general:** el éxito de install/peers no corrige los 72 errores de declaraciones de terceros. `skipLibCheck` mantiene `strict` en código de aplicación pero deja sin verificar `.d.ts` de Better Auth/Drizzle, incluyendo imports opcionales de dialectos ajenos y un error genérico de organización.

## Comparación A versus B

| Dimensión | A: PostgreSQL para datos/auth/jobs | B: PG datos/auth + Valkey jobs |
|---|---|---|
| Servicios previstos | 1 PostgreSQL | PostgreSQL + Valkey |
| Servicios ejecutados | Ninguno operativo | Solo Valkey; PG bloqueado |
| Instalación / tipos app / JS | PASS condicionado | PASS condicionado |
| Auth sobre PG | Sin medición | Sin medición |
| Jobs reales | Sin medición | 6 tests de comportamiento PASS |
| Kill worker | Sin medición | Recuperación observada: 3.718 s en corrida retenida |
| Kill backend | Sin medición | 100/100 pendientes completados tras restart |
| Complejidad operativa | Menos servicios previstos; migrador BullMQ PG y conexión LISTEN adicionales sin validar | AOF/noeviction y segundo servicio previstos; restart local validado |
| Impacto jobs en auth/PG | Desconocido | Desconocido; aislamiento de cola es una propiedad del diseño |
| Comparación de capacidad | **No calculable** | Resultados unilaterales debajo |

### Benchmark B, sin extrapolación

Mismo host y configuración para seis corridas: 500 trabajos aritméticos triviales por corrida, 3 repeticiones por modo, worker separado con concurrencia 4. Cola pausada durante enqueue; luego resume y se mide hasta completar/verificar los 500 resultados. Valkey nativo con `appendonly yes`, `appendfsync always`, `noeviction`. Total: **3.000 trabajos benchmark verificados**, separados de tests de fallos.

| Mediana de 3 corridas | Enqueue jobs/s | Processing jobs/s | p95 procesamiento lógico |
|---|---:|---:|---:|
| Enqueue secuencial | 7.019 | 7.635 | 1 ms |
| Enqueue bulk | 23.098 | 7.949 | 1 ms |

Rangos observados: secuencial enqueue 5.281–9.191 jobs/s; bulk 23.059–28.081; processing 5.781–7.957. La variabilidad es importante para corridas tan cortas. Throughput de processing incluye polling/resume del harness. p95 usa timestamps de BullMQ en milisegundos, excluye espera previa en la cola pausada y tiene resolución muy baja para este processor. **No es p95 end-to-end, carga de negocio ni benchmark de producción.** No se igualaron cargas contra A porque A no pudo ejecutarse.

Evidencias: [corridas](evidence/benchmark-valkey.json), [comportamiento](evidence/valkey-jobs-tests-live.log), [persistencia](evidence/valkey-persistence-2.log). Producer outage rechazado en 1 ms; restart más drenaje de 100 trabajos, 1.160 s. No confundir esos intervalos.

## Problemas y correcciones necesarias

1. **Runner con PG real y contenedores.** Repetir DB/Auth y A/B bajo PostgreSQL 16+ con usuario ordinario. No resolver este gate sustituyendo PostgreSQL por mocks, SQLite o PGlite. Usar instancia descartable propia, no secretos ni bases existentes.
2. **Bootstrap pnpm antes del registry.** Precrear política `allowBuilds` específica: `esbuild: true`, `msgpackr-extract: false`. El native extract es opcional y su fallback se probó. shadcn copia ese YAML después de instalar deps, demasiado tarde para un consumidor totalmente vacío. No aprobar todos los scripts de forma global. Conservar excepciones explícitas de release age para Fastify/BullMQ publicados ese día.
3. **Preview universal.** shadcn 4.21.4 excluye el fast path universal cuando `dryRun || diff || view`; se comprobó por lectura del código instalado y reproducción. Necesita versión corregida o previsualización segura alternativa verificada antes de publicar. Código de salida 0 con prompt sin responder no aprueba el gate.
4. **Conflicto jobs y rollback.** Validar selección antes de llamar a shadcn y antes de instalar dependencias/escribir archivos. Los registry items no expresan la exclusividad solicitada. El prompt de sobrescritura no la implementa. Hace falta checkpoint/diff del consumidor y estrategia de recuperación de package/lock, sin borrar modificaciones propias.
5. **UI vulnerable.** Reemplazar Swagger UI 5.2.6 por 6.1.2: se probó su compatibilidad HTTP con Fastify 5.12.7. La actualización elimina los dos advisories de `@fastify/static`. No extender este PASS a features no ensayadas.
6. **Toolchain vulnerable restante.** `braces@3.0.3` (shadcn) tiene advisory high sin versión parcheada publicada según audit; esbuild 0.18.20 llega por loader de Drizzle Kit y queda reportado también como peer opcional en prod. Separar toolchain del runtime y validar una actualización/override antes de adoptarla. No se aplicaron overrides no probados.
7. **Tipado.** Investigar/corregir upstream o aceptar explícitamente `skipLibCheck` acotado con typecheck propio estricto. No afirmar typecheck completamente verde con el comando original.
8. **Auth y seguridad pendientes.** Generar schema estable y migrar con Drizzle como único dueño; namespace `auth` aún no validado. Probar signup/login/logout, cookie y renovación, 401/403 con identidades reales, anti-admin, tenant ownership, Host y proxy HTTPS, múltiples Set-Cookie, CORS/CSRF y errores de DB sanitizados.
9. **Jobs completos.** Completar worker y migrador A, distribución de workers/migraciones, budgets de pool/LISTEN, retención, versiones de payload, outbox para DB+enqueue crítico, backup/restore y schema upgrades/no-downgrade. La clave idempotente del fixture protege un efecto de prueba frente a restart de proceso; no crea una garantía universal de exactly-once.

## Evidencia y reproducción

Todo comando registrado tiene argv, cwd, UTC, duración, exit code y log en [commands.jsonl](evidence/commands.jsonl). Algunos outputs de intentos iniciales fueron sobreescritos por el primer runner; esas filas están marcadas `log_retained:false`, sin referencia engañosa a otra corrida. No sustentan el dictamen. La versión final del runner asigna logs únicos y conserva stdout/stderr antes de terminar.

Para reproducir, copiar este directorio a un laboratorio nuevo fuera del backend y conservar intacta la entrega original. Preparar Node/pnpm exactos, instalar con los lockfiles, compilar `prototype` con `pnpm exec tsc --skipLibCheck`; ejecutar `node --test tests/http.test.mjs`. Descargar Valkey del tag/commit indicado y compilar `make -j4 BUILD_TLS=no MALLOC=libc` en `valkey/`, crear `valkey-data/`; `python3 services.py jobs` arranca servicio y corre tests, benchmark y persistencia dentro de una sola sesión. Los logs se guardan en `evidence/`; `effects/` son datos sintéticos del test y se regeneran. Para el registry, `python3 registry.py`, luego `python3 services.py registry fixed`: el harness final crea consumidores nuevos en un directorio único de `registry-runs/`, conserva cada exit code, verifica snapshots y devuelve exit 1 mientras fallen preview/exclusividad. Ese exit 1 es el NO-GO observado, no un fallo de ejecución inesperado. `python3 check-registry-harness.py` comprueba que los pasos requeridos pasan y esos contratos incumplidos producen un dictamen no-cero. `registry-extra.py` ensaya colisión y dependencia inválida sobre las copias históricas `consumer-fixed-*`, solo en el laboratorio copiado. Los manifests con loopback son fixtures, no URLs de distribución publicadas.

No hay lint configurado para estos fixtures; no se declara PASS de lint. Sin PostgreSQL operativo, no ejecutar workers A ni interpretar los smokes A/B con jobs OFF como validación completa. El smoke adicional B con jobs ON solo prueba boot/close del productor con Valkey, no autentica usuarios sobre PG.

### Revisión independiente

La revisión de evidencia no encontró conclusiones A/B o PostgreSQL funcional que excedieran los datos. Encontró dos defectos importantes del harness de registry: reutilización de consumidores poblados y exit 0 pese a fallos internos. Se corrigieron con consumidores nuevos por corrida, propagación de gates y salida estructurada. La prueba de contrato primero falló mostrando el exit 0 erróneo; después pasó exigiendo los PASS internos y exit 1 por los dos contratos del registry aún incumplidos. Evidencias: `harness-regression-red.log`, `harness-regression-green.log`, `registry-gates-latest.json` y `registry-runs/*/gates.json`.

Se conservan dos limitaciones menores explícitas: (1) los JSON agregados de benchmark/persistencia y logs de servidor representan la última corrida y se sobrescriben al repetir el harness en el mismo laboratorio; usar una copia nueva por corrida para conservar el historial, además de los logs de comandos únicos; (2) el test de efecto antes de ack comprueba existencia del archivo y múltiples ejecuciones, pero `uniqueEffects:1` es una etiqueta del fixture, no una medición de efectos externos ni una aserción sobre contenido/identidad del archivo. El PASS se limita a esa comprobación de supervivencia del archivo e idempotencia del processor de prueba; no certifica un sistema de efectos externos.

Referencias primarias consultadas para interpretar contratos, separadas de evidencia de ejecución:

- [BullMQ PostgreSQL](https://docs.bullmq.io/guide/postgresql): factory tipada, migrador separado, ownership del pool y límites operativos.
- [Better Auth Fastify](https://better-auth.com/docs/integrations/fastify), [CLI](https://better-auth.com/docs/concepts/cli) y [Drizzle](https://better-auth.com/docs/adapters/drizzle).
- [shadcn Universal Items](https://ui.shadcn.com/docs/registry/examples), [formato de item](https://ui.shadcn.com/docs/registry/registry-item-json).
- Advisories exactos y severidades quedan en `audit.log`, `ui6-audit.log` y `audit-prod-ui6.log`; no se sustituyen por un resumen documental de seguridad.

**Gate para cambiar a GO completo:** pasar DB/Auth/A, repetir B con auth real, carga A/B equivalente, security suite, registry preview/conflicts/rollback y auditoría aceptable. Hasta entonces, mantener el backend original y esta receta experimental separados.
