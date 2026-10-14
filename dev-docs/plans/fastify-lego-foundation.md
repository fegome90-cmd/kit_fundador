# RFC: Fastify LEGO Foundation — Kit Fundador

**Estado:** propuesta de implementación, sin cambios de runtime realizados.
**Fecha:** 2026-10-13.
**Rama:** `feat/fastify-lego-foundation`.
**Baseline:** `main@e41936eb815512cc1dc05731c4bd4a6f7501f135`.

## Objetivo

Ofrecer una plantilla TypeScript/Node que arranque y pase todas sus verificaciones desde un clon limpio. Se ensamblan capacidades mediante plugins Fastify y recetas de servicios **opt-in**. Los agentes ayudan a desarrollar, pero no forman parte del backend mínimo.

### No objetivos

- Ningún microservicio, base de datos, caché, autenticación, Docker o modelo de IA obligatorio.
- No construir un plugin manager, hot-loading, marketplace, service mesh, framework de DI ni generador de código complejo.
- No forzar DDD, CQRS, eventos de dominio, Kubernetes o monorepo a los proyectos generados.
- No mover o reescribir la documentación histórica ni integrar PRs no relacionados.

## Arquitectura en tres niveles

1. **Core:** un proceso Fastify sin dependencias externas: bootstrap, configuración, HTTP, validación, errores, logging, seguridad, health y tests.
2. **Add-ons:** plugins explícitos registrados con `app.register(plugin, options)` dentro del mismo proceso; cada uno optativo y con configuración y pruebas independientes.
3. **Servicios externos / microservicios:** procesos independientes solo con justificación técnica (escalado, aislamiento, backend externo existente). Se levantan mediante Docker Compose profiles o se conectan por URL; el core permanece ejecutable sin ellos.

### Criterios para decidir plugin vs microservicio

- Preferir plugin cuando comparte ciclo de vida, despliegue y escala con el backend.
- Preferir servicio externo para PostgreSQL, Valkey, almacenamiento S3 o proveedor de identidad cuando realmente se necesitan.
- Extraer un worker solo ante trabajos asíncronos que requieran independencia operativa; no crear microservicios por carpeta.
- Documentar el coste: conexión, credenciales, readiness, tracing, retries e idempotencia cuando corresponda.

## Stack del core propuesto

| Capacidad | Tecnología | Obligatorio |
|---|---|---|
| Runtime | Node.js 24 LTS | Sí |
| HTTP | Fastify 5 | Sí |
| TypeScript | `module: NodeNext`, ESM coherente, JS compilado ejecutable | Sí |
| Desarrollo y tests TypeScript | `tsx` + `node:test` + `app.inject()` | Sí, solo devDependencies para tests |
| Configuración | `@fastify/env` + esquema estricto | Sí |
| Schemas de entrada/salida | JSON Schema + Ajv nativo; Type Provider si evita tipos duplicados | Sí |
| Logging | Pino integrado con request ID y redacción | Sí |
| Seguridad | `@fastify/helmet`, body limit prudente, CORS no permisivo | Sí |
| Errores | Handler pequeño compatible con RFC 9457 | Sí |
| OpenAPI UI | `@fastify/swagger` y UI como addon | No |
| Datos | Drizzle + PostgreSQL o SQLite según receta | No |
| Auth | Better Auth (requiere persistencia cuando sea necesaria) | No |
| Trabajos | BullMQ + Valkey y worker opcional | No |
| Telemetría | OpenTelemetry | No |

**Gate ESM:** no aceptar una rama porque `tsc` pase: `node dist/server.js` debe arrancar realmente en Node 24.

## Directorios objetivo

```text
templates/
  core-fastify/
    src/app.ts                  # buildApp() sin listen ni side effects
    src/server.ts               # entrypoint, signals y graceful shutdown
    src/config/env.ts           # validación y fail-fast
    src/plugins/health.ts
    src/plugins/errors.ts
    src/plugins/security.ts
    tests/                     # node:test y inject
    package.json
    tsconfig.json
    .env.example
  addons/
    api-docs/                  # único addon real en el primer PR
    database-postgres/         # PR futuro
    identity-better-auth/      # PR futuro
    jobs-bullmq/               # PR futuro
    storage-s3/                # PR futuro
    observability-otel/        # PR futuro
  services/
    worker-bullmq/             # PR futuro
recipes/
  postgres/
  valkey/
  worker/
  storage/
examples/
  identity-access/             # migración del dominio User existente
scripts/
  create-project.mjs           # generador mínimo, no motor dinámico
dev-docs/plans/fastify-lego-foundation.md
```

