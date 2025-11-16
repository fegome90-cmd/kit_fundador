---
meta:
  id: "[sprint-name-implementation]"
  version: "1.0.0"
  created_at: "[YYYY-MM-DD]"
  updated_at: "[YYYY-MM-DD]"
  base: "[framework-name]"
  mode: "implementation"
  anti_drift: true
  architecture: "[architecture-type]"
  dependencies: ["[dependency-1]", "[dependency-2]"]
  target_coverage: 95
  estimated_duration: "[X]d"
  complexity: "high"
  innovation_level: "[high/medium/low]"
  evaluation_score: 0
---

# PROMPT SPRINT [SPRINT_NAME] - IMPLEMENTACIÓN v1.0.0

## Descripción General

**Sprint**: [Sprint Title]
**Duración**: [Estimated Duration]
**Complejidad**: [High/Medium/Low]
**Innovación**: [High/Medium/Low]
**Tipo**: [Type of Implementation, e.g., New Module, System Refactor]

### Contexto Académico Basado en [Previous Research Sprint/Document]

Este sprint implementa un **[Componente o Sistema a Implementar]** basado en la investigación exhaustiva completada en [Referencia a Investigación Previa], que analizó [Número] archivos y reveló que el sistema [Nombre del Sistema Actual] tiene un score de **[Score Actual]/10 ([Calificación])**.

**Fundamentos Teóricos Validados:**
- **[Pattern o Principio 1]**: [Descripción Breve] [K:KEY-CONCEPT-1]
- **[Pattern o Principio 2]**: [Descripción Breve] [K:KEY-CONCEPT-2]
- **[Pattern o Principio 3]**: [Descripción Breve] [K:KEY-CONCEPT-3]

### Innovación del Sprint Basada en Investigación

**IN1: [Nombre de la Innovación 1]** ⭐⭐⭐ [EVIDENCIA:EVIDENCE-ID-1]
- [Descripción de la Característica 1] [C:CHARACTERISTIC-1]
- [Descripción de la Característica 2] [U:USE-CASE-1]
- [Descripción de la Característica 3] [K:KEY-CONCEPT-4]

**IN2: [Nombre de la Innovación 2]** ⭐⭐⭐ [EVIDENCIA:EVIDENCE-ID-2]
- [Descripción de la Característica 1] [C:CHARACTERISTIC-2]
- [Descripción de la Característica 2] [U:USE-CASE-2]
- [Descripción de la Característica 3] [K:KEY-CONCEPT-5]

---

## Arquitectura del Sistema [Nombre del Sistema]

### Arquitectura de [Tipo de Arquitectura] [K:ARCHITECTURE-KEY]

El sistema implementa una **arquitectura de [Tipo]** con los siguientes componentes:

#### Capa 1: [Nombre de la Capa 1] - [Responsabilidad] [C:LAYER-1]
- **Componente Base**: [Descripción]
- **Responsabilidad**: [Descripción]
- **Tecnología**: [Nombre de la Tecnología]

#### Capa 2: [Nombre de la Capa 2] - [Responsabilidad] [U:LAYER-2]
- **Componente**: [Descripción]
- **Responsabilidad**: [Descripción]
- **Tecnología**: [Nombre de la Tecnología]

#### Capa 3: [Nombre de la Capa 3] - [Responsabilidad] [K:LAYER-3]
- **Componente**: [Descripción]
- **Responsabilidad**: [Descripción]
- **Tecnología**: [Nombre de la Tecnología]

### Flujo de Datos [C:DATA-FLOW]

