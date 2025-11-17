# Blueprint de casos de uso y handlers

Este documento convierte **TASK-004 (primer use case end-to-end)** en un plan accionable que respeta la naturaleza de
starkit: no se agrega infraestructura real ni dependencias nuevas, solo se deja trazado el camino para que cada
consumidor implemente su capa de aplicación cuando decida materializar el proyecto.

## Principios

1. **Separación estricta**. Los casos de uso orquestan value objects/aggregates y dependen solo de interfaces (repos,
   buses de eventos, servicios externos). Las implementaciones concretas viven en la capa de infraestructura del
   consumidor.
2. **DTOs mínimos**. Define contratos explícitos (command/query DTOs) sin filtrar detalles HTTP o de base de datos.
3. **Testing primero**. Cada minitarea propone pruebas unitarias/integración que el equipo debe ejecutar en su fork para
   demostrar el comportamiento.
4. **Documentación viva**. Todo nuevo use case debe registrarse en `dev-docs/plan.md`, `dev-docs/task.md` y
   `.context/decision-log.json` para que otros agentes conozcan el estado real.

## Artefactos esperados

| Artefacto | Ubicación sugerida | Propósito |
|-----------|--------------------|-----------|
| `src/application/use-cases/<UseCaseName>/` | Carpeta dedicada por use case | Encapsular comando, handler y tests |
| `CreateUserCommand.ts` (o equivalente) | Define DTOs de entrada | Evitar que el handler dependa de detalles de transporte |
| `CreateUserHandler.ts` | Contiene `execute(command)` y orquesta dominio/repos | Punto único para validaciones cruzadas |
| `UserRepository` (interface) | `src/application/ports` | Abstraer persistencia para pruebas |
| `InMemoryUserRepository` (stub opcional) | `tests/mocks/` o dentro de los tests | Permitir unit tests sin DB |
| Tests unitarios | `tests/unit/application/<use-case>.test.ts` | Validar lógica sin infraestructura |
| Tests de integración | `tests/integration/application/<use-case>.test.ts` | Garantizar wiring con adapters reales |

## Fases y minitareas

### Fase 0 – Preparación

1. **Seleccionar el primer escenario**
   - Revisa `dev-docs/domain/ubiquitous-language.md` y el backlog para elegir el flujo con mayor valor (ej. `RegisterUser`).
   - Documenta la elección en `dev-docs/task.md` (TASK-004) y agrega una nota en `.context/project-state.json`.
   - *Code review*: confirmar que el escenario pertenece al bounded context activo y no mezcla responsabilidades.

2. **Definir contratos**
   - Especifica los campos requeridos por el command/query en `src/application/dto` o dentro del folder del use case.
   - Usa tipos explícitos (`type`, `interface`) y documenta invariantes compartidos con el dominio.
   - *Tests sugeridos*: unitarios que prueben validaciones básicas del DTO.

### Fase 1 – Implementación del handler

1. **Crear interfaz de repositorio/servicios**
   - Añade `UserRepository` (o equivalente) con métodos `save`, `findByEmail`, etc.
   - Define errores checked/typed para escenarios como duplicados.
   - *Code review*: la interface debe vivir en `application` y no importar nada de infraestructura.

2. **Escribir el handler**
   - Implementa `execute(command)` siguiendo estos pasos:
     1. Normalizar/validar input.
     2. Consultar repositorios/servicios mediante interfaces.
     3. Invocar al aggregate (`User.create`) y recopilar eventos.
     4. Persistir a través del repositorio (interface).
     5. Devolver DTO de salida o `Result`/`Either` según el estilo elegido.
   - Evita efectos secundarios directos (logs, métricas); expón hooks para que infraestructura los conecte.

3. **Tests unitarios del handler**
   - Usa un `InMemoryUserRepository` o mocks para simular persistencia.
   - Casos mínimos:
     - ✅ Creación exitosa.
     - ❌ Email duplicado (repositorio lanza error esperado).
     - ❌ Validación de password/email delegada correctamente al dominio.
   - Comando sugerido: `npm run test -- --testPathPattern=tests/unit/application` (o el equivalente que defina el consumidor).

### Fase 2 – Integración ligera

1. **Adapter temporal para repositorio**
   - Documenta un stub `FileUserRepository` o `MemoryUserRepository` en `src/infrastructure/_stubs` para demos.
   - Marca en README que es un placeholder.
   - *Tests*: smoke test en `tests/integration/application/<use-case>.test.ts` usando el stub.

2. **Publicación de eventos**
   - Si el use case produce eventos, añade un puerto `DomainEventPublisher` en `application/ports`.
   - Inyecta un stub que acumule eventos para aserciones.
   - *Code review*: verificar que los eventos se limpian después de publicarse y que no hay dependencia directa de buses reales.

3. **Checklist de documentación**
   - Actualiza `README.md` (nueva sección “Blueprint de casos de uso”).
   - Marca la mini-ejecución en `dev-docs/post-adaptation-validation.md` (ejecutar tests unitarios/integración del use case).
   - Registra la decisión en `.context/decision-log.json` y el estado en `.context/project-state.json`.

## Revisiones de código

- Verificar que ninguna importación del handler provenga de `infrastructure/`.
- Confirmar que los DTOs no exponen tipos propios de HTTP (Request, Response) u ORM.
- Validar que los tests cubren errores esperados y que los stubs no terminan en producción.
- Asegurar que los archivos nuevos incluyen comentarios que recuerden al consumidor reemplazarlos en su implementación real.

## Testing sugerido

| Tipo | Comando sugerido | Objetivo |
|------|------------------|----------|
| Unit | `npm run test -- --testPathPattern=tests/unit/application` | Validar reglas del handler con stubs |
| Integration | `npm run test -- --testPathPattern=tests/integration/application` | Probar wiring mínimo contra adaptadores mock |
| Smoke | `node scripts/seed.ts --dry-run` o equivalente | Confirmar que los nuevos puertos no rompen el seed/stubs |
| Lint | `npm run lint src/application/**/*.ts` | Asegurar consistencia de estilo |

## Checklist para consumidores

- [ ] Elegí y documenté el primer use case en `dev-docs/task.md`.
- [ ] Creé DTOs y puertos en la carpeta `application` sin dependencias de infraestructura.
- [ ] Implementé el handler y pruebas unitarias.
- [ ] Añadí stubs temporales o mocks para los tests de integración.
- [ ] Actualicé README/plan/task/context para reflejar el avance.
- [ ] Registré la decisión en `.context/decision-log.json` y marqué la deuda correspondiente como atendida.

## Enlaces útiles

- `dev-docs/domain/ubiquitous-language.md`
- `dev-docs/domain/invariants.md`
- `dev-docs/task.md#task-004-implementar-primer-use-case`
- `dev-docs/plan.md#fase-2-application-layer`
- `dev-docs/post-adaptation-validation.md`
