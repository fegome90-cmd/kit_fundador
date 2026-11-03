# R4 · OpenTelemetry opt-in — ejecución por cortes

Fecha: 2026-11-03. Baseline: `main@f3112674e8d12fdd88f98c791c743a86847a5b2d`.
Work Unit: `KIT-LEGO-R4-A-20261103`. Autoridad de alcance, riesgos y merge: Felipe.

## Gobierno y alcance

Método Híbrido v1.1 RC2 seleccionado desde Kernel/Registry activos. Ruta: plan entendido → spec/tickets mínimos → TDD → revisión Standards/Spec → verificación. Perfil operacional FULL_ANTIDRIFT M0–M10 por continuidad multi-sesión, promoción y benchmark futuro; no implica infraestructura adicional. El ejecutor no se presenta como aprobador o revisor independiente.

Autorización inicial: iniciar R4 sin fusionar. Instrucción posterior: revisar, probar E2E, reparar y fusionar esta entrega si no hay hallazgos pendientes. **Corte de integración actual: R4-A0.** No autoriza publicar, desplegar ni afirmar R4 completo. PHASE: review; STATUS: active, sujeto a los gates de la PR #89.

GOAL R4-A: consumidor Fastify con telemetría opt-in sin alterar Core ni dependencias predeterminadas. DONE WHEN R4-A: HTTP y métrica recibidos por Collector real efímero, privacidad en origen, OFF sin SDK/red, fallos acotados, paquete consumido externamente y coste medido. Integrar A0 no satisface esa definición. STOP WHEN: falta de evidencia, fuga de centinelas, cambio de alcance o necesidad de modificar superficies protegidas/usar secretos/producción.

## Contrato A0

`resolveObservabilityOptions(input?: unknown)` es puro. Devuelve una unión readonly e inmutable OFF/ON. Sin configuración, con objeto vacío o `enabled:false`, devuelve OFF sin leer entorno ni exigir endpoint. No crea SDK, conexiones, timers, listeners, rutas ni procesos. Sólo se leen propiedades propias del objeto; no se acepta activación ni valores heredados.

ON admite `enabled`, `serviceName`, `endpoint`, `sampleRatio`, `exportTimeoutMs`, `shutdownTimeoutMs`; rechaza otras claves enumerables de texto. No coerciona flags. Servicio: identificador ASCII minúsculo de 3–63 caracteres, suministrado por la aplicación, no identidad de usuario. La entrada es configuración controlada, no objetos JavaScript hostiles con getters/proxies.

Endpoint: origen OTLP HTTP(S), sin credenciales, path distinto de `/`, query ni fragment; puerto explícito distinto de 0. HTTP sólo para hostname normalizado `127.0.0.1`, `localhost` o `[::1]`; fuera de ellos exige HTTPS. No verifica DNS, TLS, autenticación, disponibilidad, redirecciones ni SSRF. R4-A1 deberá evitar redirecciones y autodetección de exportadores/recursos por entorno.

Sampling finito [0,1], default 1 de laboratorio. Export timeout entero 100–5000 ms, default 1000; shutdown entero 100–10000 ms, default 2000 y no menor al timeout de exportación. Son presupuestos validados, no cancelación implementada. Errores constantes sin valores, causas ni credenciales. OFF ignora deliberadamente la configuración inactiva.

## Tickets y aceptación

| ID | Entrega / demo | Dependencia | Gate | Estado |
|---|---|---|---|---|
| R4-A0 | Configuración explícita y lifecycle Core independiente | Alcance actual | RED/GREEN, tipos estrictos, Core intacto, E2E, review final | En revisión |
| R4-A1 | Petición HTTP y métrica llegan al Collector | A0 | Versiones/pin/lockfile, ESM Node 24, Collector real y paquete externo | Pendiente |
| R4-A2 | Privacidad, fallos y cierre sobre esa receta | A1 | Centinelas en exportación; allowlist origen; collector caído/lento; shutdown acotado; no duplicados | Pendiente |
| R4-A3 | Coste y cierre de R4-A | A2 | OFF/ON comparable p50/p95/CPU/RSS; revisión independiente; SHA/CI final | Pendiente |
| R4-B | HTTP → PostgreSQL → job/worker | R4-A aceptado | Extensión retrocompatible, contexto correlacionado y deduplicación sin inferir permisos | Diferido |

