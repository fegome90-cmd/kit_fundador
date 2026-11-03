# R4-A0 · auditoría y límites de evidencia

Fecha: 2026-11-03. Work Unit: `KIT-LEGO-R4-A-20261103`.
Baseline: `main@f3112674e8d12fdd88f98c791c743a86847a5b2d`.
Primer candidato: `24ccf67927d4c422e71f2f0280e1dc8c5ea0b56d`.

## Alcance y autorización

El usuario autorizó iniciar R4 y luego revisar, probar E2E, reparar y fusionar **esta entrega** si no quedan hallazgos pendientes. El corte evaluado es R4-A0, no el cierre de R4-A ni R4 completo. La prohibición inicial de merge se sustituye sólo por la autorización condicionada al SHA final, CI/E2E y revisión final satisfactoria. No autoriza publicación, despliegue ni datos reales.

El claim permitido es un contrato de configuración probado. No se ha implementado SDK, OTLP, instrumentación Fastify, métricas ni Collector. Timeout validado no equivale a cancelación implementada; destino validado no equivale a DNS/TLS/SSRF/IAM verificados.

## Evidencia inicial conservada

La revisión inicial está registrada en el historial `24ccf679` y en la PR. Su TDD observó: scaffold compilable sin export → assertion RED; GREEN de 47 subcasos; seis regresiones RED por normalización de URL; GREEN de 53 subcasos, 54 registros con el contenedor. El paquete de evidencia de la conversación conserva los logs y el historial local, que no es un clon del repositorio remoto.

CI inicial R4: run `41625400722`, Node 24.22.1, pnpm 11.25.0, TypeScript 5.9.3; Core 13/13 y R4 54/54 registros. CI raíz inicial: `41625400745`. Estas ejecuciones sólo prueban aquel candidato, no los commits posteriores.

## Reparaciones de la revisión actual

| Hallazgo | Reproducción previa | Cambio y verificación local |
|---|---|---|
| Puerto 0 aceptado | Destinos HTTP(S) con puerto 0 se resolvían | Rechazo explícito y regresión |
| Configuración heredada | Un prototipo podía activar o proporcionar valores | Sólo propiedades propias; siete casos, seis RED y uno de compatibilidad; GREEN posterior |
| Carpeta con espacios | `URL.pathname` conservaba `%20`; el subproceso no encontraba el archivo | `fileURLToPath`; mismo recorrido pasa en carpeta con espacios |
| Imports ESM nombrados eludían el arnés | Hallazgo CodeRabbit confirmado: copia temporal con `lookup` insertado recibía PASS indebidamente | `syncBuiltinESMExports`; canario detecta la mutación y el resolver real sigue verde |

Después de estas reparaciones, las pruebas locales de JS compilado reportan 62/62 registros (incluido el contenedor original), typecheck y build strict. Entorno auxiliar: Node 22.16.0 / TypeScript 5.8.3; no sustituye la CI Node 24.

```sh
tsc -p tsconfig.json --noEmit
tsc -p tsconfig.json
node --test tests/*.test.mjs
```

## E2E del corte A0

Consumidor Core externo con lockfile congelado y ruta con espacios → módulo compilado copiado → resolución de configuración → proceso Fastify real → HTTP → cierre limpio y puerto libre. Cuatro escenarios válidos y tres inválidos. El destino testigo no debe recibir conexiones; los logs no deben contener centinelas sintéticos. No se usa un mock de Fastify.

El E2E necesita dependencias reales de Core. El entorno auxiliar no tiene DNS para instalarlas; la ejecución completa corresponde a GitHub Actions, no se sustituye por simulaciones. El run final, SHA, logs y resultado se registran en la PR y en el artefacto `r4-a0-verification-<run_id>`. Este documento no anticipa su PASS.

## Revisión adicional del 3 de noviembre: accesores propios

La auditoría independiente del cierre detectó que una propiedad propia declarada mediante getter (por ejemplo `enabled` o `endpoint`) podía ejecutarse en `own()` y lanzar una excepción con un centinela sensible. Reproducción local sobre JavaScript compilado: `touched=1` y mensaje `SYNTHETIC_SECRET_EXPOSED` sin sanitizar. Se escribieron dos pruebas antes del fix y ambas quedaron RED (2 fallos, exit 1); se cambió la lectura de propiedades por `Object.getOwnPropertyDescriptor`, rechazando accesores con un error fijo sin ejecutarlos. El recorrido local posterior pasó 64/64 registros de `node:test` con Node 22.16.0 / TypeScript 5.8.3, `tsc --noEmit` y build compilado. Estos resultados sólo acreditan el entorno auxiliar: hay que repetir el E2E y el conjunto de CI sobre el **SHA nuevo** antes de afirmar GO. Los proxies siguen fuera del contrato de entrada.

## Revisión externa final sobre `8000a0c9`: lectura ambiental OFF

