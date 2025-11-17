# 🚧 DEFINICIÓN DE GUARDRAILS ANTI-DRIFT - [Nombre de la Tarea/Misión]

**ID:** GUARDRAILS-[YYYYMMDD]-[TASK_NAME]
**Fecha de Creación:** [YYYY-MM-DD]
**Tarea Asociada:** [Enlace al ticket o prompt de la misión]
**Versión:** 1.0.0
**Status:** [Activo / Congelado]

---

## 1. Declaración de la Misión (Mission Statement)

[Describe en una sola frase, clara e inequívoca, el objetivo principal y único de esta tarea. Esta es la "estrella polar" que debe guiar todas las acciones.]

**Ejemplo:** "Implementar el endpoint `POST /api/orders` para la creación de pedidos, asegurando que pase los 3 tests de aceptación definidos y no modifique ningún otro endpoint existente."

---

## 2. Marcadores de Límite (Boundary Markers)

*Esta sección define las "líneas rojas" que no se deben cruzar bajo ninguna circunstancia. Violar un marcador de límite implica un fallo automático de la misión.*

- **BM1: [Límite de Alcance]**
  - **Descripción:** [ej: "Solo se modificarán los archivos dentro del directorio `/src/modules/orders/`."]
  - **Verificación:** `git diff --name-only` no debe mostrar archivos fuera de este directorio.

- **BM2: [Límite de Tecnología]**
  - **Descripción:** [ej: "No se introducirán nuevas dependencias de producción (`dependencies`) en `package.json`. Solo se permiten dependencias de desarrollo (`devDependencies`)."]
  - **Verificación:** Revisión del `package.json` antes y después.

- **BM3: [Límite de Performance]**
  - **Descripción:** [ej: "La latencia del endpoint no debe superar los 150ms en el percentil 95 bajo las pruebas de carga estándar."]
  - **Verificación:** Ejecución del script de k6 `tests/performance/orders.js`.

- **BM4: [Límite de Comportamiento]**
  - **Descripción:** [ej: "El comportamiento de la API `GET /api/users` no debe cambiar. La suite de tests de regresión para usuarios debe pasar al 100%."]
  - **Verificación:** Ejecución de la suite de tests `users.test.ts`.

---

## 3. Cadena de Verificación (Chain-of-Verification - CoVe)

*Esta sección define qué afirmaciones (`claims`) deben ser respaldadas por evidencia empírica y cómo se debe presentar esa evidencia.*

- **Claim 1: "La nueva implementación es segura contra inyecciones SQL."**
  - **Evidencia Requerida:** [Un test de integración específico que intente una inyección SQL y falle si la vulnerabilidad existe. El test debe usar una librería de aserción reconocida.]

- **Claim 2: "El sistema maneja correctamente los fallos de la base de datos."**
  - **Evidencia Requerida:** [Un test de integración donde la conexión a la base de datos es mockeada para lanzar una excepción. El log de la aplicación debe mostrar un manejo de error controlado y una respuesta de API 500.]

- **Claim 3: "La documentación ha sido actualizada."**
  - **Evidencia Requerida:** [Un `diff` del archivo de documentación de la API (ej: `openapi.yaml`) mostrando los cambios correspondientes al nuevo endpoint.]

---

## 4. Protocolo [EVIDENCE] vs. [PROPOSAL]

*Este protocolo rige cómo se deben tratar los hechos verificados frente a las nuevas ideas que surjan durante la implementación.*

- **[EVIDENCE]:** Toda afirmación sobre el estado actual del sistema, el resultado de un test o una métrica debe estar etiquetada como `[EVIDENCE]` y acompañada de la prueba correspondiente (un log, un resultado de test, un enlace a un dashboard).
- **[PROPOSAL]:** Cualquier idea para mejorar o cambiar algo que esté fuera de la Declaración de la Misión (ej: "Mientras estaba en el código de órdenes, vi una forma de refactorizar el módulo de usuarios...") debe ser etiquetada como `[PROPOSAL]` y registrada en un documento separado (ej: un nuevo ticket en el backlog). **No se debe actuar sobre una `[PROPOSAL]` dentro del scope de esta misión.**

---

## 5. Fijación de Contexto (Context Pinning)

*Define el universo exacto de información que se debe utilizar para esta tarea, previniendo la contaminación con información irrelevante o desactualizada.*

- **Fuentes de Verdad (Sources of Truth):**
  - **Requisitos:** [Enlace al ticket JIRA-123]
  - **Diseño de API:** [Enlace al archivo `openapi.yaml` en el commit `abcdef123`]
  - **Mockups de UI:** [Enlace al diseño de Figma v2.1]
- **Fuentes Prohibidas:**
  - [Conversaciones de Slack de hace más de 24 horas.]
  - [Versiones anteriores del documento de requisitos.]
  - [Cualquier ticket del backlog que no sea JIRA-123.]

---

## 6. Condiciones de Éxito y Fallo de la Misión

- **Éxito (Success):**
  - [Se cumple al 100% la Declaración de la Misión.]
  - [No se ha violado ningún Marcador de Límite.]
  - [Todos los Claims requeridos han sido verificados con la Evidencia correspondiente.]
- **Fallo (Failure):**
  - [Se viola uno o más Marcadores de Límite.]
  - [La implementación final no cumple la Declaración de la Misión.]
  - [No se puede proporcionar la Evidencia requerida para un Claim.]

---
**FIN DE LA DEFINICIÓN DE GUARDRAILS**
