# 📡 BRIEFING DE MISIÓN PARA AGENTE - TASK-005 Phase 3

**ID de Misión**: AGENT-MISSION-20251120-TASK-005-PHASE-3
**Fecha de Emisión**: 2025-11-20
**Agente Designado**: EJECUTOR
**Supervisor**: VALIDADOR
**Prioridad**: ALTA

---

## 1. Directiva Primaria (Prime Directive)

**Implementar la Fase 3 de TASK-005: Pruebas Avanzadas (Performance, Security, Integration) para el endpoint de Registro de Usuarios, asegurando "Production Readiness" sin regresiones.**

---

## 2. Parámetros de la Misión (Mission Parameters)

- **Duración Estimada**: 2 horas
- **Estado Inicial**: Phase 2 completada, Phase 2.5 (E2E) completada.
- **Documentos de Referencia OBLIGATORIOS (Leer antes de actuar)**:
  1. `dev-docs/agent-profiles/EJECUTOR.md` (Tu rol y responsabilidades)
  2. `dev-docs/task.md` (Detalle de TASK-005 Phase 3)
  3. `.context/active-context.md` (Estado actual del proyecto)
  4. `dev-docs/rules/` (Reglas del proyecto)

---

## 3. Capacidades Requeridas (Required Capabilities)

- **[Herramientas]**:
  - [✅] Jest / Supertest para pruebas de integración.
  - [✅] k6 o scripts personalizados para pruebas de carga/performance.
  - [✅] Conocimiento de OWASP para validación de seguridad.

- **[Conocimiento Específico]**:
  - [✅] Clean Architecture (para no violar capas en los tests).
  - [✅] Test Isolation (respetar ADR-003).

---

## 4. Protocolos Operativos (Operational Protocols)

### Protocolo de Inicio:
- **LECTURA CRÍTICA**: Antes de escribir una sola línea de código, debes leer y confirmar entendimiento de `dev-docs/agent-profiles/EJECUTOR.md`.
- **Contexto**: Verifica `dev-docs/task.md` para ver exactamente qué criterios de aceptación faltan.

### Reglas de Enfrentamiento (ROE):
- **No Regresiones**: El performance actual es ~6ms. Cualquier cambio que lo suba a >50ms es un fallo.
- **Seguridad**: Debes intentar "romper" el endpoint con inyecciones, payloads malformados y tipos de datos incorrectos.
- **Integración**: Verifica que el flujo API -> Controller -> Handler -> Repository funcione correctamente en conjunto (ya cubierto parcialmente por E2E, reforzar casos borde).

---

## 5. Criterios de Éxito de la Misión (Mission Success Criteria)

- **Criterio 1: [Performance]**
  - **Descripción**: Tests de carga demuestran que el endpoint soporta concurrencia sin degradación significativa.
  - **Verificación**: Script de performance ejecutado y reporte generado. Latencia p95 < 100ms.

- **Criterio 2: [Seguridad]**
  - **Descripción**: Tests de seguridad cubren XSS, Injection (básico), y validación de input estricta.
  - **Verificación**: Suite de tests de seguridad pasando.

- **Criterio 3: [Integración]**
  - **Descripción**: Tests de integración cubren escenarios de error de base de datos y fallos de red simulados.
  - **Verificación**: `npm test` pasa con 100% de éxito.

- **Criterio 4: [Documentación]**
  - **Descripción**: Actualizar `TASK-005-PROGRESS.md` con los resultados de la Fase 3.
  - **Verificación**: Archivo actualizado y commit realizado.

---
**VALIDADOR**
**MISIÓN AUTORIZADA**