El 2026-11-03T13:27Z CodeRabbit completó la revisión sustantiva de los 14 archivos hasta `8000a0c9d9d131cbebc022413c062071881b4103`. Identificó una brecha menor del arnés: comprobaba mutación del entorno, no lecturas de `process.env` ignoradas en las llamadas OFF. Se reprodujo el defecto del arnés con una copia **temporal** del JS compilado que ejecutaba `void process.env.R4_IGNORED_ENV_READ` al entrar en el resolver: el test antiguo terminaba PASS indebidamente. Al instrumentar la lectura de claves del entorno con `Proxy` sólo durante las dos llamadas OFF, la misma mutación fue RED (exit 1, `R4_UNEXPECTED_ENV_READ`), mientras el resolver real volvió a GREEN. El descriptor original se restaura en un `finally` antes de la llamada ON. Un segundo canario automatiza este escenario sin cambiar producción ni eliminar los controles existentes.

Verificación auxiliar reproducida: Node 22.16.0, TypeScript 5.8.3; typecheck/build y dos canarios locales en verde (DNS + lectura ambiental). Estos recibos NO sustituyen CI Node24, Core ni E2E; la promoción exige nuevos runs del SHA reparado y **otra revisión sustantiva del HEAD cambiado**. El nuevo conteo esperado del arnés es 65 (antes 64, un canario añadido).

## Warning editorial detectado por CodeRabbit tras `c8cdcef`

La revisión terminada del HEAD `c8cdcef1efc7c05d5cec44457368655acc8abe9f` calificó el riesgo de merge como mínimo y no registró reparos nuevos del código, pero su pre-merge check **Docstring Coverage** mostró una advertencia de cobertura 75% frente al mínimo 80% (4 funciones analizadas). Por la condición de cero reparos, no se interpretó el check CodeRabbit `success` como habilitación automática de merge. Se agregaron docstrings exclusivamente a los cuatro helpers existentes del test de lifecycle E2E (`deadline`, `start`, `get`, `networkWitness`), sin modificar lógica, casos ni configuración. El resultado del umbral debe ser comprobado con otra revisión completa del SHA nuevo y CI Node24/E2E nuevas; no se da por resuelto por declaración.

## Revisión sustantiva del 3 de noviembre (17:14Z) y regresiones adicionales

CodeRabbit completó el review del HEAD `5ed6f801b1ce568b9cd98ffcf9c9501caad36a85` con check SUCCESS, riesgo de merge mínimo y cinco pre-merge checks conformes. **Docstring Coverage pasó a 100%**, sobre el umbral 80%. Pese a ello, produjo dos observaciones menores válidas de cobertura de pruebas: (1) la trampa `process.env` se instalaba después de importar `dist/config.js`, por lo que una lectura ambiental ignorada durante evaluación del módulo escapaba; (2) el E2E explícitamente OFF cubría destino inválido, pero no un destino válido suministrado en las opciones OFF bajo vigilancia HTTP.

La primera brecha fue reproducida localmente con un módulo sintético que lee `process.env.R4_IGNORED_IMPORT_ENV_READ` en su nivel superior: el arnés antiguo reportó PASS (exit 0) indebidamente. La nueva trampa permanece activa durante el import dinámico y durante las llamadas OFF; filtra sólo accesos cuyo stack señala el módulo compilado, para distinguirlos de sondas internas del cargador ESM (por ejemplo `WATCH_REPORT_DEPENDENCIES` observado bajo Node 22). En la reproducción auxiliar, el módulo mutado terminó RED con `R4_UNEXPECTED_ENV_READ` y el módulo limpio terminó GREEN. Se añade un canario automatizado de import-time sin alterar el resolver.

La segunda se cubre añadiendo un séptimo E2E: OFF con endpoint válido del testigo local, con aserción de cero conexiones. Se conserva el caso anterior de destino inválido inactivo y los tres rechazos. **Resultados auxiliares no reemplazan Node24 ni E2E real.** Después del nuevo commit deben pasar Core 13, contrato/arnés 66 y E2E 7, y obtenerse una nueva revisión sustantiva sin reparos antes de merge. No se modifica el comportamiento de producción ni se extiende A0 a SDK/Collector.

## Revisión y promoción

**Standards:** tipos propios strict/skipLibCheck false, configuración sin dependencias, resultado congelado, errores constantes, tests de JS compilado, consumidores/procesos aislados, artefactos sintéticos y cambios acotados.

**Spec:** A0 y su lifecycle E2E son el corte. A1–A3/B no se ejecutaron y mantienen sus gates; no hay rendimiento medido ni E2E de telemetría. La revisión del ejecutor no reemplaza CodeRabbit ni la decisión de Felipe.

Merge permitido únicamente después de revisión terminada sobre el SHA final, CI/E2E verde, cero hallazgos pendientes con disposición verificable, diff permitido y comprobación del SHA al fusionar. Ausencia provisional de comentarios no significa revisión concluida. Cero hallazgos pendientes se limita al alcance revisado; no significa ausencia absoluta de defectos.

## Protección y reversibilidad

Core/OpenAPI, DB/Auth/Jobs/S3, Express y manifiestos/lockfiles existentes permanecen intactos. Sólo cambia el add-on, su workflow y documentación focal. Antes de merge, cerrar la PR conserva `main`; después, un revert requeriría decisión explícita y comprobación del estado actual. No se fuerza el merge ni se eluden protecciones.

La CI inicial emitió deprecaciones del tooling/Actions v4. No se reinterpretan como fallo del resolver ni como ejecución libre de advertencias. Las suites de otros add-ons no se declaran reejecutadas si no existen runs que lo prueben.
