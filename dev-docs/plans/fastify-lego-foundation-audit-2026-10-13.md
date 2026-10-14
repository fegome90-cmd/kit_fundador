# Auditoría técnica — Fastify LEGO Foundation

**Fecha:** 2026-10-13 · **Estado:** REQUIERE REVISIONES ANTES DE IMPLEMENTAR · **Rama:** `feat/fastify-lego-foundation`.
**Fuente auditada:** `dev-docs/plans/fastify-lego-foundation.md` (199 líneas, commit `4342703ef6ddf263867a71aae343b7ddcefafcb7`).
**Alcance:** revisión estática del plan y de la configuración de `kit_fundador/main`, contrastada con documentación oficial. No se han ejecutado tests ni migrado código.

## Dictamen

**La dirección arquitectónica es válida** (Fastify, modularidad nativa, cero dependencias externas obligatorias, separación del dominio de ejemplo). **No se recomienda iniciar la migración completa tal como está formulada**: falta especificar composición reproducible, ciclo de actualización, compatibilidad y estrategia de PR revisable. Este documento registra hallazgos; NO modifica el RFC original.

### Hallazgos prioritarios

| ID | Nivel | Sección RFC | Problema | Corrección y gate exigidos |
|---|---|---|---|---|
| P0-01 | Bloqueante | L68-85, L145-149 | `--with` no define dependencias, versiones, cambios de código, orden de instalación ni combinaciones | Catálogo estático de **recetas de generación** (sin runtime plugin manager), lockfile y tests de composición |
| P0-02 | Bloqueante | L94, L104, L147 | Código copiado significa pérdida de actualizaciones y fixes posteriores | Declarar modelo de propiedad/ciclo de upgrades para core copiado y add-ons externos/versionados, incluido proceso de migración |
| P0-03 | Bloqueante | L123-154 | Un solo PR pretende migrar HTTP, extraer dominio, crear generador, seguridad y CI | Reducir PR fundacional a core+composición+scaffold; ejemplo de identidad se separa a PR posterior |
| P1-01 | Alto | L45, L69, L135-138 | `@fastify/swagger` no entrega UI por sí solo; el registro tardío pierde rutas | Agregar `@fastify/swagger-ui`, registrar swagger **antes** de las rutas y probar spec con endpoints reales |
| P1-02 | Alto | L22-23, L98-104, L149 | El plan de microservicios no define una interfaz verificable de integración externa | Contrato de servicio/versiones, timeouts, fallos, health/readiness; prueba con servicio HTTP falso sin Docker |
| P1-03 | Alto | L40, L93-95 | Ausencia de orden inicialización de env/plugins y alcance de decorators | `@fastify/env` antes de consumidores, `await app.register`/`ready`; explicit dependencies, scope y teardown |
| P1-04 | Alto | L38-41, L68-85, L168-175 | Combinaciones generadas sin estrategia explícita de package-lock, versiones e imports ESM | `npm ci` desde el resultado copiado y `node dist/server.js` para cada variante; TS NodeNext y `.js` en imports |
| P1-05 | Alto | L123-154, L168-178 | No separa CI legado del CI del template; no verifica combinación/portabilidad ni resultado aislado | Matriz de tests para plantilla, add-ons, combinaciones y ejecutable; resultado baseline histórico independiente |
| P1-06 | Alto | L42-45, L145-149 | Falta threat model del generador y del endpoint de documentación; CORS/trustProxy no especificados | Rechazar nombres/path traversal, symlinks peligrosos, dirs ocupados, docs off en prod, logs sanitizados y host seguro |
| P1-07 | Alto | L41 | Se plantea Type Provider sin matriz validada de versiones | Inicialmente JSON Schema nativo; introducir TypeBox solo tras PoC de tipos en Node 24/Fastify 5 |
| P2-01 | Mejora | L156-164 | Orden de addons decidido sin dependencias/valor de uso demostrados | Priorizar por necesidad real y dependencias de cada receta; no asumir un catálogo obligatorio |
| P2-02 | Mejora | L168-178 | DoD no mide costo operativo ni deriva a producción | Exigir salida limpia, mínimo de comandos, 0 edits manuales y ausencia de servicios externos en core |

## Evidencia de problemas específicos

### E1 — Swagger no es plug-and-play independiente del orden

