# R4 · OpenTelemetry opt-in — ejecución inicial

Fecha: 2026-11-03. Baseline: `main@f3112674e8d12fdd88f98c791c743a86847a5b2d`.
Autoridad de alcance/merge: Felipe. Autorización: iniciar R4 según el plan R4-A/R4-B; no fusionar, publicar ni desplegar.

## Work Unit y contrato de término

- Work Unit: `KIT-LEGO-R4-A-20261103`.
- Ruta: plan entendido → spec/tickets mínimos → TDD → revisión Standards/Spec → verificación.
- Método: Método Híbrido v1.1 RC2, seleccionado desde Kernel/Registry activos. No se modifica ni se publica la documentación normativa privada.
- Ejecutor: asistente; no aprobador ni revisor independiente. Merge y aceptación de riesgos: Felipe.
- PHASE: build. STATUS: active. Esta PR inicia R4; no cierra R4-A ni R4 completo.
- Perfil operacional: FULL_ANTIDRIFT, módulos M0–M10, por continuidad multi-sesión, límites de promoción y benchmark futuro. No implica crear infraestructura adicional.
- GOAL: consumidor Fastify con telemetría opt-in, sin alterar Core ni sus dependencias predeterminadas.
- DONE WHEN R4-A: HTTP y métrica reales recibidos por Collector efímero, privacidad en origen, OFF sin SDK/red, fallos acotados, consumo externo y coste medido.
- STOP WHEN: falta de evidencia, cambio de alcance, fuga de centinelas, modificación de superficies protegidas o necesidad de secretos/producción.

## Corte actual: R4-A0, contrato ejecutable de entrada

La primera slice resuelve y valida configuración explícita; no inicia SDK ni exporta telemetría. Evita decidir versiones o prometer comportamiento de una dependencia no ejecutada. El paquete permanece `private:true`, versión `0.0.0`, sin entrypoint público ni dependencias SDK hasta R4-A1.

`resolveObservabilityOptions(input?: unknown)` es pura. Devuelve una unión readonly e inmutable OFF/ON. Sin configuración, con objeto vacío o `enabled:false`, devuelve OFF sin leer entorno ni exigir endpoint. Con ON exige servicio y endpoint explícitos. No crea listeners, conexiones, timers, collectors, rutas ni procesos.

Opciones ON: `enabled`, `serviceName`, `endpoint`, `sampleRatio`, `exportTimeoutMs`, `shutdownTimeoutMs`. Claves desconocidas se rechazan. No se aceptan flags coercionados. Servicio: identificador ASCII minúsculo de 3–63 caracteres, no identidad de usuario. No implica que todos los nombres válidos sean datos públicos.

Endpoint: origen OTLP HTTP(S), sin credenciales, path distinto de `/`, query ni fragment. HTTP se admite solamente para `127.0.0.1`, `localhost`, `[::1]`; otros hosts exigen HTTPS. El resolver no verifica DNS, TLS, autenticación, disponibilidad ni redirecciones. R4-A1 deberá rechazar redirecciones y evitar auto-detección/exportadores o recursos activados indirectamente por entorno.

Sampling: finito en [0,1], default 1 de laboratorio. Timeout de exportación: entero 100–5000 ms, default 1000. Presupuesto de cierre: entero 100–10000 ms, default 2000 y no menor que el timeout de exportación. Son configuración, todavía no prueba de cancelación efectiva.

Los errores son constantes y no incluyen valores, URLs, causas ni credenciales. OFF ignora deliberadamente otros campos de configuración inactiva; ON falla ante campos desconocidos.

## Tickets y evidencia exigida

