# Guía de Validación Post-Adaptación

> Utiliza esta checklist cuando hayas personalizado el starkit. El objetivo es confirmar que todos los huecos intencionales del template fueron cubiertos por tu implementación antes de abrir el primer PR del proyecto real.

## 1. Automatizaciones básicas

- [ ] `npm run lint` / `make lint` / comando equivalente se ejecuta sin errores.
- [ ] `npm run test` (u otro runner) cubre los módulos recién creados y falla cuando se rompe una invariante.
- [ ] Los comandos específicos del blueprint de casos de uso (`npm run test -- --testPathPattern=tests/unit/application`,
      `tests/integration/application`) pasan con los adapters/stubs reales del proyecto.
- [ ] `npm run type-check` o verificación equivalente (mypy, go vet, etc.) completó con éxito.
- [ ] `npm run test:setup` o `make test:setup` validó que `scripts/setup.sh` siga produciendo artefactos consistentes tras tus personalizaciones (usa `SETUP_SH_SKIP_INSTALLS=true` en CI si no hay acceso a npm/PyPI).
- [ ] Hooks de `lint-staged`/pre-commit actualizados para todos los lenguajes presentes en el repo.

## 2. Servicios e integraciones reemplazados

- [ ] Password hasher reemplazado por implementación real (bcrypt, argon2, KMS, etc.).
- [ ] `DomainEventDispatcher` conectado a la cola/bus elegido o al menos a un stub de aplicación.
- [ ] Entry point definitivo documentado (reemplazando el stub `src/index.ts`) y scripts (`dev`, `start`, `seed`) apuntan al archivo correcto.
- [ ] Se documentó en `dev-docs/context.md` qué servicios externos se consumen y cómo se configuran.

## 3. Configuración y seguridad

- [ ] Variables sensibles viven en `.env`/vault; no hay secretos hardcodeados.
- [ ] Los pipelines de CI ejecutan lint + test + type-check de punta a punta.
- [ ] `README` y `dev-docs/plan.md` reflejan el estado actual del stack y de los milestones.
- [ ] El script `scripts/validate-architecture.sh` (o equivalente) pasa en el entorno local.
- [ ] Se ejecutó el plan de Dependabot (`PLAN_EJECUCION_DEPENDABOT.md`) o se documentó explícitamente la estrategia alternativa en `dev-docs/context.md`.

## 4. Preguntas guía para el equipo

1. ¿Se importaron explícitamente todas las dependencias que antes asumía el template (por ejemplo, `crypto`)?
2. ¿Los comandos documentados en el README son los mismos que se usan realmente en CI/CD?
3. ¿Existe un plan para propagar eventos de dominio si falla la persistencia (reintentos, outbox, etc.)?
4. ¿El checklist de consumidor (`dev-docs/consumer-checklist.md`) fue actualizado con notas propias del proyecto?
5. ¿Quién es responsable de mantener actualizados `dev-docs/task.md` y `dev-docs/plan.md` tras cada iteración?

## 5. Cómo reportar el resultado

- Actualiza `dev-docs/task.md` (TASK-010) indicando la fecha en la que se completó la validación inicial.
- Añade un breve resumen en `dev-docs/plan.md` dentro de "Fase 5" con los hallazgos o pendientes.
- Si encontraste huecos adicionales en el starkit, regístralos en la sección "Backlog" o abre una nueva Task.