## Contrato de una pieza LEGO

**Plugin en proceso:**
- Exportar `FastifyPluginAsync<Options>`; configuración explícita y validada.
- Usar encapsulación de Fastify por defecto. `fastify-plugin` solamente cuando sea necesario compartir decorators; preferir `encapsulate: true` para los módulos aislados.
- No imports opcionales dentro del core por defecto, ni side effects al importar.
- Si adquiere recursos, liberarlos en `onClose`; tests de enabled, disabled, error, cleanup.
- Cada pieza debe aportar código funcional; no crear clases/interfaces sin uso solo para cumplir plantilla.

**Servicio o microservicio:**
- Proceso con su propia configuración, ciclo de vida, health/readiness y logs.
- Contrato HTTP/OpenAPI o mensajes versionados y documentados; endpoints y errores comprobados.
- Perfil Compose optativo cuando corresponda, con healthcheck y persistencia.
- Nunca habilitarlo implícitamente al ejecutar el core. Si la pieza requiere el servicio, fallar con error claro cuando falte.

**Receta:** pequeño documento de integración, variables y dependencias requeridas, comando de arranque y tests. Sin manifiestos o registro de plugins propio hasta demostrar necesidad.

## Inventario de migración

| Componente actual | Decisión |
|---|---|
| `src/index.ts` | Sustituir por `buildApp()` puro + `server.ts` sin efectos al importar |
| `src/infrastructure/http/server.ts` | Portar a Fastify; retirar middleware Express y arreglar 400/404/413/500 |
| `src/infrastructure/http/dto/*` | Sacar del core; schemas específicos quedan en ejemplo |
| `User`, `Email`, `Password`, `RegisterUserAccount`, repositorio in-memory | Preservar en `examples/identity-access`, inactivo por defecto |
| Registro público de `role: admin` | Prohibir escalada; control de roles solo por autoridad autenticada |
| Contraseñas 8 vs 12 caracteres | Unificar límites y estados de error |
| `scripts/migrate.ts` y SQL demo | Conservar fuera del core, decidir Drizzle Kit en add-on de DB |
| `docker-compose.dev.yml` | Mover gradualmente a recetas y profiles optativos |
| `config/observability` | Add-on posterior |
| `scripts/setup.sh` | Conservar hasta que el nuevo init pruebe paridad, luego deprecar |
| `web/` | Fuera del scaffold backend, mantener como proyecto independiente |
| ADR, context, EJECUTOR/VALIDADOR y guardrails | Herramientas de desarrollo opcionales, nunca dependencia de runtime |

## Rama y secuencia de checkpoints

**Checkpoint 0 — Baseline**
- Ejecutar y registrar `npm ci`, lint, typecheck, test, build y ejecución del JS compilado de `main`, distinguiendo fallos preexistentes.
- Documentar contratos HTTP heredados y dependencias. Revisar secretos del repositorio público.
- No integrar automáticamente cambios no mergeados de `feature/task-005-phase-3-e2e-testing`.

**Checkpoint 1 — Fastify core**
- Añadir `templates/core-fastify/` de forma paralela al backend Express, sin borrarlo hasta validar paridad.
- Implementar configuración, ruta `/health`, manejo coherente de errores, logging, seguridad y parada por señales.
- Tests unitarios y HTTP con `app.inject()`; smoke sobre `node dist/server.js` desde un clon limpio, sin Docker.

**Checkpoint 2 — Plugins**
- Registro explícito de capacidades desde `buildApp`; documentar encapsulación, opciones, error y teardown.
- Único plugin de prueba funcional: `api-docs` con OpenAPI, deshabilitado por defecto.
- Testear que activar el add-on agrega sus rutas y desactivarlo no altera el core.

