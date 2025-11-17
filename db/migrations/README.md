# Migrations

- Los archivos siguen el formato `YYYYMMDDHHMM__descripcion.sql`.
- Cada archivo define dos bloques: `-- up` (aplicar cambios) y `-- down` (revertirlos).
- Ejecuta `npm run migrate:create -- <descripcion>` para generar la plantilla con ambos bloques.
- Usa `npm run migrate:up` para aplicar todas las migraciones pendientes y `npm run migrate:down` para revertir la última entrada registrada en `kit_migrations`.
- Las migraciones son SQL puro para alinearse con el flujo de `node-pg-migrate` en modo file-based; sustituye el runner si instalas la herramienta oficial.
