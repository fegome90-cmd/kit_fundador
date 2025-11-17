# 🛡️ HANDOFF [PROJECT/SPRINT NAME]

**Chat ID:** [Identifier for the handoff context]
**Fecha:** [YYYY-MM-DDTHH:MM:SSZ]
**Versión:** 1.0.0
**Agente/Equipo:** [Name of the Agent or Team handing off]
**Status:** ✅ COMPLETADO - Ready for Next Context

---

## ✅ Tareas Completadas

### **[Categoría 1, ej: Arquitectura/Backend]**
- [x] **[Tarea 1.1]**: [Breve descripción de la implementación]
  - **Validación:** [Referencia al test o método de validación] ✅

- [x] **[Tarea 1.2]**: [Breve descripción de la implementación]
  - **Validación:** [Referencia al test o método de validación] ✅

### **[Categoría 2, ej: Funcionalidad/Frontend]**
- [x] **[Tarea 2.1]**: [Breve descripción de la implementación]
  - **Validación:** [Referencia al test o método de validación] ✅

- [x] **[Tarea 2.2]**: [Breve descripción de la implementación]
  - **Validación:** [Referencia al test o método de validación] ✅

---

## 📦 Artefactos Generados

| Archivo/Componente | Tipo | Ubicación | Validación | Status |
|--------------------|------|-----------|------------|--------|
| `[path/to/file1.ts]` | Core System | [Repo/Módulo] | ✅ Tests PASS | COMPLETADO |
| `[ComponenteReact.tsx]`| UI Component| [Repo/Módulo] | ✅ Storybook | COMPLETADO |
| `[api-docs.yaml]` | Documentation | [Repo/Docs] | ✅ Schema Valid | COMPLETADO |
| `[script-de-deploy.sh]`| Script | [Repo/Scripts]| ✅ Ejecutado | COMPLETADO |

---

## ⚠️ Issues Pendientes / Riesgos

### **Issues Abiertos**

| Issue ID | SEVERITY | Descripción | Impacto | Next Step | Owner |
|----------|----------|-------------|---------|-----------|-------|
| [TICKET-123] | MEDIUM | [Breve descripción del issue pendiente] | [Bajo/Medio/Alto] | [Siguiente acción a tomar] | [Equipo/Persona] |
| [TICKET-456] | LOW | [Breve descripción del issue pendiente] | [Bajo/Medio/Alto] | [Siguiente acción a tomar] | [Equipo/Persona] |

### **Riesgos Identificados**

| Riesgo | Probabilidad | Impacto | Mitigación | Status |
|--------|--------------|---------|------------|--------|
| [Riesgo 1] | BAJA | ALTO | [Estrategia de mitigación implementada] | MITIGADO |
| [Riesgo 2] | MEDIA | MEDIO | [Plan de monitoreo o acción] | MONITOREADO |

---

## 🎯 Contexto Crítico

### **Decisiones de Arquitectura (ADRs)**

1. **[ADR-001: Título de la Decisión]**
   - **Decisión:** [Resumen de la decisión tomada]
   - **Rationale:** [Breve justificación de por qué se tomó esa decisión]
   - **Impacto:** [Consecuencias o impacto de la decisión en el sistema]

2. **[ADR-002: Título de la Decisión]**
   - **Decisión:** [Resumen de la decisión tomada]
   - **Rationale:** [Breve justificación de por qué se tomó esa decisión]
   - **Impacto:** [Consecuencias o impacto de la decisión en el sistema]

### **Umbrales/Targets Activos**

| Métrica | Target | Threshold | Actual | Status |
|---------|--------|-----------|--------|--------|
| [Métrica 1, ej: Latencia API] | ≤[X]ms | ≤[Y]ms | [Z]ms | ✅ PASS |
| [Métrica 2, ej: Cobertura Tests]| ≥[X]% | ≥[Y]% | [Z]% | ⚠️ WARNING |

### **Configuración de Entorno**
\`\`\`bash
# Variables de entorno críticas para este entregable
API_URL=[URL del entorno de pruebas]
DATABASE_CONNECTION_STRING=[String de conexión]
SOME_FEATURE_FLAG=true
\`\`\`

---

## 📋 Tareas Siguientes

### **Acciones Inmediatas (para el equipo receptor)**
1. **[Acción 1]**: [Ej: 'Ejecutar el script de migración de base de datos.']
2. **[Acción 2]**: [Ej: 'Actualizar la variable de entorno X en el entorno de staging.']

### **Próximo Sprint (Recomendaciones)**
1. **[Recomendación 1]**: [Ej: 'Monitorear el rendimiento del nuevo componente.']
2. **[Recomendación 2]**: [Ej: 'Abordar el issue TICKET-123.']

---

## 🧪 Comandos de Validación

### **Comandos para verificar la entrega**
\`\`\`bash
# 1. Ejecutar tests de integración
npm run test:integration

# 2. Verificar el estado de salud del servicio
curl -s http://[service-url]/api/health | jq '.status'

# 3. Validar la documentación generada
npm run docs:validate
\`\`\`

---

## 🔄 Handoff Checklist

### **Entregables (5/5)**
- [x] **Código Fuente** - [Pull Request enlazado y mergeado]
- [x] **Tests** - [Todos los tests pasan en el pipeline de CI/CD]
- [x] **Documentación** - [Páginas de Confluence/Notion actualizadas]
- [x] **Configuración** - [Variables de entorno documentadas y añadidas a Vault/Secrets Manager]
- [x] **Plan de Despliegue** - [Pasos para el despliegue documentados]

### **Conocimiento Transferido (3/3)**
- [x] **Sesión de Handoff** - [Reunión realizada con el equipo receptor]
- [x] **Contexto Crítico Documentado** - [Sección de "Contexto Crítico" completada]
- [x] **Canales de Comunicación** - [Canal de Slack/Teams establecido para preguntas post-handoff]

---

## 🔗 Referencias

- **[Pull Request Principal]**: [Enlace al PR]
- **[Ticket de Jira/Trello]**: [Enlace al ticket]
- **[Documento de Diseño]**: [Enlace al documento]
- **[Grabación de la Sesión de Handoff]**: [Enlace a la grabación]

---

**[HANDOFF_PROVIDER_NAME]**
**✅ Handoff COMPLETADO - Ready for Next Context**
