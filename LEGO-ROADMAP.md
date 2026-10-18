# Kit Fundador LEGO — Roadmap de producto y ejecución

**Versión:** 1.0 · **Fecha:** 18 de octubre de 2026.  
**Estado:** propuesta versionada para revisión; no autoriza implementar ni fusionar los hitos siguientes.  
**Baseline de código:** `main@fa8839e3f17fb34d812290fd8c8163fc00df583a`, después de la PR #84.  
**Plan original recuperado:** rama de investigación `feat/fastify-lego-foundation`, fijada en `0085a8558ff73a0d9b2e424d338df4bea85eaeb3`.  
**Autoridad de producto y merge:** Felipe.

## 1. Propósito y alcance

Construir un backend TypeScript/Node mínimo, funcional y reutilizable que permita **elegir, incorporar y mantener capacidades independientes**. El producto es el kit y la aplicación resultante; los agentes son herramientas opcionales de desarrollo, no una dependencia del servidor. La salida debe instalarse, probarse, compilarse y arrancar fuera de este repositorio. [S1] [S2]

Este roadmap reúne la fundación del 13 de octubre, su auditoría, la propuesta de distribución y la receta de cuatro capacidades; incorpora la reducción deliberada del MVP del 15 de octubre y el código integrado después. **No convierte el MVP reducido en toda la visión, ni reactiva automáticamente decisiones que fueron sustituidas.** [S1] [S2] [S3] [S4] [S5]

Al integrarse esta revisión, este archivo será el punto de entrada del roadmap LEGO. `LEGO-MVP.md` conserva el contrato operativo del bootstrap; los RFC y reportes conservan sus fechas y alcance. `dev-docs/plan.md`, `dev-docs/task.md` y `.context/` contienen planificación histórica que debe reconciliarse antes de usarla como instrucción actual. No se borrará ni reescribirá esa historia para simular continuidad.

## 2. Principios que se conservan

1. **Tres niveles, no un framework nuevo:** core Fastify; plugins explícitos en el proceso mediante `app.register`; servicios externos y workers separados únicamente cuando lo justifica su ciclo de vida, escalado o aislamiento. No crear un microservicio por carpeta. [S1]
2. **Core autónomo:** sin PostgreSQL, Valkey, autenticación, almacenamiento, Docker, frontend, collector ni IA obligatorios. Activar una pieza puede requerir su servicio; importar el core no debe conectarlo ni iniciarlo. [S1] [S5]
3. **Contratos visibles:** opciones validadas, dependencias y conflictos declarados, errores seguros, orden de registro comprobado y liberación de recursos. No hot-loading, decorators globales por comodidad ni descubrimiento dinámico de plugins. [S1] [S2]
4. **Reproducibilidad y propiedad:** versiones y lockfiles reales; proyectos independientes, sin rutas privadas del monorepo. El código copiado pertenece al consumidor; no sobrescribirlo ni actualizarlo silenciosamente. [S2] [S3] [S5]
5. **TDD y evidencia:** comportamiento real antes que abstracciones; pruebas del JavaScript compilado, escenarios negativos y CI del SHA revisado. DDD/CQRS, contenedores y agentes no se imponen al consumidor. [S1] [S2]
6. **Una pieza y una revisión a la vez:** PR acotadas desde `main` actualizado; revisión, correcciones y verificación antes del merge autorizado. Integrado no significa distribuido, y distribuido no significa apto para producción. [S1] [S5] [S6]

## 3. Trazabilidad: intención original, decisión posterior y pendiente

