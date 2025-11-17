# Plan de Ejecución para Alertas de Dependabot

> **Objetivo**: mantener el starkit libre de vulnerabilidades conocidas sin sacrificar su naturaleza agnóstica. Este plan prioriza qué alertas provenientes de Dependabot (o `npm audit`/`pip audit`) deben resolverse dentro del template y cuáles pueden delegarse a los consumidores.

## 1. Resumen ejecutivo

| ID | Componente | Evidencia | Severidad | Decisión | Justificación |
|----|------------|-----------|-----------|----------|---------------|
| D-CORE-001 | `package.json` raíz | `npm ci` en GitHub Actions reporta 19 vulnerabilidades moderadas (glob@7, rimraf@3, eslint@8.x, etc.). | 🟠 Alta | **Corregir dentro del starkit** | El repositorio es la fuente de verdad para nuevos proyectos; entregar dependencias vulnerables contradice el propósito del kit. Se abordará en TASK-017. |
| D-TPL-001 | Plantillas `templates/typescript/*` | Auditoría confirmó que estas plantillas ya usan ESLint 9 / `@typescript-eslint` 8 / `redis` 5. | 🟢 N/A | **Sin acción inmediata** | Las plantillas ya incorporan las versiones recomendadas en AUDITORIA_SETUP_SH.md y sirven como referencia. |
| D-AUT-001 | Configuración de Dependabot inexistente | No existe `.github/dependabot.yml`. | 🟠 Alta | **Crear configuración mínima** | Necesitamos recibir PRs automáticos para npm y GitHub Actions, incluso si el consumidor decide ignorarlos. Se aborda en TASK-016. |
| D-TPL-002 | Falta de guía para manejar alertas en forks | No se documenta cómo evaluar las alertas ni qué partes son opt-in. | 🟡 Media | **Documentar** | La guía actual (README/dev-docs) no explica qué alertas debe atender el starkit vs. el consumidor. Se cubre en esta misma guía y en TASK-016/017. |
| D-OPT-001 | Auto-merge/observabilidad avanzada | Se propuso agregar flags y logging detallado para dependabot y pipelines. | 🔵 Baja | **No implementar ahora** | Añadir auto-merge o logging estructurado introduce sobre-ingeniería y depende de cada organización. Documentado como mejora opcional. |

## 2. Principios de priorización

1. **El starkit no entrega código vulnerable por defecto** → los paquetes definidos en la raíz deben mantenerse saludables.
2. **Los consumidores son dueños de su infraestructura** → no forzamos auto-merge, alertas por chatops ni herramientas adicionales.
3. **Documentación antes que automatización** → cada ajuste va acompañado de notas en README/dev-docs para que terceros puedan optar por salirse del plan.

## 3. Plan por fases

### Fase A – Configuración de Dependabot (TASK-016)

- **Objetivo**: recibir PRs automáticos para npm (raíz y plantillas) y GitHub Actions.
- **Minitareas**:
  1. Crear `.github/dependabot.yml` con tres paquetes supervisados: `npm` (raíz), `npm` (plantilla TypeScript) y `github-actions`.
  2. Añadir `labels`, `reviewers` opcionales y `open-pull-requests-limit=5` para evitar spam.
  3. Documentar en README + tooling guide cómo pausar/ajustar los intervalos.
- **Testing / Revisión**:
  - `yamllint` opcional o `npx @dependabot/check` (si el consumidor lo tiene instalado).
  - Revisar en la UI de GitHub que aparezca la configuración.

### Fase B – Baseline de dependencias (TASK-017)

- **Objetivo**: alinear `package.json` raíz con las versiones que ya viven en la plantilla TS y eliminar las 19 vulnerabilidades.
- **Minitareas**:
  1. Ejecutar `npm outdated` y `npm audit` para capturar evidencia inicial.
  2. Actualizar `@typescript-eslint/*`, `eslint`, `husky`, `redis`, `glob`, `rimraf` y cualquier paquete reportado con CVEs abiertos.
  3. Regenerar `package-lock.json` y documentar la fecha de actualización en este plan.
  4. Ejecutar `npm run lint`, `npm test`, `npm run test:setup` para confirmar que los stubs siguen funcionando.
- **Resultado**: Dependabot deberá quedar silente hasta que aparezca una nueva alerta real.

### Fase C – Documentación viva

- **Objetivo**: dar a los consumidores lineamientos claros.
- **Acciones**:
  1. Actualizar README (`🤖 Plan de Dependabot`) y `dev-docs/tooling-guide.md` con instrucciones de triage.
  2. Añadir pasos en `dev-docs/post-adaptation-validation.md` y `dev-docs/consumer-checklist.md` para que cada fork registre cómo manejará Dependabot.
  3. Registrar el estado en `.context/project-state.json` como deuda técnica `TD-DEP-001`.

## 4. Ítems no priorizados (y su justificación)

| Sugerencia | Motivo de descarte | Qué documentamos |
|------------|--------------------|------------------|
| Auto-merge de PRs de Dependabot | Requiere confianza en cada rama y políticas corporativas → no es rol del starkit definirlo. | Se explica que los consumidores pueden habilitarlo en su fork si quieren. |
| Añadir dependabot a cada subdirectorio opcional (templates Python, scripts) | Mantendría múltiples PRs semanales sin una rama real consumiéndolos. | Recomendamos copiar `dependabot.yml` al fork y ampliar los ecosistemas según necesidad. |
| Instalar nuevas herramientas (Snyk, Renovate) | Añadiría dependencias y costos operativos que el starkit no puede asumir. | Se menciona en la guía que son alternativas si la organización ya las usa. |

## 5. Validación posterior

Al finalizar TASK-016 y TASK-017:

1. Ejecuta `npm ci && npm audit` para confirmar 0 vulnerabilidades en la raíz.
2. Comprueba que Dependabot pueda abrir PRs en un fork de prueba (simulando cambios en `package.json`).
3. Documenta el resultado en `dev-docs/task.md` y actualiza `.context/project-state.json`.
4. Informa en `dev-docs/post-adaptation-validation.md` si el consumidor adoptará o no la configuración sugerida.

## 6. Referencias cruzadas

- `document/informes_CC/AUDITORIA_SETUP_SH.md` – evidencia inicial (19 vulnerabilidades moderadas).
- `dev-docs/tooling-guide.md` – sección "Dependabot" (triage y comandos).
- `dev-docs/task.md` – TASK-016/TASK-017.
- `.context/decision-log.json` – DEC-2025-01-16-DEPENDABOT-PLAN.

---

_Última revisión: 2025-01-16._
