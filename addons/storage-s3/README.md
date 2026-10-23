# LEGO Storage S3 · complemento experimental

**Estado:** R3 en evaluación. No es una distribución npm, un servidor S3, ni está aprobado para producción. `private:true`.

Un consumidor Fastify registra `app.register(createStorageS3Plugin({...}))` explícitamente. Si el módulo no se registra, Core sigue atendiendo `/health` sin red, bucket, credenciales ni Docker. Con el módulo activado, el inicio requiere un bucket existente y credenciales explícitas.

## Alcance

`putObject`, `getObject`, `deleteObject`; longitud acotada, claves ASCII relativas y `keyPrefix` obligatorio, content-type permitido, abort y cierre de recursos.
El add-on no implementa identidad, IAM de bucket ni rutas públicas. Un consumidor debe verificar principal y propiedad antes de operar. Nunca construir permisos a partir de un nombre de usuario proporcionado directamente por la solicitud.
Los datos de prueba y claves se mantienen sintéticos.

## Pruebas

`.github/workflows/lego-storage-s3.yml` ejecuta Node 24, SDK S3 fijado y Silo compatible con S3 en un servicio efímero. No utiliza las imágenes retiradas `minio/minio`. El resultado se demuestra por contenido byte a byte, errores negativos, aislamiento de rutas de laboratorio y cierre de conexiones. La licencia del servidor usado en CI es diferente de la licencia del cliente AWS SDK; este módulo no redistribuye el servidor.

Fuente técnica: [RFC LEGO S3](../../dev-docs/plans/lego-storage-s3-2026-10-23.md).
