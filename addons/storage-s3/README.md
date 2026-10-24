# LEGO Storage S3 · complemento experimental

**Estado:** R3 en evaluación. No es una distribución npm, un servidor S3, ni está aprobado para producción. `private:true`.

Un consumidor Fastify registra `app.register(createStorageS3Plugin({...}))` explícitamente. Si el módulo no se registra, Core sigue atendiendo `/health` sin red, bucket, credenciales ni Docker. Con el módulo activado, son obligatorios bucket, región, prefijo y credenciales explícitas. Por defecto, abrir el cliente valida la configuración pero **no hace llamadas a S3**; la validez de permisos y existencia del bucket se comprueba al usar una operación. Un preflight `HeadBucket` es opt-in.

## Alcance

`putObject`, `getObject`, `deleteObject`; longitud acotada, claves ASCII relativas y `keyPrefix` obligatorio, content-type permitido, abort y cierre de recursos.
El add-on no implementa identidad, IAM de bucket ni rutas públicas. Un consumidor debe verificar principal y propiedad antes de operar. Nunca construir permisos a partir de un nombre de usuario proporcionado directamente por la solicitud.
Los datos de prueba y claves se mantienen sintéticos.

## Pruebas

`.github/workflows/lego-storage-s3.yml` ejecuta Node 24, SDK S3 fijado y Silo compatible con S3 en un servicio efímero. No utiliza las imágenes retiradas `minio/minio`. El resultado se demuestra por contenido byte a byte, errores negativos, aislamiento de rutas de laboratorio y cierre de conexiones. La licencia del servidor usado en CI es diferente de la licencia del cliente AWS SDK; este módulo no redistribuye el servidor.



## Compatibilidad AWS IAM y permisos mínimos

La opción `verifyBucketOnOpen` es **`false` por defecto**. AWS S3 requiere `s3:ListBucket` para `HeadBucket` sobre un bucket de propósito general; por eso no se ejecuta automáticamente. Para validarlo durante el arranque, configurar `verifyBucketOnOpen: true` y conceder `s3:ListBucket` en el recurso bucket, además de los permisos necesarios por objeto. Las credenciales restringidas a operaciones sobre un prefijo pueden operar sin ese permiso extra.

Para subir, leer y borrar dentro de un prefijo controlado, los permisos aplicables a los objetos incluyen `s3:PutObject`, `s3:GetObject` y `s3:DeleteObject` en `arn:aws:s3:::BUCKET/PREFIX/*`. Esto **no define una política IAM completa** ni sustituye la autorización por usuario que debe realizar el consumidor.

Sin `s3:ListBucket`, AWS S3 puede devolver **403 AccessDenied** al consultar un objeto inexistente; el cliente propaga ese caso como `Storage S3 operation failed`, **nunca como `null`**. `getObject() === null` solo es un `NoSuchKey` reconocido. Por tanto, el consumidor no debe deducir existencia, propiedad o permisos a partir de una respuesta 403. La prueba de 403 utiliza un servicio HTTP S3-simulado: no se han ejecutado pruebas contra una cuenta AWS con políticas IAM reales.

Los nombres de bucket se validan siguiendo las reglas de **S3 general-purpose**: se rechazan IPv4 literales, etiquetas con `.-` o `-.`, puntos consecutivos y prefijos/sufijos reservados. Para un backend compatible con S3 que use nombres distintos habrá que evaluar el contrato explícitamente.

## Semántica de abort y timeout

`Storage S3 aborted` significa que el **cliente interrumpió la espera o la operación local**, no que el servicio haya deshecho una escritura. En un `PUT`, el servidor puede haber recibido y confirmado internamente los bytes antes de perderse la respuesta: el estado remoto es entonces **indeterminado**. La suite reproduce este caso con un servidor que recibe los bytes completos y no responde. Evitar reintentos automáticos con nuevos nombres; utilizar claves estables, conciliación posterior y un mecanismo de estado/idempotencia definido por la aplicación antes de usarlo con efectos reales.

## Gate de independencia de Core

La CI `LEGO Storage S3` ejecuta `addons/storage-s3/scripts/verify-core-off.mjs`, que instala, tipa, prueba e importa **la plantilla real `templates/fastify-core`**, en otro directorio de Node 24 con lockfile congelado. Se comprueba `/health` y que Storage no introduce rutas ni dependencias por defecto. El test básico en `tests/storage.test.mjs` usa bare Fastify para probar sólo el comportamiento general del framework, no sustituye el gate de Core.

Fuente técnica: [RFC LEGO S3](../../dev-docs/plans/lego-storage-s3-2026-10-23.md).

El backend de CI es **Silo RELEASE.2026-10-18T00-00-00Z**, fijado además por digest OCI; sus imágenes y licencias no se distribuyen con este paquete. El cliente TypeScript usa `@aws-sdk/client-s3@3.1149.0` y un lockfile comprometido. [Auditoría R3](AUDIT.md).