No duplicar tickets en otro sistema sin necesidad. Cada corte mantiene los criterios de los siguientes; no renombra configuración como observabilidad implementada.

## Pruebas de A0

Pruebas contra `dist/config.js`, no contra un mock del resolver. El historial inicial conserva RED por export ausente y por normalización prematura de URL. La revisión añade regresiones de puerto 0, propiedades heredadas y portabilidad de paths. Un canario prueba que el arnés detecta una llamada DNS por import ESM nombrado insertada en una copia temporal del código.

La CI instala una copia real de Core fuera del checkout, con Node 24/pnpm fijado y lockfile congelado, compila el resolver y ejecuta su suite también desde una carpeta con espacios. No altera dependencias de Core. El entorno auxiliar local Node 22.16.0/TypeScript 5.8.3 sólo aporta evidencia suplementaria; sin DNS no puede reemplazar la CI real.

E2E: copia compilada del módulo → configuración → proceso Fastify real → HTTP → SIGTERM/SIGINT → salida normal y puerto libre. Configuración omitida, OFF y ON-resuelto mantienen Core independiente y cero conexiones al destino testigo. Tres inputs inválidos fallan antes del arranque sin filtrar centinelas. El servidor testigo no es Collector; no se afirma OTLP ni distribución por npm.

La CI raíz conserva sus gates. Las suites DB/Auth/Jobs/S3 no se declaran ejecutadas por transitividad. Logs sintéticos se conservan como artefacto y se vinculan a SHA/run en la PR. Un cambio de candidato invalida la evidencia afectada.

## Merge y reversibilidad

Permitido: `addons/observability-otel/**`, `recipes/observability/**`, workflow R4 y documentación focal. Core/OpenAPI, DB/Auth/Jobs/S3, frontend, Express, manifiestos raíz y pin MVP quedan intactos en R4-A. Jobs sólo se extiende en R4-B.

A0 puede integrarse después de CI general/Node 24 y E2E verdes, revisión externa terminada sobre el SHA final y sin hallazgos pendientes, diff acotado y comparación del SHA al fusionar. No se saltan protecciones. El paquete sigue privado `0.0.0`, sin SDK ni entrypoints públicos.

Antes de merge: cerrar la PR deja `main` intacto. Después: revert explícito autorizado, sin sobrescribir cambios ajenos. No hooks de instalación, publicación npm, datos reales, servicios persistentes ni despliegue. La falta de evidencia bloquea sólo la promoción afectada; no se inventa PASS.

## Decisiones futuras ya encaminadas, pendientes de ejecución

OTel opt-in con instrumentaciones individuales, candidato Fastify `@fastify/otel`; SDK antes de la aplicación y ESM probado contra JS compilado. Transporte candidato: OTLP HTTP/protobuf. Las versiones y compatibilidad requieren fuente oficial actual y CI; no se heredan de snippets. No asumir que `app.register` inicia el SDK de proceso.

Presupuesto candidato de p95: incremento ≤10%, condicionado a baseline estable; no es rendimiento observado ni umbral aprobado para producción. Si el baseline es ruidoso, declarar incertidumbre; no ajustar el criterio después de medir para declarar PASS.

Fuentes de diseño registradas al inicio (mutables, no evidencia de compatibilidad del candidato):

- https://github.com/fastify/otel/blob/main/README.md
- https://github.com/open-telemetry/opentelemetry-js/blob/main/doc/esm-support.md
- https://opentelemetry.io/docs/languages/js/libraries/