| ID | Slice / demo | Depende de | Gate | Estado inicial |
|---|---|---|---|---|
| R4-A0 | Resolver configuración OFF/ON y rechazar destinos/valores inválidos | alcance aceptado | RED observado; tipos estrictos y tests JS compilado; Core intacto | En ejecución |
| R4-A1 | Una petición Fastify y una métrica llegan al Collector | A0 | versiones verificadas/pin + lockfile; ESM Node 24; Collector real; paquete externo | Pendiente |
| R4-A2 | Privacidad, fallos y lifecycle sobre la misma receta | A1 | centinelas en payload/headers/URL/errores/resources; allowlist origen; collector caído/lento; shutdown acotado; no duplicados | Pendiente |
| R4-A3 | Coste, revisión y cierre de R4-A | A2 | OFF/ON comparable, p50/p95/CPU/RSS; Standards y Spec separados; SHA final/CI; decisión humana | Pendiente |
| R4-B | HTTP → PostgreSQL → job/worker | R4-A aceptado | telemetría opcional retrocompatible; correlación con deduplicación sin inferir permisos | Diferido |

Cada ticket conserva el demo, acceptance, evidencia y rollback en esta spec y el receipt de PR. No duplicar tickets en otro sistema sin necesidad.

## Verificación del primer corte

- Tests ejecutan `dist/config.js`, nunca sustituyen producción con un mock del resolver.
- RED: export ausente en scaffold → `R4_RED_MISSING_CONFIG_CONTRACT` (assertion, no fallo de instalación).
- GREEN: defaults, tipado/flags, allowlist, endpoints, sampling, timeouts, errores sanitizados, no mutación y ausencia de efectos de importación/resolución.
- Subproceso dedicado intercepta conectores de red y compara entorno/listeners. Este gate cubre el resolver, no demuestra todavía OFF del futuro SDK.
- CI Node 24 reutiliza temporalmente el toolchain congelado de `templates/fastify-core`; no modifica su lockfile ni instala un árbol OTel desconocido.
- CI también ejecuta typecheck/tests de Core real. La CI raíz existente conserva sus propios gates. Las suites DB/Auth/Jobs/S3 no se declaran reejecutadas si sus filtros no las disparan.
- El entorno auxiliar disponible es Node 22.16.0 + TypeScript 5.8.3. Sus resultados son suplementarios; no sustituyen CI Node 24 / TypeScript fijado del repo.
- No hay entorno local conectado con dependencias: DNS del contenedor no resuelve GitHub y Commander no respondió al probe de sólo lectura. No se ejecutan reintentos ciegos.

## Superficies protegidas y rollback

Permitido: `addons/observability-otel/**`, `recipes/observability/**`, workflow R4 y documentos focales de R4. Core/OpenAPI, DB/Auth/Jobs/S3, frontend, servidor Express, manifiestos raíz y pin de descarga MVP quedan intactos en R4-A. La extensión Jobs corresponde exclusivamente a R4-B.

Los commits se crean en rama dedicada. Rollback antes del merge: cerrar la PR/conservar o retirar sólo la rama de trabajo; nunca resetear `main` ni sobrescribir estado ajeno. Rollback posterior requeriría revert explícito autorizado. No hooks de instalación, publicación npm, servicios persistentes, datos reales ni credenciales.

## Decisiones técnicas ya aceptadas / pendientes de prueba

OTel será opt-in; instrumentaciones individuales, no paquete masivo. Candidato Fastify: `@fastify/otel`; SDK antes de cargar aplicación; ESM debe probarse con JS compilado. Transporte candidato: OTLP HTTP/protobuf. Las versiones y compatibilidad se seleccionan con evidencia de registro oficial y CI, no de snippets antiguos. No afirmar que `app.register` por sí solo inicia correctamente un SDK de proceso.

Presupuesto candidato de p95: incremento ≤10%, sujeto a baseline estable. No es medición realizada ni umbral aprobado para producción. Si el baseline es ruidoso, reportar incertidumbre; no ajustar post hoc el criterio para declarar PASS.

## Fuentes externas verificadas el 2026-11-03

- Fastify OTel, README oficial: https://github.com/fastify/otel/blob/main/README.md
- OTel JS, soporte ESM: https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md
- OTel, instrumentaciones individuales: https://opentelemetry.io/docs/languages/js/libraries/

Son fuentes mutables de diseño, no evidencia de compatibilidad del candidato. El método y la Library gobiernan la ejecución; estas fuentes no autorizan cambios de alcance.
