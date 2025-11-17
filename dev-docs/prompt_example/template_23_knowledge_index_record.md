#🧠 REGISTRO DE CONOCIMIENTO PARA LA MEMORIA - [Nombre de la Tarea/Misión]

**ID de Conocimiento:** KNOWLEDGE-[YYYYMMDD]-[TASK_NAME]
**Fecha de Registro:** [YYYY-MM-DD]
**Misión de Origen:** [Enlace al `template_22_agent_mission_briefing.md` correspondiente]
**Autor(es):** [Agente/Desarrollador que completó la misión]
**Nivel de Memoria:** [L1 (Táctico) / L2 (Operacional) / L3 (Estratégico)]

---

## 1. Resumen Ejecutivo del Conocimiento Adquirido

[Describe en 2-3 frases el aprendizaje principal o el conocimiento generado durante esta misión. ¿Cuál es la "joya" de información que debe ser recordada?]

**Ejemplo:** "Se descubrió que la librería `legacy-library` no es compatible con Node.js v18+, causando fallos silenciosos de corrupción de memoria. El nuevo `Patrón de Adaptador` implementado en `NewAdapterService` aísla exitosamente esta librería y previene futuros problemas."

---

## 2. Patrones de Código Identificados/Implementados

### Patrón 1: [Nombre del Patrón, ej: `Adapter Pattern` para Librerías Heredadas]
- **Contexto:** [Necesidad de integrar una librería antigua e inestable (`legacy-library`) sin que afecte al resto del sistema.]
- **Implementación:** [Se creó una clase `NewAdapterService` que actúa como única intermediaria con la librería. Expone una API moderna y limpia (con Promises, manejo de errores robusto) y maneja internamente las peculiaridades de la librería heredada.]
- **Ubicación del Código:** `[src/services/NewAdapterService.ts]`
- **Cuándo Reutilizarlo:** [Siempre que se necesite integrar una dependencia externa con una API inconsistente o riesgosa.]

---

## 3. Anti-Patrones a Evitar Descubiertos

### Anti-Patrón 1: [Nombre del Anti-Patrón, ej: `Llamadas Directas a Dependencias Inestables`]
- **Contexto:** [El código original llamaba directamente a `legacy-library` desde múltiples módulos de negocio.]
- **Problema:** [Cuando `legacy-library` fallaba, causaba un efecto en cascada, tumbando varios servicios no relacionados. Era imposible de mockear en los tests.]
- **Lección Aprendida:** [Nunca se debe permitir que la lógica de negocio dependa directamente de una implementación externa inestable. Siempre se debe usar una capa de abstracción (como un adaptador o facade).]

---

## 4. Decisiones de Arquitectura (ADRs) Tomadas o Propuestas

- **[ADR-042: Adopción del Patrón Adaptador para Dependencias Heredadas]**
  - **Status:** [Implementado]
  - **Justificación:** [Formaliza la lección aprendida en la sección de anti-patrones. Establece como estándar que todas las integraciones con sistemas heredados DEBEN usar un adaptador.]
  - **Enlace al ADR:** `[docs/adr/042-adapter-pattern-for-legacy.md]`

---

## 5. Actualizaciones Sugeridas para la Documentación y Runbooks

- **[Documento a Actualizar]:** `[Runbook de Despliegue del Servicio X]`
  - **Sugerencia:** [Añadir una nueva sección de "Troubleshooting" que describa cómo diagnosticar problemas con `NewAdapterService` y cómo los errores de `legacy-library` se manifiestan ahora en los logs (con un `errorCode` específico).]

- **[Documento a Actualizar]:** `[Guía de Onboarding para Nuevos Desarrolladores]`
  - **Sugerencia:** [Añadir una sección sobre el nuevo estándar de integración con sistemas heredados, enlazando al ADR-042.]

---

## 6. Métricas y Datos Clave para la Memoria

- **[Métrica 1]:** [Reducción de la Tasa de Errores]
  - **Valor:** [La tasa de errores 5xx del servicio X se redujo de 2.5% a 0.01% después de la implementación.]
  - **Fuente:** [Enlace al Dashboard de Datadog]

- **[Métrica 2]:** [Mejora en la Cobertura de Tests]
  - **Valor:** [Fue posible aumentar la cobertura de tests del módulo de `70%` a `98%` gracias a que el adaptador es fácilmente mockeable.]
  - **Fuente:** [Enlace al Reporte de Cobertura de CI]

---
**FIN DEL REGISTRO DE CONOCIMIENTO**