- `@fastify/swagger` en modo dinámico requiere registrarse **antes** de las rutas, o no documentará las anteriores.
- La interfaz Swagger UI se sirve mediante un paquete distinto, `@fastify/swagger-ui`.
- Por tanto no basta añadir `app.register(apiDocsPlugin)` al final del `buildApp` ni tratar la documentación como un simple plugin encapsulado entre hermanos si su hook no ve sus rutas.
- Diseño mínimo: fases explícitas de registro `config -> global hooks / swagger -> routes/add-ons -> swagger-ui`, verificando encapsulación y precedencia; el addon se deshabilita completamente en el core mínimo.
- Test: con docs ON, la especificación contiene `/health` y una ruta de ejemplo; con docs OFF, ni UI ni `/documentation/json` deben existir. No publicar UI en producción salvo activación explícita.
- Fuente: https://github.com/fastify/fastify-swagger/blob/main/README.md
- Fuente: https://github.com/fastify/fastify-swagger-ui

### E2 — Compilación, generación y reusabilidad

- `main` incluye Node 20, CommonJS/Jest y alias runtime, y también un build con `module: es2022`; es fuente de regresiones si se mezcla con la plantilla nueva.
- La nueva plantilla se debe probar separada del repositorio anfitrión: dos instalaciones limpias generadas en directorios temporales.
- La CLI construye un `package.json` y `package-lock.json` coherentes con cada combinación. Un `npm ci` tiene que funcionar sin editar manualmente.
- Evitar sustituir el problema con un registro de plugins runtime: un mapa estático de recetas en el generador es suficiente.
- Registrar opcionalmente en un archivo **de build, no runtime** el template SHA, add-ons elegidos y versiones, para upgrades y trazabilidad.

### E3 — Semántica de la encapsulación y configuración

- `register` crea un scope; los decorators de un hijo no aparecen automáticamente en los hermanos. `fastify-plugin` puede romper la encapsulación, salvo `encapsulate: true`.
- Documentar dependencia real entre plugins (y fallar en boot si falta), además de callback/hook de liberación `onClose`.
- `@fastify/env` carga asíncronamente; sus consumidores deben registrarse después y esperar el readiness apropiado.
- Si usar env-schema directo antes de `buildApp` reduce complejidad, justificar la sustitución de `@fastify/env` por el menor contrato operativo.
- Fuente: https://fastify.dev/docs/latest/Reference/Encapsulation/
- Fuente: https://github.com/fastify/fastify-env

### E4 — Tipos, compatibilidad y licencias

- Node 24 es LTS; Node 20 pasó a EOL en marzo de 2026. Usar Node 24 como baseline y fijar versiones reales de Fastify y plugins por compatibilidad.
- El repositorio de `@fastify/type-provider-typebox` registra issues públicos de inferencia y compatibilidad entre ciertas versiones: no declararlo requisito hasta verificar el conjunto elegido.
- Las piezas opcionales pueden tener licencias y requisitos distintos; revisar también imágenes y dependencias transitivas antes de marcarlas listas.
- Fuente: https://nodejs.org/en/about/previous-releases
- Fuente: https://github.com/fastify/fastify-type-provider-typebox/issues/262

### E5 — Compose profiles

- Profiles no convierten dependencias arbitrarias en disponibles: Compose ignora servicios fuera del perfil salvo reglas específicas, y referencias a componentes sin perfil activo pueden producir error.
- No prometer funcionamiento de combinaciones de recetas hasta probarlas (`docker compose config --profiles ...` y arranque de servicios opt-in por separado).
- Fuente: https://docs.docker.com/reference/compose-file/profiles/

## Rediseño mínimo propuesto

### Contrato de receta **estática de generación**, no plugin manager

Una receta del generador debería describir:

```text
id: api-docs
kind: in-process-fastify-plugin
requires: []
conflicts: []
runtimeDependencies: { "@fastify/swagger": "compatible-v5", "@fastify/swagger-ui": "compatible-v5" }
files: ["src/addons/api-docs.ts"]
registerPhase: before-routes-and-ui-after-routes
env: []
tests: ["enabled", "disabled", "schema-completeness", "plugin-isolation"]
```

**Los campos anteriores son un ejemplo contractual, no un formato/version de dependencias para copiar literalmente.** Las versiones se seleccionan y bloquean con lockfile real. No hace falta exponer un manifiesto custom al servidor ejecutándose.

