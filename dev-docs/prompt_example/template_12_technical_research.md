# 🔬 PROMPT DE INVESTIGACIÓN TÉCNICA - [Tema de Investigación]

**ID de Investigación:** RESEARCH-[YYYYMMDD]-[TEMA]
**Fecha:** [YYYY-MM-DD]
**Scope:** [Área específica de la investigación, ej: "Comparativa de librerías de estado para React", "Análisis de viabilidad para migrar a microservicios"]
**Investigador(es):** [Nombre del Investigador/Equipo]
**Duración Estimada:** [X horas/días]

---

## 1. Planteamiento del Problema y Objetivos

### Problema a Investigar
[Describe claramente la pregunta o el problema que esta investigación busca resolver. ¿Qué desconocemos o qué necesitamos decidir? Ej: "El equipo necesita elegir una nueva librería de estado para reemplazar Redux, pero no está claro cuál ofrece el mejor balance entre performance, simplicidad y ecosistema."]

### Objetivos SMART de la Investigación

- **O1: [Analizar Alternativas]**
  - **Específico:** [Analizar y documentar las características de las siguientes alternativas: `Alternativa A`, `Alternativa B`, `Alternativa C`.]
  - **Medible:** [Crear una tabla comparativa con al menos 10 criterios objetivos (performance, tamaño del bundle, etc.).]
  - **Alcanzable:** [La documentación y los benchmarks de cada alternativa están públicamente disponibles.]
  - **Relevante:** [La decisión impactará directamente la arquitectura frontend de los próximos proyectos.]
  - **Temporal:** [Completar el análisis comparativo en X horas.]

- **O2: [Crear un Prototipo (PoC)]**
  - **Específico:** [Desarrollar un pequeño prototipo funcional utilizando la `Alternativa A` (la más prometedora) para validar su integración en nuestro codebase.]
  - **Medible:** [El prototipo debe implementar las funcionalidades clave X e Y.]
  - **Alcanzable:** [Se puede reutilizar parte de nuestra aplicación existente para el PoC.]
  - **Relevante:** [Validará en la práctica las suposiciones teóricas del análisis.]
  - **Temporal:** [Completar el PoC en Y horas.]

- **O3: [Producir un Informe de Recomendación]**
  - **Específico:** [Escribir un informe resumiendo los hallazgos y recomendando una de las alternativas, con una justificación clara.]
  - **Medible:** [El informe debe incluir la tabla comparativa, los resultados del PoC y una sección de pros/contras para cada opción.]
  - **Alcanzable:** [Toda la información necesaria se habrá recopilado en los objetivos anteriores.]
  - **Relevante:** [Este informe será la base para una decisión de arquitectura formal (ADR).]
  - **Temporal:** [Completar el informe en Z horas.]

---

## 2. Metodología de Investigación

### Fuentes de Información
- **Documentación Oficial:** [Enlaces a la documentación de cada alternativa.]
- **Artículos y Benchmarks:** [Enlaces a comparativas, artículos de Medium, etc.]
- **Código Fuente:** [Enlaces a los repositorios de GitHub para análisis.]
- **Prototipos (PoC):** [Repositorio donde se desarrollará el PoC.]

### Criterios de Evaluación
1. **[Criterio 1, ej: Performance]:** [Cómo se medirá, ej: "Tiempo de renderizado en el PoC, benchmarks públicos".]
2. **[Criterio 2, ej: Curva de Aprendizaje]:** [Cómo se medirá, ej: "Evaluación subjetiva basada en la calidad de la documentación y la complejidad de la API".]
3. **[Criterio 3, ej: Ecosistema y Comunidad]:** [Cómo se medirá, ej: "Número de descargas en npm, actividad en GitHub, disponibilidad de librerías complementarias".]
4. **[Criterio 4, ej: Tamaño del Bundle]:** [Cómo se medirá, ej: "Reporte de `bundlephobia.com` y análisis del bundle del PoC".]
5. **[...continuar con todos los criterios relevantes.]**

### Plan de Trabajo (Timeline)
- **Fase 1: Recopilación de Datos (X horas):** [Leer documentación, buscar artículos.]
- **Fase 2: Análisis Comparativo (Y horas):** [Rellenar la tabla comparativa, analizar pros y contras.]
- **Fase 3: Desarrollo del Prototipo (Z horas):** [Implementar el PoC con la opción seleccionada.]
- **Fase 4: Síntesis y Redacción del Informe (W horas):** [Documentar los hallazgos y la recomendación final.]

---

## 3. Deliverables Esperados

1. **Tabla Comparativa Detallada:**
   - Un documento (Markdown, hoja de cálculo) con las alternativas en filas y los criterios de evaluación en columnas.

2. **Código Fuente del Prototipo (PoC):**
   - Un enlace a un repositorio de GitHub con el prototipo funcional.
   - Un `README.md` que explique cómo ejecutarlo y qué demuestra.

3. **Informe Final de Investigación y Recomendación:**
   - Un documento que contenga:
     - **Resumen Ejecutivo:** La recomendación final y por qué.
     - **Análisis Comparativo:** La tabla y una discusión de los pros y contras.
     - **Resultados del PoC:** Qué se aprendió del prototipo.
     - **Análisis de Riesgos:** Riesgos potenciales de adoptar la tecnología recomendada.
     - **Próximos Pasos:** Acciones recomendadas post-decisión.

---

## 4. Riesgos Potenciales de la Investigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| **"Analysis Paralysis"** | Media | Medio | [Establecer un timebox estricto para cada fase de la investigación.] |
| **Información sesgada o desactualizada** | Media | Alto | [Priorizar la documentación oficial y benchmarks recientes. Validar claims con el PoC.] |
| **El PoC se vuelve demasiado complejo** | Alta | Medio | [Definir un scope muy limitado para el PoC, enfocado solo en validar los puntos clave.] |

---
**FIN DEL PROMPT DE INVESTIGACIÓN**
