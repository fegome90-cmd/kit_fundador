# R3 — Storage S3: auditoría de laboratorio

**Corte:** 23-10-2026 · **PR:** [#88](https://github.com/fegome90-cmd/kit_fundador/pull/88) · **Estado:** propuesta, no integrada ni distribuida.

## Alcance y procedencia

- Nuevo complemento `@kit-fundador/storage-s3@0.1.0` privado y sin dependencia del Core por defecto.
- Cliente AWS SDK v3 `@aws-sdk/client-s3@3.1149.0` (Apache-2.0), configuración explícita, opciones tipadas, prefijo obligatorio, size cap máximo 1 MiB y solo MIME permitidos.
- Backend de prueba real compatible con S3: [PGSTY Silo](https://github.com/pgsty/silo), release `RELEASE.2026-10-18T00-00-00Z`; pin OCI `sha256:2636fc4155d9a7e41ff58cdb65ddd13ba9304e67184e13c25bc5cb34016269d7`, observado en Docker pull de [CI R3 39958592380](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39958592380). No usar MinIO comunitario archivado.
- Silo es un servicio de **CI**, no parte de `npm` ni del producto final. Su licencia AGPL-3.0 exige análisis específico solo si en el futuro se redistribuye/aloja en otra solución; no se afirma aprobación legal.

## TDD y pruebas de distribución

| Etapa | Evidencia | Dictamen |
|---|---|---|
| RED · implementación ausente | [39956991363](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39956991363): Silo listo; `ERR_MODULE_NOT_FOUND dist/index.js` esperado | RED observado |
| GREEN · S3 real y typecheck | [39957521124](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39957521124) | 7/7 PASS |
| RED · contrato empaquetado | [39957885565](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39957885565): falta `dist/index.d.ts` | Defecto reproducido |
| GREEN · declaraciones + consumidor independiente | [39958026890](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39958026890): `LEGO_R3_EXTERNAL_ESM_PASS`, `LEGO_R3_PRIVATE_PACKAGE_PASS` | PASS |
| CI congelada desde lockfile comprometido | [39958285464](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39958285464) | PASS |
| Endurecimiento de streams y cancelación | [39958592380](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39958592380): 8/8 test Node con PUT interrumpido y GET sin `Content-Length` | PASS |
| Auditorías dependencies | `pnpm audit --prod --no-optional` + `pnpm audit --audit-level high` en [39958592380](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39958592380) | Ambas `No known vulnerabilities found` a la fecha |

La suite verifica Core sin plugin, UTF-8/binario byte-perfect, CRUD/idempotencia, rechazos de key/prefix traversal y MIME, exceso de bytes al escribir y recibir, timeout/abort (incluido in-flight), credenciales equivocadas, bucket ausente, endpoint indisponible y teardown. La ruta HTTP de prueba deriva el prefijo por un principal **sintético** y bloquea accesos cruzados. No acredita una solución productiva de autenticación.

La compatibilidad S3 queda probada con el backend **señalado arriba**, no con todas las variantes AWS/IAM o todos los proveedores posibles. La prueba de `S3Client` externa importa por el export público sin rutas `../dist` internas del repositorio y verifica tipos desde un nuevo proyecto.

## Riesgos y condiciones de merge

1. **Accesos:** keyPrefix valida rutas, pero el mismo conjunto de credenciales tiene autoridad sobre el bucket. El consumidor debe aplicar identidad real y autorización por recurso; IAM específico de bucket/prefijo no está en R3.
2. **Límites:** máximo 1 MiB en v1 y content types de texto, JSON y binarios. No hay multipart, presigned URLs, Object Lock, cifrado administrado, scanning ni retención normativa.
3. **TLS y operación:** HTTP permitido **solo** a loopback, remoto requiere HTTPS. CI no demuestra TLS real, autorización IAM, HA, backups o recuperación del servicio.
4. **Dependencias:** auditorías correctas a una fecha no garantizan estado futuro; revisar lockfile/imagen OCI cada upgrade.
5. **Distribución:** tarball privado sin publicación npm/shadcn ni autoinstalación en proyectos ocupados. R5 definirá actualización y compatibilidad al distribuir.
6. **Datos:** no usar registros clínicos, secretos reales, información personal ni objetos sensibles en este laboratorio. Los mensajes de error son deliberadamente opacos.

**GO-laboratorio condicionado al CI del HEAD final y revisión CodeRabbit; NO-GO para producción/publicación.** La aprobación para fusionar este complemento sigue siendo responsabilidad del usuario; no ejecutar merge ni despliegue por esta PR.