**Checkpoint 3 — Aislamiento del ejemplo y cutover**
- Mover Identity & Access como ejemplo optativo, preservando lógica de dominio y pruebas útiles.
- Solucionar autorregistro `admin` y discrepancias de validación de contraseñas.
- Cuando los smoke tests estén verdes, convertir Fastify en la ruta de inicio predeterminada; mantener rollback simple.

**Checkpoint 4 — Primer montaje LEGO**
- Crear CLI mínima `scripts/create-project.mjs`: `--name`, `--path`, `--with api-docs`, `--dry-run` y rechazo de directorios no vacíos.
- El generador copia un proyecto independiente y produce imports explícitos; no debe requerir el repo original al ejecutarse.
- Probar dos proyectos generados: core solo y core+api-docs. Ambos instalan, testean, compilan y arrancan.
- Documentar un contrato para servicios externos, sin introducir workers o colas todavía.

**Checkpoint 5 — Calidad y PR**
- CI obligatorio: lint, typecheck, tests, build, smoke del artefacto, test del scaffold y scanning de secretos.
- README / quickstart coherentes con lo entregado; ninguna función prometida por fuera de lo verificable.
- Abrir **un solo PR** cuando estén verdes los gates y no queden hallazgos críticos.

## PR posteriores: uno a la vez, siempre desde main ya actualizado

1. `feat/lego-postgres`: Drizzle + PG + migraciones + tests con contenedor efímero.
2. `feat/lego-auth`: Better Auth; depende del adaptador de persistencia, tests anti-escalada y permisos.
3. `feat/lego-worker-valkey`: BullMQ + Valkey + **primer microservicio real** separado, con retry, cierre y prueba end-to-end.
4. `feat/lego-storage-s3`: interfaz S3, backend local opcional, contrato de subida/descarga.
5. `feat/lego-observability`: OpenTelemetry opt-in, colector opcional, protección de datos sensibles.

Los PRs #36-40 y #76-77 de Dependabot quedan aparte; no mezclar upgrades incompatibles durante el port.

## Definition of Done — Foundation

- [ ] En Node 24: `npm ci`, `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` verdes.
- [ ] El **JS compilado** arranca y responde `/health` 200; para correctamente con SIGTERM.
- [ ] Configuración inválida falla antes de escuchar en un puerto.
- [ ] 400 JSON malformado, 404 ruta inexistente, 413 payload grande y 500 sanitizado probados.
- [ ] Correlación por request ID y logs JSON; sin secretos/password/token en salida; CORS cerrado por defecto.
- [ ] Core instala y corre sin Docker, Postgres, Redis, credenciales, auth ni servicios externos.
- [ ] `api-docs` puede activarse/desactivarse sin afectar las rutas del core.
- [ ] Scaffolding no destructivo genera proyectos independientes core y core+api-docs verificables.
- [ ] Identity & Access no está en el core; ninguna solicitud pública puede asignarse rol admin.
- [ ] Los tests heredados tienen plan de preservación/migración; estado de paridad verificable.
- [ ] Nada se fusiona a `main` sin review de código y evidencia en CI.

## Riesgos / rollback

- **ESM y alias:** prueba del JS compilado, no solo tsc; sin `module-alias` oculto.
- **Acoplamiento de plugins:** encapsulación, imports explícitos, tests disabled/enabled.
- **Dependencias externas:** profiles optativos, timeout/ready/error claros; core libre de red.
- **Seguridad:** auth demo no habilitada, validación de roles y reglas únicas de passwords.
- **Mega-PR:** fundación en esta rama; add-ons en PRs posteriores secuenciales.
- **Rollback:** la rama es aislada; no borrar el backend antiguo hasta verificar la paridad. Revertir el PR si se observa regresión tras merge.

## Referencias oficiales

- Fastify plugins: https://fastify.dev/docs/latest/Reference/Plugins/
- Fastify encapsulation: https://fastify.dev/docs/latest/Reference/Encapsulation/
- Fastify validation: https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/
- Fastify lifecycle: https://fastify.dev/docs/latest/Reference/Server/
- Fastify type providers: https://fastify.dev/docs/latest/Reference/Type-Providers/
- Node.js releases: https://github.com/nodejs/Release
- Docker Compose profiles: https://docs.docker.com/reference/compose-file/profiles/
- HTTP Problem Details: https://www.rfc-editor.org/rfc/rfc9457.html
