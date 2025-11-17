# 📈 MATRIZ DE MÉTRICAS Y CRITERIOS DE ÉXITO - [Nombre del Sprint/Proyecto]

**ID:** SUCCESS-MATRIX-[YYYYMMDD]-[SPRINT_NAME]
**Fecha de Definición:** [YYYY-MM-DD]
**Sprint/Proyecto Asociado:** [Enlace al ticket o prompt principal]
**Versión:** 1.0.0

---

## 1. Resumen de Objetivos

**Objetivo Principal:** [Describe el objetivo de negocio o producto que este sprint busca alcanzar. Ej: "Mejorar la retención de usuarios aumentando la velocidad de la página de búsqueda en un 50%."]

**Target de Score Global Mínimo para Aprobación:** [90]/100 (Nivel EXCELENTE)

---

## 2. Matriz de Métricas por Dimensión

*Metodología de Scoring: 4 Dimensiones (Completitud 30%, Calidad 30%, Impacto 25%, Sostenibilidad 15%)*

### Dimensión 1: COMPLETITUD (Peso: 30%)

| KPI / Criterio de Éxito | Métrica | Baseline (Actual) | Target (Objetivo) | Método de Medición |
|-------------------------|---------|-------------------|-------------------|--------------------|
| **Entrega de Funcionalidades** | Nº de tareas completadas | 0 / 5 | 5 / 5 | [Revisión de tickets en Jira cerrados y verificados.] |
| **Cobertura de Requisitos** | % de requisitos del PRD cubiertos | 0% | 100% | [Checklist de validación contra el documento de requisitos.] |
| **Documentación de Usuario** | Estado de la guía de usuario | Inexistente | Creada y revisada | [Enlace al documento en Confluence.] |
| **Entrega de Artefactos** | Nº de artefactos requeridos | 0 / 3 | 3 / 3 | [Verificación de la existencia del ejecutable, imagen de Docker y notas de lanzamiento.] |

### Dimensión 2: CALIDAD (Peso: 30%)

| KPI / Criterio de Éxito | Métrica | Baseline (Actual) | Target (Objetivo) | Método de Medición |
|-------------------------|---------|-------------------|-------------------|--------------------|
| **Cobertura de Tests Unitarios** | % de líneas cubiertas | 65% | ≥ 85% | [Reporte de cobertura de Jest/Vitest en el pipeline de CI.] |
| **Bugs Críticos en Producción** | Nº de bugs post-lanzamiento | N/A | 0 | [Monitoreo de Sentry/Datadog durante 1 semana post-despliegue.] |
| **Vulnerabilidades de Seguridad** | Nº de vulnerabilidades altas/críticas | 5 (reporte Snyk) | 0 | [Resultado del scan de `Snyk` en el pipeline de CI.] |
| **Adherencia al Linter** | Nº de errores de linter | ~50 | 0 | [Resultado del paso de `eslint` en el pipeline de CI.] |

### Dimensión 3: IMPACTO (Peso: 25%)

| KPI / Criterio de Éxito | Métrica | Baseline (Actual) | Target (Objetivo) | Método de Medición |
|-------------------------|---------|-------------------|-------------------|--------------------|
| **Latencia de API (p95)** | Tiempo de respuesta en ms | 450ms | < 200ms | [Dashboard de Datadog APM para el endpoint `/api/search`.] |
| **Tasa de Conversión** | % de usuarios que completan el flujo X | 5% | ≥ 7.5% (+50%) | [Dashboard de Amplitude/Mixpanel para el embudo de conversión.] |
| **Satisfacción del Usuario (CSAT)** | Puntuación de encuesta | 3.5 / 5 | ≥ 4.2 / 5 | [Encuesta de satisfacción en la aplicación después de usar la nueva funcionalidad.] |
| **Reducción de Carga en BD** | Uso de CPU de la base de datos | 70% | < 40% | [Dashboard de CloudWatch RDS.] |

### Dimensión 4: SOSTENIBILIDAD (Peso: 15%)

| KPI / Criterio de Éxito | Métrica | Baseline (Actual) | Target (Objetivo) | Método de Medición |
|-------------------------|---------|-------------------|-------------------|--------------------|
| **Mantenibilidad del Código** | Índice de CodeClimate | Grado "C" | Grado "A" | [Análisis de CodeClimate en el pipeline de CI.] |
| **Complejidad Ciclomática** | Complejidad promedio por función | 15 | < 10 | [Reporte de SonarQube.] |
| **Tiempo de Ejecución del Pipeline** | Minutos para CI/CD completo | 20 min | ≤ 12 min | [Métricas de ejecución de GitHub Actions.] |
| **Documentación Interna (Runbook)**| Estado del Runbook | Desactualizado | Actualizado y verificado | [Revisión manual del `runbook.md` con el equipo de SRE.] |

---

## 3. Proceso de Evaluación y Scoring

1.  **Definición:** Esta matriz se completa y se acuerda con el equipo y los stakeholders *antes* de que comience el sprint.
2.  **Seguimiento:** Los KPIs se monitorean a lo largo del sprint.
3.  **Evaluación Final:** Al final del sprint, se realiza una auditoría formal (usando el template de Auditoría General) donde se miden los valores "Actuales" contra los "Targets".
4.  **Cálculo del Score:**
    - Para cada KPI, se asigna un score de 0 a 100 (ej: si el target es `≥85%` y se logra `90%`, el score es 100/100. Si se logra `80%`, podría ser 80/100).
    - Se calcula el promedio de scores para cada dimensión.
    - Se aplica la ponderación de cada dimensión para obtener el Score Global Final.

---
**FIN DE LA MATRIZ DE CRITERIOS DE ÉXITO**
