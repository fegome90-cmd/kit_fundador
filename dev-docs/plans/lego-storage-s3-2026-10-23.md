# LEGO R3 — Storage S3: diseño y gates

**Fecha:** 23-10-2026 · **Estado:** propuesta experimental para PR, no producto ni despliegue.  
**Base:** `main@aa1b18dbb978679c34dca2d1a0e1765e0c91cf87`. **Fuente:** [LEGO-ROADMAP.md](../../LEGO-ROADMAP.md), R3.

## Decisión

Módulo opt-in `addons/storage-s3` para un **cliente de objetos, no un servidor de archivos**.
Usa AWS SDK v3 `@aws-sdk/client-s3@3.1149.0`, Node 24, TypeScript estricto, Fastify 5 peer, instalaciones de pnpm con lockfile, sin Docker ni S3 para usar Core sin módulo. `private:true`: no publicar npm/shadcn.
El cliente no crea buckets ni rutas HTTP. Su consumidor posee identificación/autorización y registros de propiedad. Las rutas de ejemplo con tokens sintéticos no constituyen proveedor de identidad.

**Backend de CI:** Silo `docker.io/pgsty/silo:RELEASE.2026-10-18T00-00-00Z` (fork mantenido que implementa la API S3), efímero y con salud explícita. No usar `minio/minio`, retirado de Docker Hub. No usar imagen `latest`. Solo dentro de CI. Anotar la licencia AGPL-3.0 de la implementación del servicio como riesgo de adopción distinto de la licencia Apache-2.0 del AWS SDK; obtener revisión legal antes de incluir un servidor en otro producto.

## Contrato estable R3

```ts
export interface StorageS3Options {
  endpoint: string; region: string; bucket: string;
  accessKeyId: string; secretAccessKey: string; keyPrefix: string;
  maxObjectBytes?: number; operationTimeoutMs?: number;
  registerRoutes?: (scope: FastifyInstance, storage: StorageS3) => void | Promise<void>;
}
export interface StorageS3 {
  putObject(key: string, bytes: Uint8Array, contentType: AllowedType, signal?: AbortSignal):
    Promise<{ key: string; bytes: number }>;
  getObject(key: string, signal?: AbortSignal):
    Promise<{ bytes: Buffer; contentType: AllowedType } | null>;
  deleteObject(key: string, signal?: AbortSignal): Promise<void>;
  close(): void;
}
export function openStorageS3(options: StorageS3Options): Promise<StorageS3>;
export function createStorageS3Plugin(options: StorageS3Options): FastifyPluginAsync;
```

**Superficie deliberadamente mínima:** tres operaciones; no CDN, multipart, presigned URLs, CORS, versioning, Object Lock, IAM provisioning, scanner, tratamiento de información sensible ni migraciones.
- `keyPrefix` debe ser un prefijo ASCII explícito, no vacío, y termina en `/`. El consumidor aporta una clave relativa (`a/report`); el add-on la valida, concatena y nunca acepta traversal, barras invertidas, `..`, % escapes, control chars o claves absolutas. Dos propietarios se aíslan **por el consumidor** usando un principal autenticado para escoger la clave, nunca por confianza en un identificador HTTP. Un prefijo no reemplaza IAM de bucket.
- Tamaño máximo configurable, hasta 1 MiB en v1; bytes no vacíos; `get` valida `ContentLength` y además limita cada chunk recibido para evitar descargas sin longitud declarada. MIME permitido: `application/octet-stream`, `application/json`, `text/plain`. Ningún HTML/SVG servido por defecto.
- Credenciales, bucket, región y endpoint explícitos; no recurrir a credenciales AWS implícitas ni logs sensibles. HTTP solo loopback; un endpoint remoto requiere HTTPS. Puerto, query, username, password, fragment y ruta extraños en URL se rechazan.
- `maxAttempts:1` y `AbortSignal.timeout` acotan latencia; errores de SDK se normalizan y nunca se reenvían con raw stack, DSN ni credenciales. `get` devuelve `null` solo para ausencia real de objeto, no para 403 o pérdida de conexión.
- El cliente se crea y verifica con `HeadBucket` **al registrar el plugin** o al llamar la factoría; un Core sin registro no conecta ni crea recursos. `app.close()` destruye conexiones administradas por el add-on.
- El servicio externo se crea **solo en el runner de CI**, junto con un bucket exclusivo de prueba. El ejemplo del consumidor prueba dos usuarios con tokens sintéticos que poseen distintas claves; no es un ejemplo de autenticación real.

## Red/Green y gates

1. RED: prueba ejecutable contra `dist/index.js` ausente; después implementar el mínimo cliente y contrato.
2. GREEN: `pnpm typecheck`, `pnpm test` en Node 24, con Silo real; arranque opt-in, round trip subidas/descargas/eliminación, inexistentes, objetos sobredimensionados, invalid key/prefix, credenciales erróneas, bucket ausente, interrupción, permisos cruzados en consumidor y teardown.
3. Reproducibilidad: copiar addon a directorio independiente, instalar con lockfile congelado y scripts bloqueados, compilar, `pnpm pack` privado, e instalar tarball por import público en un segundo proyecto con prueba JS + TS.
4. Auditoría: `pnpm audit --prod --no-optional` y `pnpm audit --audit-level high`, CodeRabbit y diff revisado. Los resultados deben ser del SHA final; avisos/waivers deben registrarse.
5. CI por rutas relevantes en `pull_request`, `push main` y `workflow_dispatch`. Core por defecto sigue sin Storage, DB/Auth/Valkey y sin Docker.
6. GO laboratorio únicamente; **merge pendiente de autorización**, sin datos clínicos, publicación ni servicio persistente. Probar disponibilidad y seguridad de backends reales es un gate R6, no R3.

## Riesgos y salida

S3 compatible no implica paridad perfecta AWS, política IAM, retención y borrado irreversible no están certificados. El backend Silo es exclusivamente infraestructura de test; mantenimiento, licencias, seguridad de imágenes y cambio de proveedor deben revisarse al adoptar.
Al no almacenar propietario ni ofrecer rutas, Storage S3 nunca sustituye la autorización por recurso del consumidor. Controles de prefijo son defensa adicional, no una frontera IAM si se comparten credenciales.

**GO** solo si artefacto de consumo, Node24, S3 real, negatividad, destrucción de conexiones, auditoría y CI se prueban sobre un SHA.
