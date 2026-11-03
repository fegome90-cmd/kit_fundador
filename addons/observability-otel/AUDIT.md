# R4-A0 · evidencia inicial y límites

Fecha: 2026-11-03. Work Unit: `KIT-LEGO-R4-A-20261103`.
Baseline remoto: `f3112674e8d12fdd88f98c791c743a86847a5b2d`.

## Claim permitido

Implementado y probado localmente el resolver puro de configuración R4-A0. No se ha implementado el SDK, exportación OTLP, instrumentación Fastify, métricas ni Collector. R4-A y R4 completo permanecen abiertos.

## TDD observado en este episodio

1. RED inicial: TypeScript compiló el scaffold `export {};`; el test falló con `R4_RED_MISSING_CONFIG_CONTRACT`, esperado `function`, observado `undefined`. Exit 1; 1 test fallido. No fue un error de descarga ni del runner.
2. GREEN inicial: implementación mínima, 47 subcasos y contenedor (48 tests reportados), 0 fallos.
3. RED de revisión: seis variantes de endpoint se aceptaban porque `URL` normaliza paths, marcadores vacíos y caracteres antes de inspeccionar sus campos. Se añadieron primero seis pruebas; fallaron las seis por ausencia de la excepción esperada.
4. GREEN final: validación de la forma original del origen antes de `new URL`; 53 subcasos + contenedor (54 tests reportados), 0 fallos, exit 0.

Comandos realmente ejecutados desde `addons/observability-otel`:

```sh
node --version                 # v22.16.0, entorno auxiliar
tsc --version                  # Version 5.8.3, entorno auxiliar
tsc -p tsconfig.json --noEmit
tsc -p tsconfig.json
node --test tests/config.test.mjs
```

El resultado local no sustituye Node 24/TypeScript fijado por Core. La evidencia de CI se vincula al SHA remoto en la PR; no se hereda automáticamente de este documento. Las salidas RED/GREEN del episodio se conservan en el paquete de trabajo adjunto a la conversación.

## Revisión del ejecutor, no auditoría independiente

**Standards:** código propio strict/skipLibCheck false, sin dependencias, red ni mutaciones ambientales; resultado congelado; errores constantes; tests sobre JS compilado; manifiesto privado sin publicación. Se observó y corrigió la normalización prematura de URL mediante regresiones. Pendiente revisión independiente.

**Spec:** A0 cubierto por los casos declarados; A1–A3 y B no ejecutados. No se reclasifica la validación de configuración como prueba de telemetría. El gate OFF del futuro SDK permanece pendiente. No se ha medido rendimiento.

## Entorno y calibración

El contenedor auxiliar no resolvió GitHub por DNS; Commander no respondió al probe de sólo lectura. Se utiliza el conector GitHub para una rama aislada y CI Node 24, sin depender de un checkout remoto accesible. No se afirma haber ejecutado subagentes, CodeRabbit ni Docker. Los tests de la raíz no se pudieron ejecutar localmente por ausencia de dependencias; su CI existente sigue siendo gate separado.

La validación de endpoints evita credenciales en URL y exige HTTPS fuera del loopback permitido. No es una barrera SSRF, prueba de identidad DNS/TLS, autorización de red ni garantía de seguridad del futuro exportador. No hay secretos ni datos clínicos; todos los centinelas son sintéticos.

## Promoción y reversibilidad

Estado: **inicio verificable de R4-A0; no apto para merge, distribución ni producción**. `main`, Core, otros add-ons y lockfiles existentes no se modifican. La PR permanece draft hasta completar los gates de R4-A o acordar explícitamente otro corte de integración. Cerrar la PR deja `main` intacto; cualquier merge requiere aprobación de Felipe.
