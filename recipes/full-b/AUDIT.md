# PR #87 — Auditoría pre-merge de LEGO R2 Full B

**Corte de evidencia:** 23-10-2026, commit `bf6e03138c2d6f54120bee0d1477a341bd5e72ee`.  
**Base:** `main@90acfff15c5b042e6835eee301b914a5a4cc0594` (R0+R1 integrados).  
**Alcance:** `.github/workflows/lego-full-b.yml` y `recipes/full-b/**`.  
**Dictamen:** **GO para revisión y potencial merge del laboratorio R2** únicamente con aprobación explícita y CI verde sobre el HEAD final. **NO-GO** para publicación npm/shadcn, exposición pública, datos clínicos o despliegue productivo.

## 1. Lo que se comprobó

La receta usa los tres add-ons privados por sus exports públicos, con un consumidor copiado fuera del checkout, tres tarballs locales y una segunda instalación `pnpm install --frozen-lockfile`. Las versiones de runtime son Node 24, PostgreSQL 16.15 y Valkey 8.1.4 efímeros. Los migradores Drizzle se ejecutan explícitamente y cada journal conserva una migración aplicada.

Los tests ejercitan HTTP real, sesión, login/logout, 401/403, dos usuarios con texto idéntico y mismo `jobId`, autorización persistida por nota, digest SHA-256/bytes, worker en proceso separado, pausa/reinicio, Core sin servicios, OpenAPI ON/OFF y desconexión de Valkey. Los roles app/auth usan pools diferentes; una conexión de aplicación no puede ver el esquema auth, y viceversa.

La auditabilidad se basa en la ejecución de comandos **reales** y sus logs; la inspección del código, por sí sola, no certifica el funcionamiento.

## 2. Hallazgos reproducidos, reparación y recibo

| ID | Severidad para R2 | Hallazgo / efecto | RED observado | GREEN observado |
|---|---|---|---|---|
| R2-A01 | P1 — funcional | `FULLB_BASE_URL` podía discordar en host o puerto con el listener; Better Auth podía rechazar después una petición legítima | [39948278241](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39948278241): 5 PASS, 2 FAIL por mismatch | [39948680656](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39948680656): 7/7 PASS |
| R2-A02 | P1 — menor privilegio | El usuario SQL `lego_fullb_app` podía leer la tabla original `lego_app.notes` por un `GRANT ... ON ALL TABLES` | [39949040376](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39949040376): 6 PASS, 1 FAIL, `Missing expected rejection` | [39949293995](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39949293995): 7/7 PASS, rol limitado a `fullb_notes` y `fullb_jobs` |
| R2-A03 | P1 — aislamiento del arnés | Los ejecutables de migración del laboratorio no restringían URLs a servicios sintéticos y podían apuntar por error a otros entornos | [39949829862](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39949829862): guard ausente, CI RED | [39950051182](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39950051182): 5/5 pruebas de guard y 7/7 E2E PASS |
| R2-A04 | P2 — observabilidad de test | El test de ausencia de `FULLB_BASE_URL` revisaba solo `exitCode=1`, sin comprobar la causa | Inspección estática y comentario de CodeRabbit | El test exige ahora `stderr` que mencione `FULLB_BASE_URL`; incluido en 7/7 |

La solución R2-A01 exige host/puerto de origen exactos, normaliza IPv6, prohíbe credenciales, rutas y parámetros, y no admite `PORT=0` en el entrypoint independiente porque el puerto dinámico no puede validarse previamente. No se alteró el backend Fastify Core.

La solución R2-A03 es un **guard de uso accidental**, no una barrera de seguridad frente a un adversario que controle el runner: exige `GITHUB_ACTIONS=true`, hosts `127.0.0.1`, base `lego_fullb_ci`, roles de prueba y puertos 5432/6379. Los guardias corren antes de conectar/migrar tanto en `ci/run.mjs` como en `ci/init-db.mjs`; este último conserva su copia en el consumidor independiente. Ningún secreto ni DSN se imprime en mensajes de error.

## 3. Gate del HEAD auditado

- [x] [R2 E2E 39950051182](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39950051182): **SUCCESS**, 5/5 pruebas de aislamiento y 7/7 pruebas Full B, `LEGO_R2_FULL_B_E2E_PASS`.
- [x] [CI raíz 39950051183](https://github.com/fegome90-cmd/kit_fundador/actions/runs/39950051183): **SUCCESS**.
- [x] Dos ejecuciones de `pnpm audit` en consumidor conjunto: `No known vulnerabilities found` en esta fecha. No equivale a garantía futura.
- [x] CodeRabbit status `success` en el HEAD de este corte; el hallazgo de origen y su hilo de review están resueltos.
- [x] `main` intacto, PR abierta, no draft y sin conflictos en la verificación del corte.
- [ ] Repetir checks y mergeability si el HEAD cambia tras este informe. Una revisión y decisión de merge son independientes del resultado técnico.

## 4. Riesgos residuales / exclusiones explícitas

| ID | Riesgo no cubierto por R2 | Tratamiento |
|---|---|---|
| L1 | Escritura PostgreSQL y `queue.add` no forman una transacción atómica; la ejecución BullMQ puede ser al menos una vez, no exactamente una | Requerir outbox o compensación por caso de uso antes de efectos externos críticos |
| L2 | Se prueba caída/reinicio del **worker**, no failover, pérdida o restore de **Valkey** | Pruebas de resiliencia y persistencia como gate de piloto R6 |
| L3 | Auth en loopback, rate limiting local, sin proxy/TLS real ni pruebas integrales de navegador | Protección en infraestructura y tests de seguridad reales antes de exponer |
| L4 | `skipLibCheck: true` del consumidor permite waivers de declaraciones upstream Drizzle/Better Auth | No declarar conformidad completa de tipos externos; revaluar versiones fijadas |
| L5 | El lockfile combinado se genera y prueba en CI, retenido como artefacto; no hay receta pública versionada ni contrato de actualización in-place | Continuar en R5, sin prometer distribución ni upgrades automáticos |
| L6 | No hay carga/latencia reales ni backup/restore PG ni revisión de compliance, licencias o tenants múltiples | Evaluación individual de piloto R6; sin datos de pacientes |

## 5. Límite de cambios y salida

El PR introduce **una receta consumidora** y su workflow, no un cuarto framework ni un nuevo runtime obligatorio. No modifica `templates/**`, `addons/**` ni el backend heredado. La prueba del Core solo sigue siendo requisito.

**Decisión propuesta:** mantener la PR #87 lista para revisión; fusionar solo si el usuario autoriza y la CI del commit final permanece verde. Registrar el SHA exacto del merge y volver a correr pruebas sobre `main`. No publicar ni desplegar como consecuencia del merge.
