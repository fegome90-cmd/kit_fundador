# Observability OTel · R4-A en desarrollo

Este directorio contiene únicamente el **contrato de configuración R4-A0**. No inicia OpenTelemetry, no instrumenta Fastify y no exporta trazas ni métricas. No es todavía un add-on consumible por npm ni un paquete de observabilidad terminado.

La [spec y tickets de R4](../../dev-docs/plans/lego-observability-otel-2026-11-03.md) son el punto de continuidad. El resolver es puro: OFF por defecto, configuración ON explícita, transporte validado y errores sin valores sensibles. Validar configuración no prueba DNS, TLS, disponibilidad ni resiliencia de un exportador.

## Prueba reproducible del contrato

La CI `LEGO Observability R4-A (entry contract)` copia la plantilla Core a un directorio temporal, instala su lockfile congelado con Node 24/pnpm 11.25.0 y reutiliza su TypeScript para compilar este contrato. Después ejecuta `node --test addons/observability-otel/tests/config.test.mjs` sobre JavaScript generado. No cambia las dependencias de Core.

El manifiesto mínimo `private:true` y `0.0.0` no tiene scripts de instalación, SDK ni entrypoints de distribución. El lockfile propio y la API de runtime se incorporan en R4-A1 después de verificar las dependencias. No ejecutar `pnpm add` ni publicar este directorio como si fuera la entrega final.

## Gates todavía pendientes

SDK OFF/ON real; traza HTTP y métrica en Collector efímero; privacidad en el punto de exportación; cierre y fallos; consumidor externo; benchmark; revisión independiente. PostgreSQL/worker pertenecen a R4-B. Ningún PASS del resolver satisface esos gates.