Para nuevos plugins: preferir referencia a paquete npm mantenido + configuración mínima. Copiar únicamente glue o scaffold del proyecto. Publicar un paquete propio versionado solo si más de un proyecto necesita actualizar el mismo módulo de forma coordinada.

### Contrato de servicios

- Cada dependencia externa declara endpoint/transport, versión de contrato, credenciales, timeouts, health/readiness y estrategia de fallo.
- No ocultar degradación: si se habilita un add-on que requiere DB/Valkey ausente, fallar de forma legible o exponer readiness degradada según política.
- CI del core usa cliente con stub local para probar la interfaz; integración real bajo job específico, contenedor efímero o ambiente de prueba.
- Sin broker, catálogo de descubrimiento, service mesh ni llamadas automáticas entre servicios por defecto.

## Alcance revisado de la primera entrega

**PR fundacional (rama actual):** solo plantilla Fastify que arranca, env, errores, seguridad, logs, health, CLI no destructiva, `api-docs` opcional y prueba de integración con un servicio HTTP falso (sin desplegar un microservicio). **No migrar todavía User/Password ni el frontend.**

**PR siguiente:** mover/quarantinar y corregir el ejemplo `identity-access`, con pruebas explícitas para impedir autoasignación `admin`, coherencia de contraseñas y contratos 400/409/500.

**PRs posteriores, uno a la vez:** PostgreSQL, autenticación, BullMQ+Valkey (primer worker real), almacenamiento y observabilidad. Cada módulo entra tras aprobar su propio contrato e integración.

El backend legado sigue en `main` durante la transición. El equipo debe distinguir pruebas de la raíz heredada de las pruebas del template nuevo; migrar rutas predeterminadas solo cuando el backend nuevo esté verificado.

## Gates revisados

| Gate | Verificación mínima automatizada |
|---|---|
| G0 — Baseline | Inventario reproducible de tests, errores y contratos heredados, sin maquillar los fallos |
| G1 — Core | En Node 24: install, typecheck, lint, test, build y `node dist/server.js` funcionando sin Docker/DB |
| G2 — HTTP | `/health`; JSON malformado 400, 404, payload grande 413 y error interno 500 sin filtrar datos sensibles |
| G3 — Plugins | Enabled/disabled; orden Swagger correcto; scopes/decorators aislados; close hooks y fallos de config |
| G4 — Composición | Generar core, core+docs, core+plugin de prueba y combinación; ejecutar tests de cada salida |
| G5 — Generador | `--dry-run` sin side effects; rechazar ruta no vacía, `..`, nombres inválidos, rutas fuera de destino y colisiones; cleanup seguro |
| G6 — Servicios | Stub remoto con timeout/error/health y versión de contrato, sin requerir Docker para core |
| G7 — CI | Los mismos gates en Linux, smoke del JS emitido, npm lockfile reproducible, auditoría de secretos y dependencias |

## Modelo de mantenimiento propuesto

- **Core copiado:** actualización posterior mediante guías de migración/changelog + diffs verificables, nunca sobreescribir aplicaciones consumidoras silenciosamente.
- **Plugins de terceros:** declarados y fijados en el lockfile del proyecto; actualizar por bot/PR con suite de compatibilidad.
- **Recetas propias:** cambios a la receta afectan creaciones futuras; para instancias existentes, publicar migraciones o un paquete propio solo si el mantenimiento compartido lo justifica.
- **Compatibilidad:** matriz explícita Node/Fastify/add-on; versión de template y commit de origen registrados en la salida para trazabilidad.

## Definición de 'aprobado para implementación'

- [ ] RFC corregido con contrato de composición y dependencias.
- [ ] Política de ownership y actualización aceptada.
- [ ] Se reduce alcance del primer PR sin perder pruebas core.
- [ ] Se define orden OpenAPI/Swagger UI y control de exposición.
- [ ] Se incorpora contrato básico para servicios externos.
- [ ] Se establece CI independiente para template y matriz de generador.
- [ ] Se definen controles de paths/secretos y pruebas negativas.

**Decisión final:** REVISAR RFC; mantener la rama actual. Esta auditoría es documental y no demuestra ejecución ni integración funcional.
