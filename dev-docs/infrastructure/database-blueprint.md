# Blueprint de base de datos y migraciones

Este documento traduce TASK-003 del backlog en un plan accionable que mantiene el repositorio como starkit. No crea
recursos reales; ofrece instrucciones, artefactos sugeridos y pruebas para que cada consumidor implemente su propia
pila de persistencia sin romper la neutralidad del kit.

## Principios

1. **Agnosticismo**. El blueprint asume Postgres como ejemplo porque combina bien con TypeScript y Python, pero los pasos se
   escriben para que puedan adaptarse a MySQL, SQLite o cualquier backend administrado.
2. **No dependencias nuevas**. Ninguna herramienta se instala por defecto. Las secciones de migraciones y seeds describen
   comandos y archivos esperados para que el equipo que adopte el kit los genere en su fork.
3. **Automatización primero**. Toda decisión debe reflejarse en `docker-compose.dev.yml`, `Makefile`, scripts npm y los docs.
4. **Reproducibilidad**. El setup debe poder ejecutarse desde `make db:up`/`make db:reset` y quedar validado con `npm run test`
   o `pytest`, según el stack elegido.

## Componentes esperados

| Componente | ¿Qué debe existir? | Propósito |
|------------|--------------------|-----------|
| Servicio `postgres` en `docker-compose.dev.yml` | Imagen oficial + volumen persistente + healthcheck | Dar base para desarrollo e integración local |
| Archivo `.env.example` | Variables `DATABASE_URL`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Evitar hardcodes y facilitar onboarding |
| Carpeta `db/migrations/` | Scripts numerados (`YYYYMMDDHHMM__descripcion.sql` o equivalente) | Versionar cambios de esquema |
| Script `npm run migrate` / `npm run migrate:dev` | Ejecuta migraciones usando la herramienta elegida (ej. `node-pg-migrate`, Prisma, Flyway CLI) | Automatizar la aplicación de migraciones |
| Script `npm run seed` / `scripts/seed.ts` | Generar datos base (admin user, feature flags) | Dejar ambientes reproducibles |
| Tests de smoke (`tests/integration/db/*.test.ts`) | Validar conexión, migraciones aplicadas y seeds mínimos | Detectar regresiones en pipelines |

## Minitareas sugeridas

1. **Definir proveedor y toolchain**
   - Elegir base de datos (Postgres recomendado).
   - Seleccionar herramienta de migraciones (Prisma Migrate, node-pg-migrate, Alembic, etc.).
   - Registrar la decisión en `dev-docs/tech-stack-decisions.md` y `.context/decision-log.json`.

2. **Extender `docker-compose.dev.yml`**
   - Añadir servicio `db` con imagen `postgres:16-alpine` o equivalente.
   - Configurar variables (`POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`).
   - Exponer puerto `5432` solo en entornos de desarrollo.
   - Agregar healthcheck basado en `pg_isready`.

3. **Configurar variables de entorno**
   - Crear `.env.example` con placeholders.
   - Actualizar scripts (`package.json`, `Makefile`) para leer `DATABASE_URL`.
   - Documentar cómo cargar el `.env` antes de ejecutar seeds/tests.

4. **Inicializar framework de migraciones**
   - Añadir carpeta `db/migrations/` con README que explique naming conventions.
   - Crear primer archivo `000000000000__bootstrap.sql` (vacío o con tabla `schema_version`).
   - Publicar comandos `npm run migrate:up` / `npm run migrate:down` y su contraparte en `Makefile`.

5. **Seeds reproducibles**
   - Documentar el contrato de `scripts/seed.ts` para que lea desde `.env` y cree datos mínimos.
   - Añadir sección en `README.md#🧰-personaliza-scripts-y-linters` o equivalente para recordar reemplazar el stub.

6. **Testing y observabilidad**
   - Crear pruebas de conexión (`tests/integration/db/connection.test.ts`).
   - Añadir un job opcional al Makefile: `make test:db` → `npm run test -- --testPathPattern=tests/integration/db`.
   - Registrar en la checklist de validación post-adaptación que se requiere `npm run migrate && npm run seed` antes de release.

## Revisión de código recomendada

- Confirmar que ningún archivo de producción apunta a credenciales reales: todo debe referenciar variables de entorno.
- Revisar que los scripts `make db:up`, `db:down`, `db:reset` se documenten en README antes de agregarlos.
- Asegurar que los migrators y seeds no se ejecuten automáticamente durante `npm test` para evitar side effects en CI compartido.

## Testing sugerido

| Tipo | Comando | Objetivo |
|------|---------|----------|
| Smoke manual | `docker-compose -f docker-compose.dev.yml up db` | Verificar que la base levante correctamente |
| Migraciones | `npm run migrate:up && npm run migrate:down` | Garantizar que los scripts sean reversibles |
| Seeds | `npm run seed` | Confirmar datos mínimos tras migraciones |
| Integración | `npm run test -- --testPathPattern=tests/integration/db` | Validar conexión/repositorios |

## Checklist para consumidores

- [ ] Definí el proveedor de base de datos y documenté la decisión.
- [ ] Actualicé `docker-compose.dev.yml` con el servicio `db`.
- [ ] Creé `.env` a partir de `.env.example` y configuré `DATABASE_URL`.
- [ ] Inicialicé la carpeta `db/migrations/` con la convención de nombres acordada.
- [ ] Actualicé los scripts de migración y seeds en `package.json`/`Makefile`.
- [ ] Añadí pruebas o health checks que verifiquen la conexión antes de ejecutar pipelines largos.
- [ ] Documenté en `dev-docs/task.md` que TASK-003 fue adaptada a mi stack.

## Enlaces

- `dev-docs/task.md#task-003-setup-database-y-migrations`
- `dev-docs/plan.md#fase-3-infrastructure`
- `README.md#🛡️-remediación-del-setup-interactivo` (recuerda ejecutar `npm run test:setup` después de modificar `scripts/setup.sh`).

> Una vez que el consumidor implemente estos pasos en su fork, debe actualizar `dev-docs/task.md`, `.context/project-state.json`
> y `.context/decision-log.json` para reflejar la nueva realidad. Mientras tanto, el starkit se mantiene liviano y listo para ser
> personalizado sin acarrear dependencias innecesarias.