| Elemento del plan original | Situación al baseline | Tratamiento en este roadmap |
|---|---|---|
| Core Fastify y OpenAPI opcional | Dos plantillas integradas en #79 | Conservar. `api-docs` existe como capacidad en una variante precompuesta; no declararlo un add-on independiente ya distribuido. |
| Seguridad del registro e Identity & Access aislado | #80 y #81 integradas | Conservar el ejemplo independiente y las regresiones de seguridad; no migrar usuarios a Better Auth automáticamente. |
| PostgreSQL → Better Auth → worker Valkey | #82, #83 y #84 integradas como laboratorio | Cerrar consumo conjunto y contratos; no reconstruir módulos ya existentes. |
| **Storage S3 → observabilidad OpenTelemetry** | No entregados como add-ons en el baseline | Recuperar expresamente como las dos capacidades siguientes del plan original: R3 y R4. |
| `create-project.mjs` propio | Sustituido para proyectos nuevos por giget + SHA | No reintroducirlo por fidelidad literal al primer borrador. |
| Registry abierto y descubrimiento de piezas | ADR candidato y laboratorio; no distribución aprobada | R5: validar una vía existente y separar catálogo, instalación y actualización. |
| Sustituir Express como arranque predeterminado | Pendiente; la raíz sigue siendo el backend histórico de health | C1: transición independiente con paridad y rollback; no requisito del bootstrap autónomo. |
| `@fastify/env`, Helmet completo y `tsx` como selección inicial | El MVP redujo dependencias y su superficie de seguridad | Conservar el contrato funcional probado, documentar diferencias y evaluar medidas adicionales según uso. No afirmar paridad de seguridad completa ni reinstalar paquetes por lista. |
| Auth dependiente del add-on DB | La implementación exige PostgreSQL, pero no importa `db-postgres` | Distinguir dependencia de servicio y dependencia de paquete. Mantener pools, permisos y journals separados. |
| Full A con jobs PostgreSQL / Full B con Valkey | Evidencia investigativa; solo Valkey tiene add-on integrado | Full B será el primer consumidor de integración. Full A queda como línea condicionada I1, no eliminada ni disponible por defecto. |

Fuentes de la reconciliación: [S1] [S2] [S3] [S4] [S5] [S6]. La prioridad actual de Full B refleja el código integrado; **no declara un ganador universal del contraste A/B**.

## 4. Estado comprobado y límites de la evidencia

