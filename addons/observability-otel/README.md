# Observability OTel · R4-A0

Este directorio contiene el **contrato de configuración R4-A0**. No inicia OpenTelemetry, no instrumenta Fastify ni exporta trazas o métricas. Incluso ON sólo valida configuración en este corte. No es todavía un paquete de observabilidad consumible por npm.

## Contrato

`resolveObservabilityOptions` es puro: OFF por defecto, ON explícito, opciones acotadas y errores sin valores de entrada. Usa sólo propiedades propias; el prototipo no puede activarlo ni proporcionar sus valores. Requiere HTTPS fuera del loopback admitido y rechaza credenciales/query/path/fragment y puerto 0. No verifica DNS, TLS, disponibilidad ni autorización de red y no constituye una barrera SSRF.

La entrada es configuración controlada por la aplicación: se rechazan propiedades accesoras propias sin ejecutar sus getters (para evitar efectos laterales y exposición de errores), pero no se promete neutralizar objetos `Proxy` hostiles. Validar un timeout no demuestra cancelación de un futuro exportador. El manifiesto permanece `private:true`, versión `0.0.0`, sin SDK, scripts de instalación ni entrypoints de distribución.

## Verificación reproducible

La CI `LEGO Observability R4-A0 (config and lifecycle E2E)` instala el lockfile congelado de una copia de Core fuera del checkout con Node 24/pnpm 11.25.0. Usa su TypeScript para compilar este contrato, sin modificar dependencias ni lockfiles de Core. Ejecuta sus 13 pruebas y las pruebas del resolver sobre JS compilado, también desde una carpeta con espacios.

El E2E copia el módulo compilado al consumidor y ejecuta procesos Node y solicitudes HTTP reales, sin mockear Fastify. Comprueba configuración omitida, OFF con destino inactivo inválido, OFF con destino válido testigo y ON-resuelto; `/health`, ausencia de rutas OTel/docs, logs sin centinelas, cero conexiones al destino testigo, cierre SIGTERM/SIGINT y puerto liberado. Rechaza credenciales en URL, HTTP fuera de loopback y puerto 0 antes del arranque.

Este recorrido es **configuración → Core HTTP → cierre**, no `HTTP → SDK → Collector`. El servidor HTTP testigo cuenta conexiones; no se presenta como Collector. Un canario adicional verifica que el arnés detecta una llamada DNS insertada mediante import ESM nombrado en una copia temporal del módulo.

## Integración y continuidad

La instrucción posterior de Felipe autoriza revisar, reparar y fusionar **esta entrega A0** sólo con CI/E2E del SHA final y revisión externa sin hallazgos pendientes. El resultado exacto queda en la [PR #89](https://github.com/fegome90-cmd/kit_fundador/pull/89), no se infiere de la existencia de estos archivos.

La [spec](../../dev-docs/plans/lego-observability-otel-2026-11-03.md) y la [auditoría](AUDIT.md) conservan los gates. R4-A1/A2/A3 y R4-B siguen pendientes: SDK/Collector, privacidad de exportación, fallos/cierre reales, consumidor de paquete, rendimiento y correlación DB/worker. Integrar A0 no completa R4 ni autoriza publicación o producción.