\`\`\`
[Actor 1] → [Componente A] → [Componente B]
     ↓
[Componente C] → [Componente D] → [Resultado]
\`\`\`

### Integración con Sistemas Existentes [EVIDENCIA:SYSTEM-INTEGRATION]

- **[Sistema Existente 1]**: [Descripción de la Integración]
- **[Sistema Existente 2]**: [Descripción de la Integración]

### Target de Code Coverage [C:COVERAGE-TARGET]

**Objetivo:** [XX]% code coverage mínimo para componentes críticos.

#### Cobertura por Componente [K:COVERAGE-BREAKDOWN]
- **[Componente Crítico 1]**: ≥[XX]%
- **[Componente Crítico 2]**: ≥[XX]%
- **[Componente Core]**: ≥[XX]%

---

## Objetivos SMART Basados en Investigación

### O1: [Implementar/Desarrollar Componente A] ([X] días) [K:OBJECTIVE-1]
- **Específico**: [Descripción Específica del Objetivo] [C:SPECIFIC-DETAIL]
- **Medible**: [Métrica para Medir el Éxito] [U:METRIC-1]
- **Alcanzable**: [Justificación de por qué es Alcanzable] [EVIDENCIA:EVIDENCE-ID-3]
- **Relevante**: [Por qué este objetivo es importante para el proyecto] [K:RELEVANCE-1]
- **Temporal**: Completar en Fase 1 ([X] días) [C:TIMELINE-1]

### O2: [Integrar con Sistema B] ([Y] días) [C:OBJECTIVE-2]
- **Específico**: [Descripción Específica del Objetivo] [U:SPECIFIC-DETAIL-2]
- **Medible**: [Métrica para Medir el Éxito] [K:METRIC-2]
- **Alcanzable**: [Justificación de por qué es Alcanzable] [EVIDENCIA:EVIDENCE-ID-4]
- **Relevante**: [Por qué este objetivo es importante para el proyecto] [K:RELEVANCE-2]
- **Temporal**: Completar en Fase 2 ([Y] días) [C:TIMELINE-2]

---

## Timeline Detallado por Fases

### Fase 1: [Nombre de la Fase 1] ([X] días) [K:PHASE-1]
- **1.1**: [Tarea 1.1] (0.5 días)
- **1.2**: [Tarea 1.2] (1 día)
- **1.3**: [Tarea 1.3] (1 día)
- **1.4**: [Testing y Validación de la Fase] (0.5 días)

### Fase 2: [Nombre de la Fase 2] ([Y] días) [C:PHASE-2]
- **2.1**: [Tarea 2.1] (0.5 días)
- **2.2**: [Tarea 2.2] (1.5 días)
- **2.3**: [Tarea 2.3] (0.5 días)
- **2.4**: [Testing y Validación de la Fase] (0.5 días)

**Total**: [Z] días

---

## Estructura de Carpetas

\`\`\`
[nombre-del-proyecto]/
├── src/
│   ├── components/
│   │   ├── [componente-a]/
│   │   │   └── index.ts      # [C:COMPONENT-A]
│   │   └── [componente-b]/
│   │       └── index.ts      # [U:COMPONENT-B]
│   ├── core/
│   │   └── [core-logic].ts   # [K:CORE-LOGIC]
│   └── services/
│       └── [api-service].ts  # [C:API-SERVICE]
├── docs/
│   └── README.md
└── tests/
    └── [componente-a].test.ts # [U:COMPONENT-A-TESTS]
\`\`\`

---

## Tests Ejecutables Específicos

### Test 1: [Funcionalidad Crítica 1] [U:TEST-CASE-1]
\`\`\`bash
# [Comando para ejecutar el test]
# [Verificación esperada]
\`\`\`

### Test 2: [Integración con Sistema Externo] [C:TEST-CASE-2]
\`\`\`bash
# [Comando para ejecutar el test]
# [Verificación esperada]
\`\`\`

### Test 3: [Performance y Carga] [K:TEST-CASE-3]
\`\`\`bash
# [Comando para medir el rendimiento]
# [Verificación: umbral de rendimiento esperado]
\`\`\`

---

## Métricas Cuantificables

### Métricas de Desarrollo [K:DEVELOPMENT-METRICS]
- **[Métrica 1]**: [Objetivo Cuantificable]
- **[Métrica 2]**: [Objetivo Cuantificable]
- **Cobertura de testing**: ≥[XX]%

### Métricas de Calidad [K:QUALITY-METRICS]
- **[Métrica de Calidad 1]**: [Objetivo]
- **[Métrica de Calidad 2]**: [Objetivo]

### Métricas de Performance [K:PERFORMANCE-METRICS]
- **[Métrica de Performance 1]**: ≤[Umbral]
- **[Métrica de Performance 2]**: ≤[Umbral]

---

## Criterios de Éxito

### Criterios Técnicos [K:TECHNICAL-CRITERIA]
- [ ] **[Criterio Técnico 1]**: [Descripción]
- [ ] **[Criterio Técnico 2]**: [Descripción]
- [ ] **Performance**: [Umbral de performance aceptable]

### Criterios Funcionales [K:FUNCTIONAL-CRITERIA]
- [ ] **[Criterio Funcional 1]**: [Descripción]
- [ ] **[Criterio Funcional 2]**: [Descripción]
- [ ] **[Criterio Funcional 3]**: [Descripción]

---

## Mecanismos Anti-Drift

### Boundary Markers (≥10) [K:ANTI-DRIFT-MECHANISMS]
- **BM1**: [Principio o restricción fundamental 1] [C:BOUNDARY-1]
- **BM2**: [Principio o restricción fundamental 2] [U:BOUNDARY-2]
- **BM3**: [Performance threshold] [K:BOUNDARY-3]
- **BM4**: [Code coverage threshold] [C:BOUNDARY-4]
- **BM5**: [Restricción de arquitectura] [K:BOUNDARY-5]
- ...

### EVIDENCIA vs PROPUESTA [K:EVIDENCE-VS-PROPOSAL]
- **EVIDENCIA**: [Hechos y datos basados en investigación]
- **PROPUESTA**: [Nuevas ideas y arquitecturas a implementar]
- **Separación**: [Cómo se asegura que la implementación se basa en evidencia]

---

## Riesgos y Mitigaciones

### R1: [Descripción del Riesgo 1] [C:RISK-1]
- **Probabilidad**: [Alta/Media/Baja]
- **Impacto**: [Alto/Medio/Bajo]
- **Mitigación**: [Estrategia de mitigación] [U:MITIGATION-1]
- **Monitoreo**: [Cómo se monitoreará el riesgo] [C:MONITORING-1]

### R2: [Descripción del Riesgo 2] [K:RISK-2]
- **Probabilidad**: [Alta/Media/Baja]
- **Impacto**: [Alto/Medio/Bajo]
- **Mitigación**: [Estrategia de mitigación] [U:MITIGATION-2]
- **Monitoreo**: [Cómo se monitoreará el riesgo] [K:MONITORING-2]

---

## Deliverables Esperados

### Código y Artefactos
1. **[Componente/Módulo 1]**
2. **[Componente/Módulo 2]**
3. **Tests Unitarios y de Integración**

### Documentación
1. **Guía de [Componente/Módulo]**
2. **Documentación de API actualizada**
3. **ADR (Architecture Decision Record) si aplica**

---

**Versión:** 1.0.0
**Autor:** [Author Name/Team]
**Fecha:** [YYYY-MM-DD]
**Prioridad:** [Alta/Media/Baja]
**Estado:** ✅ Ready for execution
**Investigación Base:** [Referencia al documento de investigación]

**[EXIT_CODE: 0]**
**[EVALUATION_SCORE: 0/100]**
**[RESEARCH_VALIDATED: TRUE/FALSE]**

**[K:KEY-TAG-1]** **[C:KEY-TAG-2]** **[U:KEY-TAG-3]**