| Entrega | PR | Estado de integración | Alcance que puede afirmarse |
|---|---|---|---|
| Fastify Core + OpenAPI | [#79](https://github.com/fegome90-cmd/kit_fundador/pull/79) | Integrada | Bootstrap de proyectos nuevos; no servidor público listo. |
| Registro público seguro | [#80](https://github.com/fegome90-cmd/kit_fundador/pull/80) | Integrada | Corrección de seguridad del ejemplo heredado. |
| Identity & Access independiente | [#81](https://github.com/fegome90-cmd/kit_fundador/pull/81) | Integrada | Ejemplo opt-in; no proveedor de identidad productivo. |
| PostgreSQL/Drizzle | [#82](https://github.com/fegome90-cmd/kit_fundador/pull/82) | Integrada | Add-on experimental con migraciones explícitas y restricciones documentadas. |
| Better Auth | [#83](https://github.com/fegome90-cmd/kit_fundador/pull/83) | Integrada | Sesiones experimentales en PostgreSQL; autorización por recurso a cargo del consumidor. |
| BullMQ/Valkey | [#84](https://github.com/fegome90-cmd/kit_fundador/pull/84) | Integrada | Productor y worker separado; recuperación del worker, no certificación de failover de Valkey. |

Sobre el commit de integración `fa8839e3f17fb34d812290fd8c8163fc00df583a` terminaron en **SUCCESS** la [CI raíz 39122114193](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39122114193) y la [CI Valkey 39122114182](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39122114182). La CI raíz distingue el proyecto histórico y el ejemplo aislado; no equivale a ejecutar todas las recetas LEGO con Node 24.

La evidencia disponible prueba módulos aislados y composiciones individuales con Core. No se presenta como validada una aplicación consumidora Full B de los módulos integrados. Los resultados antiguos de laboratorio no sustituyen pruebas sobre el código y la vía de distribución actuales. [S4] [S6] [S7]

## 5. Secuencia de ejecución

Los IDs siguientes son **hitos**, no números de PR reservados. Las rutas futuras son destinos propuestos, no archivos que ya existan. Cada hito debe producir un entregable revisable; no se estiman fechas sin capacidad de ejecución y dependencias resueltas.

| ID | Entregable | Dependencia de entrada | Estado |
|---|---|---|---|
| R0 | Roadmap reconciliado y enlaces de entrada | Baseline #84 + fuentes originales | Redactado en esta revisión; revisión/merge pendientes. |
| R1 | Contratos de consumo y CI coherentes | R0 revisado | Siguiente trabajo técnico acotado. |
| R2 | Receta Full B reproducible con los módulos actuales | R1 | Pendiente. |
| R3 | Add-on Storage S3 | Contrato R1; entrega después de R2 | Siguiente capacidad nueva del plan original. |
| R4 | OpenTelemetry opt-in | Contrato R1; entrega después de R3 | Pendiente; no depende técnicamente de S3. |
| R5 | Distribución y mantenimiento de piezas seleccionadas | R2 y gates de cada pieza distribuida | Pendiente; no exige publicar todo el catálogo. |
| R6 | Piloto controlado y aptitud operativa por receta | R2/R5 y controles del escenario elegido | Condicionado; no despliegue autorizado. |
| C1 | Decisión y eventual transición del backend histórico | Inventario, paridad y rollback | Línea separada. |
| I1 | Evaluación de jobs PostgreSQL | Necesidad concreta y contraste A/B | Investigación condicionada. |

**Ruta recomendada:** R0 → R1 → R2 → R3 → R4. R5 amplía el consumo de piezas que hayan pasado sus gates; R6 evalúa un uso real concreto. C1 e I1 no deben bloquear el core ni convertirse en trabajo implícito.

R1 y R2 son un puente de cierre de las promesas de composición originales, no un reemplazo del backlog S3/OTel ni una nueva plataforma. Se dividen en PR revisables; no se vuelve a fusionar toda la rama de laboratorio. [S2] [S4]

### R1 — Cerrar contratos públicos y cobertura de CI

**Resultado:** un consumidor puede resolver las entradas y tipos de las piezas actuales, y los cambios de sus dependencias activan las verificaciones pertinentes.

**Ámbito:** manifests y pruebas de empaquetado de `addons/*`; workflows LEGO; enlaces y advertencias de documentación/contexto. No cambios funcionales a auth, DB o colas salvo un defecto reproducido que impida el contrato.

- [ ] Reproducir en proyecto limpio la importación por nombre y los tipos de cada add-on, con build/pack e instalación local del artefacto. Inspeccionar contenido publicado, `engines`, peers y ausencia de archivos privados o secretos.
- [ ] Para Better Auth, verificar el desajuste estático entre el ejemplo por nombre y el manifest sin `main`/`types`/`exports`; escribir la prueba que falla antes de corregirlo. No dar por reproducido un error de runtime por inspección del manifest solamente.
- [ ] Incorporar `main` al disparador pertinente de distribución MVP y los cambios del Core a la CI PostgreSQL, que lo utiliza en su composición. Mantener filtros explícitos, ejecución manual y separación de CI heredada. [S7]
- [ ] Registrar un inventario estático de compatibilidad, servicios, dependencias, conflictos, estado y propiedad. No construir un resolver de runtime ni publicar un registry como atajo.
- [ ] Señalar el carácter histórico de `dev-docs/plan.md`, `dev-docs/task.md`, `GEMINI.md` y `.context/` cuando se actualicen sus entradas; conservar los registros previos.

**Gate de salida:** importación pública y tipos probados desde un consumidor externo; artefactos inspeccionados; disparadores verificados contra archivos consumidos; documentación sin afirmar funcionalidades inexistentes. Los waivers de terceros permanecen visibles.

### R2 — Reproducir la receta original Full B

**Resultado:** una aplicación de laboratorio fuera del repositorio combina Core + OpenAPI + PostgreSQL + Better Auth + Jobs Valkey, con API y worker como procesos distintos. [S4]

**Destinos propuestos:** `recipes/full-b/`, sus pruebas y un workflow específico. La receta contiene composición explícita y una guía reproducible; no necesita una CLI propia ni un backend nuevo.

- [ ] Instalar por la vía de consumo acordada en R1, con Node 24, pnpm fijado y lockfile congelado. No depender de imports directos a `../dist` internos del checkout para demostrar distribución.
- [ ] Partir de las plantillas sin alterar su núcleo. Registrar Swagger antes de las rutas; con docs OFF, UI y spec ausentes. Mantener separada la documentación de operaciones Better Auth hasta demostrar una fusión correcta.
- [ ] Migrar aplicación y auth mediante comandos explícitos, cuentas y journals separados. Verificar repetición de migraciones, esquema incompleto, permisos DML y cierre de pools.
- [ ] Ejecutar alta/login/sesión/logout, creación y lectura de un recurso sintético y su trabajo determinista; comprobar el resultado real, no solo el estado `completed`.
- [ ] Probar 401/403, propiedad del recurso y del resultado, incluso con el mismo texto enviado por dos usuarios. El hash/jobId no concede autorización; mantener la asociación de permisos en el consumidor. No colocar cookies, tokens ni datos clínicos en el payload.
- [ ] Probar conexión fallida, timeout, reintentos, parada y recuperación del worker. No equiparar `SIGKILL` del worker con caída/restauración del servidor Valkey.

**Gate de salida:** instalación, build, ejecución HTTP/worker y flujo completo desde una carpeta nueva, sin parches manuales posteriores al procedimiento documentado. Core solo continúa arrancando sin servicios. Informe del SHA, comandos, resultados y fallos. **GO-receta de laboratorio, no GO-producción.**

Una escritura PostgreSQL seguida de enqueue no se presentará como transacción atómica. Si el caso de prueba exige esa garantía, se separa una entrega de outbox/compensación antes de afirmarla. [S4] [S6]

### R3 — Storage S3: siguiente capacidad nueva

**Resultado:** incorporar almacenamiento compatible con S3 sin hacerlo obligatorio ni crear una plataforma de archivos. Recupera `feat/lego-storage-s3` del plan original. [S1]

**Destinos propuestos:** `addons/storage-s3/`, `recipes/storage/`, pruebas y workflow aislados. El SDK, backend de pruebas, versiones y licencias se seleccionan y verifican en el RFC de esta pieza; este roadmap no los declara aprobados.

- [ ] Definir operaciones mínimas de subida, descarga y eliminación; configuración explícita, límites de tamaño, tipo de contenido, manejo de errores y cierre/cancelación.
- [ ] Verificar plugin apagado sin conexión; activado con servicio real efímero, objeto sintético, round-trip y limpieza. El backend local será opcional, nunca dependencia del Core.
- [ ] Rechazar claves/destinos inválidos, controlar prefijos y acceso por recurso; probar accesos cruzados entre usuarios, credenciales insuficientes, timeout y carga interrumpida.
- [ ] Evitar exposición de credenciales, contenido y URLs firmadas en logs. Cualquier endpoint HTTP y su autorización pertenecen al consumidor.

**Gate de salida:** contrato independiente, pruebas negativas y round-trip real desde un consumidor limpio. No exigir auth para importar el cliente; sí exigir autorización para exponer operaciones. No prometer antivirus, versionado, retención normativa o cumplimiento clínico que no se haya implementado y evaluado.

### R4 — OpenTelemetry opt-in

**Resultado:** observar una receta sin cambiar el comportamiento del core ni exigir collector. Recupera `feat/lego-observability` del plan original. [S1]

**Destinos propuestos:** `addons/observability-otel/`, `recipes/observability/`, ejemplos y pruebas aisladas. Elegir la instrumentación mínima con evidencia; no instalar un stack de dashboards completo por defecto.

- [ ] Probar OFF sin exportadores ni conexiones, y ON con collector efímero; identificar petición, consulta y trabajo mediante propagación explícita del contexto.
- [ ] Instrumentar los puntos de inicialización adecuados del JS compilado y evitar hooks/exportadores duplicados. Definir flush, timeout y cierre.
- [ ] Fallo o lentitud del collector no debe bloquear indefinidamente la API o el worker. Medir sobrecarga con y sin instrumentación bajo el mismo escenario.
- [ ] Aplicar allowlist/redacción de atributos: sin cuerpos, contraseñas, cookies, tokens, DSN, URLs firmadas ni texto sensible. Evitar etiquetas de cardinalidad no acotada.

**Gate de salida:** traza correlacionada y métricas mínimas verificables, redacción probada, coste medido y apagado limpio. Debe poder utilizarse con Core, DB o Jobs sin incorporar S3.

### R5 — Distribución, catálogo y mantenimiento consciente

**Resultado:** que una persona o agente pueda descubrir qué pieza necesita, instalar una combinación aprobada y entender cómo mantenerla. No equivale a crear un marketplace. [S2] [S3] [S5]

**Primer tramo, sin registry propio:** conservar giget + SHA para proyectos nuevos; documentar por pieza si se copia código, se instala una biblioteca versionada o se conecta un servicio OCI/URL. Publicar solo comandos realmente ejecutados, matriz de compatibilidad y límites de soporte. El pin actual del MVP no se cambia sin repetir sus gates.

**Segundo tramo, condicionado:** retomar la PoC de Universal Registry de shadcn para archivos propiedad del consumidor, empezando por dos piezas pequeñas. Evaluar instalación en backend sin React/Tailwind, destinos explícitos, dependencias, orden de activación y conflictos. El registry no garantiza por sí solo composición segura.

- [ ] Metadatos estáticos: ID, finalidad, compatibilidad, requisitos, conflicto, configuración, licencia, fuente/SHA, pruebas, mantenimiento y madurez.
- [ ] Verificar red fallida, paquete inválido, ruta ocupada, symlinks, traversal, repetición y orden de instalación. `dry-run` y diff deben demostrar ausencia de escrituras, no solo anunciarla.
- [ ] Distinguir **crear proyecto vacío** de **editar proyecto existente**. El segundo modo permanece fuera del contrato inicial hasta demostrar preservación de cambios, recuperación, rollback y ownership de archivos.
- [ ] Probar actualización entre dos versiones con cambios locales del consumidor: diff revisable, changelog y migraciones explícitas; ninguna sobrescritura silenciosa.
- [ ] Revisar licencias, dependencias, integridad, artefactos y matriz de sistemas operativos. No declarar npm/macOS/Windows u otro runtime soportado sin pruebas.

**Gate de salida:** dos consumidores independientes reproducen las instrucciones y una actualización controlada; cada pieza publicada supera sus propios gates. El instalador Python/Docker/journal del laboratorio no se traslada al producto por defecto. Una web estática puede añadirse cuando el catálogo lo necesite; CLI propia, extensión VS Code y Homebrew requieren demanda demostrada y decisión separada.

### R6 — Piloto y aptitud operativa por escenario

**Resultado:** evaluar una receta y carga concretas antes de permitir su uso real. La integración en GitHub o un benchmark no certifican producción. [S6]

- [ ] Definir el caso consumidor, datos permitidos, amenazas, responsables, presupuesto de conexiones/latencia y criterios de éxito antes del piloto.
- [ ] Resolver o aceptar formalmente riesgos de tipos y dependencias con responsable, alcance, mitigación y revisión. No ocultarlos con un indicador verde global.
- [ ] Validar TLS/CA y proxy real, cookies/CSRF en navegador, límites centralizados cuando haya múltiples instancias, secretos y autorización por recurso/tenant según el caso.
- [ ] Probar backup/restore, reinicio/failover de los servicios utilizados, upgrades/migraciones, pérdida de conexiones, observabilidad y recuperación operativa.
- [ ] Para trabajos con efectos externos, probar idempotencia del efecto, éxito antes del ack, reintentos y outbox/compensación cuando corresponda.

**Gate de salida:** decisión GO/NO-GO **para esa receta, versión y entorno**, con recibos de pruebas y riesgos residuales. Sin datos de pacientes, migraciones sobre bases existentes ni exposición pública como parte de este roadmap.

## 6. Líneas que se conservan sin activarlas automáticamente

**C1 — Transición del backend histórico.** El plan inicial contemplaba convertir Fastify en el inicio predeterminado. Antes de hacerlo: inventariar los consumidores y comandos heredados, separar paridad técnica de adopción, probar health y ausencia de registro/docs por defecto, actualizar instrucciones y preparar rollback. Después se decide una PR de cutover o una deprecación explícita. No borrar Express, `setup.sh`, `web/` ni plantillas históricas en una PR de add-on. [S1] [S5]

**I1 — Jobs PostgreSQL y variante Full A.** Mantener la comparación original como investigación recuperable, no como pieza lista. Solo promoverla si reduce trabajo o infraestructura en un caso real y supera pruebas de permisos/migraciones, recuperación, carga y coste frente a Valkey. Verificar de nuevo las APIs y versiones al retomarla; no copiar las versiones candidatas del RFC como actuales. La receta inicial admite un solo backend de jobs; no hot-switch ni mezcla sin migración diseñada. [S4]

**Descubrimiento ampliado y ayudas de desarrollo.** Una web estática, integración con editor o ayudas para agentes pueden mejorar el uso, pero no preceden a contratos, distribución y mantenimiento. Python/multistack, S3 adicional, MFA, OpenAPI unificado y nuevas recetas se evalúan por necesidad; no se convierten en obligaciones del core ni en un catálogo infinito. [S1] [S3]

## 7. Matriz mínima de aceptación por composición

| Configuración | Prueba diferenciadora |
|---|---|
| Core | Instala, compila y sirve health sin credenciales, Docker ni servicios externos. |
| Core + docs | UI/spec OFF = 404; ON documenta rutas propias con orden correcto. |
| Core + DB | Migración explícita/repetible, DML limitado, fallo seguro y cierre del pool. |
| Core + Auth | PostgreSQL y esquema auth requeridos; sesión real, invalidación y 401/403. No dependencia obligatoria del paquete DB. |
| Core + Jobs Valkey | No requiere PostgreSQL; trabajo real, retry, resultado y worker independiente. |
| Full B | Docs + aplicación DB + auth + jobs; ownership y arranque/cierre conjunto desde consumidor externo. |
| Core + Storage | Round-trip, límites, fallos y cleanup; sin auth o rutas globales por importación. |
| Cualquiera + OTel | ON/OFF, propagación, redacción, fallo del collector y sobrecarga medida. |
| Selección inválida | Backend doble, pieza desconocida/no disponible, versión incompatible o servicio faltante: rechazo explícito y sin corrupción. |

Full A no se añade a la matriz de compatibilidad aprobada hasta completar I1. Las combinaciones no ejecutadas se registran como **no verificadas**, no como PASS por transitividad.

## 8. Riesgos y puertas de decisión

| Riesgo o brecha | Acción / propietario funcional | Puerta que afecta |
|---|---|---|
| Declaraciones upstream Drizzle y referencia `bun:sqlite` documentadas | Reproducir sobre versiones fijadas; clasificar cada waiver y evaluar solución en R1/R6. Mantener `strict` propio separado de validación de terceros. | No afirmar typecheck completo. |
| Advisory moderado de toolchain registrado en el reporte PostgreSQL | Reauditar el árbol completo antes de distribuir; corregir o aceptar explícitamente con alcance y mitigación. No afirmar que el reporte de 2026-10-16 es el estado actual del ecosistema. | R5/R6 según riesgo. |
| Importaciones privadas que maquillan el consumo real | Artefacto instalado e importado por su contrato público. | R1/R2. |
| Scopes de Fastify que no comparten capacidades entre hermanos | Composición explícita y prueba de permisos en rutas reales; no romper encapsulación como solución genérica. | R2. |
| Fallo entre transacción DB y enqueue / duplicación de efectos | No prometer atomicidad ni exactly-once; separar outbox o compensación si el caso lo exige. | R2/R6. |
| Confundir laboratorio con producto | Estado por pieza y por receta; links al SHA y a resultados específicos. | Todos. |
| Copiar código existente y perder personalizaciones | Separar bootstrap de actualizaciones; diff, propiedad y recuperación. | R5. |
| Ampliación de catálogo sin necesidad | RFC breve con caso de uso, límites y coste; rechazar abstracciones especulativas. | R3/R4 y líneas condicionadas. |

Los riesgos de dependencias proceden de los reportes del baseline, no de una nueva auditoría de registros públicos realizada al redactar este archivo. [S6]

## 9. Protocolo de avance y criterio de término

Para cada hito: definir caso y límites; escribir o actualizar su RFC focal; implementar con pruebas que reproduzcan el comportamiento; registrar comandos, SHA, versiones y resultados; revisar el diff y CodeRabbit; resolver hallazgos; solicitar decisión de merge y verificar la CI posterior. Si cambia el HEAD, revisar la evidencia afectada. No fusionar automáticamente por estar descrito en este documento.

**Responsabilidades:** Felipe decide alcance, aceptación de riesgos y merge. El implementador entrega código y recibos. La revisión distingue evidencia ejecutada, inspección estática e hipótesis. No se asignan personas ni fechas ficticias.

**Criterio de madurez del producto:** crear una aplicación independiente, elegir solo piezas necesarias, completar un flujo real con permisos y fallos controlados, y aplicar una actualización revisable sin perder cambios locales. La meta no es el número de módulos, sino la capacidad de consumirlos y mantenerlos con confianza.

La preparación de R0 no constituye ejecución de R1–R6, cutover, publicación npm/shadcn, provisión de servicios o despliegue.

## 10. Fuentes y precedencia

Cuando difieren los documentos, distinguir **intención**, **decisión de alcance**, **implementación** y **evidencia**. El borrador inicial no anula la reducción posterior del MVP; una CI verde no borra sus límites. Las APIs/versiones propuestas en documentos históricos deben verificarse nuevamente al ejecutar cada hito.

- **S1 — Fundación original (13-10-2026):** objetivo, tres niveles, contratos, checkpoints y secuencia PostgreSQL → Auth → Valkey → S3 → OTel.
- **S2 — Auditoría de la fundación:** composición, actualización del código copiado, reducción de mega-PR, servicios, compatibilidad y gates.
- **S3 — ADR de distribución:** modos de código/copias, paquetes y servicios; registry candidato; descubrimiento, CLI y Homebrew condicionados.
- **S4 — Receta OpenAPI/PostgreSQL/Auth/Jobs:** Full A/B, contratos, exclusividad, ownership, límites de OpenAPI y matriz de pruebas.
- **S5 — Decisión MVP (15-10-2026):** giget + SHA, dos plantillas, proyectos vacíos, sin instalación in-place ni CLI propia.
- **S6 — Reportes del baseline:** [PostgreSQL/Drizzle][S6-PG], [Better Auth][S6-AUTH] y [BullMQ/Valkey][S6-JOBS]; alcances y riesgos, no certificación de producción.
- **S7 — Workflows del baseline:** verificaciones aisladas, filtros de archivos y separación de la CI histórica.

[S1]: https://github.com/fegome90-cmd/kit_fundador/blob/0085a8558ff73a0d9b2e424d338df4bea85eaeb3/dev-docs/plans/fastify-lego-foundation.md
[S2]: https://github.com/fegome90-cmd/kit_fundador/blob/0085a8558ff73a0d9b2e424d338df4bea85eaeb3/dev-docs/plans/fastify-lego-foundation-audit-2026-10-13.md
[S3]: https://github.com/fegome90-cmd/kit_fundador/blob/0085a8558ff73a0d9b2e424d338df4bea85eaeb3/dev-docs/plans/adr-distribution-pnpm-shadcn-marketplace.md
[S4]: https://github.com/fegome90-cmd/kit_fundador/blob/0085a8558ff73a0d9b2e424d338df4bea85eaeb3/dev-docs/plans/lego-recipe-openapi-postgres-auth-jobs.md
[S5]: https://github.com/fegome90-cmd/kit_fundador/blob/fa8839e3f17fb34d812290fd8c8163fc00df583a/dev-docs/plans/lego-mvp-distribution-2026-10-15.md
[S6]: https://github.com/fegome90-cmd/kit_fundador/tree/fa8839e3f17fb34d812290fd8c8163fc00df583a/dev-docs/validation
[S7]: https://github.com/fegome90-cmd/kit_fundador/tree/fa8839e3f17fb34d812290fd8c8163fc00df583a/.github/workflows
[S6-PG]: https://github.com/fegome90-cmd/kit_fundador/blob/fa8839e3f17fb34d812290fd8c8163fc00df583a/dev-docs/validation/2026-10-16-lego-postgres/report.md
[S6-AUTH]: https://github.com/fegome90-cmd/kit_fundador/blob/fa8839e3f17fb34d812290fd8c8163fc00df583a/dev-docs/validation/2026-10-16-lego-auth/report.md
[S6-JOBS]: https://github.com/fegome90-cmd/kit_fundador/blob/fa8839e3f17fb34d812290fd8c8163fc00df583a/dev-docs/validation/2026-10-17-lego-jobs-valkey/report.md
