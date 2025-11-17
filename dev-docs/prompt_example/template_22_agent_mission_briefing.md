# 📡 BRIEFING DE MISIÓN PARA AGENTE - [Nombre de la Misión]

**ID de Misión:** AGENT-MISSION-[YYYYMMDD]-[MISSION_NAME]
**Fecha de Emisión:** [YYYY-MM-DD]
**Agente Designado:** [ID del Agente, ej: `MemTech-001`, `Developer-JohnDoe`]
**Supervisor:** [Nombre del Supervisor/Líder de Equipo]
**Prioridad:** [CRÍTICA / ALTA / MEDIA / BAJA]

---

## 1. Directiva Primaria (Prime Directive)

[Describe la misión en una sola frase imperativa. Debe ser el objetivo final e inmutable.]

**Ejemplo:** "Refactorizar el módulo `LegacyUserService` para desacoplar la lógica de autenticación en un nuevo `AuthenticationService`, sin alterar el contrato de la API pública existente."

---

## 2. Parámetros de la Misión (Mission Parameters)

- **Duración Estimada:** [X horas/días]
- **Recursos Asignados:** [Presupuesto, recursos de cómputo, etc.]
- **Documentos de Referencia:**
  - **Guardrails Anti-Drift:** [Enlace al `template_20_anti_drift_guardrails.md` correspondiente]
  - **Matriz de Criterios de Éxito:** [Enlace al `template_21_success_criteria_matrix.md` correspondiente]
  - **Requisitos Técnicos:** [Enlace al ADR o ticket relevante]

---

## 3. Capacidades Requeridas (Required Capabilities)

*Lista de herramientas, permisos y conocimientos que el agente debe poseer o tener acceso para completar la misión.*

- **[Acceso a Sistemas]:**
  - [✅] Acceso de lectura/escritura al repositorio `X`.
  - [✅] Acceso al entorno de `staging` de AWS.
  - [❌] Acceso a la base de datos de `producción`.

- **[Herramientas (Tooling)]:**
  - [✅] Capacidad para ejecutar tests unitarios y de integración.
  - [✅] Capacidad para ejecutar análisis de cobertura de código.
  - [✅] Capacidad para interactuar con la API de Jira para actualizar tickets.

- **[Conocimiento Específico]:**
  - [✅] Comprensión del patrón de diseño `Strategy`.
  - [✅] Conocimiento del protocolo OAuth 2.0.

---

## 4. Protocolos Operativos (Operational Protocols)

### Protocolo de Comunicación:
- **Reportes de Progreso:** [El agente debe enviar un reporte de progreso cada `X` horas al canal de Slack `#mision-xyz`.]
- **Escalada de Problemas:** [Si se encuentra un bloqueador que impide cumplir la Directiva Primaria sin violar los Guardrails, el agente debe detenerse inmediatamente y notificar al Supervisor.]
- **Formato de Handoff:** [Al completar la misión, el agente debe generar un documento de Handoff (usando `template_7_general_handoff.md`) y un Registro de Conocimiento (usando `template_23_knowledge_index_record.md`).]

### Reglas de Enfrentamiento (Rules of Engagement - ROE):
- **Autonomía:** [El agente tiene autonomía para tomar decisiones de implementación *dentro* de los límites definidos por los Guardrails.]
- **Colaboración:** [El agente NO debe interactuar directamente con otros agentes o sistemas a menos que esté explícitamente definido en esta misión. La coordinación se maneja a través del Supervisor.]
- **Modo Sigiloso (Stealth Mode):** [El agente debe operar en una rama de `feature` separada y no debe mergear a `main` sin un proceso de revisión de código explícito.]

---

## 5. Criterios de Éxito de la Misión (Mission Success Criteria)

*Define las condiciones específicas que deben cumplirse para que la misión sea considerada un éxito.*

- **Criterio 1: [Funcionalidad]**
  - **Descripción:** [La lógica de autenticación está completamente contenida en el nuevo `AuthenticationService`.]
  - **Verificación:** Revisión de código y estructura de archivos.

- **Criterio 2: [No Regresión]**
  - **Descripción:** [La suite completa de tests de regresión para `LegacyUserService` (ahora usando el nuevo servicio) pasa al 100%.]
  - **Verificación:** Resultado del pipeline de CI.

- **Criterio 3: [Calidad]**
  - **Descripción:** [El nuevo `AuthenticationService` tiene una cobertura de tests unitarios ≥ 95%.]
  - **Verificación:** Reporte de cobertura de código.

- **Criterio 4: [Documentación]**
  - **Descripción:** [Se ha generado y completado el Handoff y el Registro de Conocimiento.]
  - **Verificación:** Existencia y revisión de los documentos finales.

---
**[SUPERVISOR_SIGNATURE]**
**MISIÓN AUTORIZADA**
