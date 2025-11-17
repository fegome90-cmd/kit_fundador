---
meta:
  id: "[feature-name-implementation]"
  version: "1.0.0"
  created_at: "[YYYY-MM-DD]"
  updated_at: "[YYYY-MM-DD]"
  base: "[project-name]"
  mode: "implementation"
  complexity: "medium"
  estimated_duration: "[X]d"
---

# PROMPT: Implementación de Funcionalidad - [Feature Name]

## 1. Descripción General

**Funcionalidad**: [Feature Name]
**Objetivo**: [Describe el objetivo principal de la funcionalidad. ¿Qué problema resuelve para el usuario?]
**Duración Estimada**: [X días]
**Complejidad**: Media

### Contexto

[Breve descripción del contexto. ¿En qué parte de la aplicación se integra esta funcionalidad? ¿Hay alguna dependencia técnica o de negocio importante?]

### Requisitos Funcionales Clave
- **RF1**: [El sistema debe permitir al usuario...]
- **RF2**: [El usuario debe poder ver/editar/crear...]
- **RF3**: [La funcionalidad debe integrarse con (otro sistema/módulo)...]

---

## 2. Diseño Técnico y Arquitectura

### Componentes Afectados
- **[Componente/Módulo 1]**: [Breve descripción del cambio requerido]
- **[Componente/Módulo 2]**: [Breve descripción del cambio requerido]
- **[Nuevo Componente 3 (si aplica)]**: [Breve descripción del nuevo componente a crear]

### Flujo de Datos Propuesto
[Diagrama simple o descripción del flujo de datos. Por ejemplo: `Usuario hace clic en Botón X -> Se llama a ApiService.metodoY() -> El backend procesa la solicitud -> La UI se actualiza con Z`]

### Consideraciones de UI/UX
- [¿Hay algún mockup o diseño de referencia? Adjuntar enlace o descripción.]
- [Puntos clave sobre la experiencia de usuario a tener en cuenta.]

---

## 3. Objetivos SMART

### O1: Desarrollar la Lógica del Frontend ([X] días)
- **Específico**: Implementar los componentes de React necesarios para la interfaz de [Feature Name].
- **Medible**: Todos los elementos de la UI definidos en el mockup están implementados y son funcionales.
- **Alcanzable**: Los componentes base ya existen y pueden ser reutilizados.
- **Relevante**: Es el núcleo de la interacción del usuario con la nueva funcionalidad.
- **Temporal**: Completar en [X] días.

### O2: Implementar los Endpoints del Backend ([Y] días)
- **Específico**: Crear los endpoints `GET /api/[feature]` y `POST /api/[feature]` para soportar la funcionalidad.
- **Medible**: Los endpoints responden correctamente según la especificación de la API y pasan las pruebas de integración.
- **Alcanzable**: La arquitectura del backend ya está configurada para añadir nuevas rutas.
- **Relevante**: Proporciona los datos necesarios para que el frontend funcione.
- **Temporal**: Completar en [Y] días.

---

## 4. Plan de Implementación (Timeline)

### Día 1-2: Desarrollo del Backend
- [ ] Tarea 1.1: Definir el esquema de la base de datos para [Feature Name].
- [ ] Tarea 1.2: Implementar el endpoint `POST /api/[feature]`.
- [ ] Tarea 1.3: Escribir tests unitarios para el nuevo servicio.

### Día 3-4: Desarrollo del Frontend
- [ ] Tarea 2.1: Crear el componente principal `[FeatureName]View.tsx`.
- [ ] Tarea 2.2: Integrar el componente con el servicio `ApiService`.
- [ ] Tarea 2.3: Añadir la nueva ruta en el router de la aplicación.

### Día 5: Pruebas y Refinamiento
- [ ] Tarea 3.1: Realizar pruebas E2E del flujo completo.
- [ ] Tarea 3.2: Corregir bugs y hacer ajustes finales de UI/UX.
- [ ] Tarea 3.3: Actualizar la documentación.

---

## 5. Criterios de Aceptación (DoD - Definition of Done)

### Funcionales
- [ ] El usuario puede completar el flujo de [acción principal] de principio a fin sin errores.
- [ ] La interfaz de usuario coincide con los mockups de diseño.
- [ ] Todos los datos se guardan y recuperan correctamente de la base de datos.

### Técnicos
- [ ] El código nuevo tiene una cobertura de tests unitarios de al menos [80]%.
- [ ] No hay regresiones en funcionalidades existentes (todos los tests de regresión pasan).
- [ ] El código sigue las guías de estilo del proyecto (linter sin errores).
- [ ] La documentación para los nuevos componentes y endpoints está completa.

---

## 6. Riesgos Potenciales

- **R1: [Riesgo Técnico]**: La integración con [Sistema Externo Z] podría ser más compleja de lo esperado.
  - **Mitigación**: Realizar un PoC (Proof of Concept) de la integración antes de la implementación completa.
- **R2: [Riesgo de UX]**: El flujo propuesto podría no ser intuitivo para los usuarios.
  - **Mitigación**: Solicitar feedback del equipo de producto/diseño con un prototipo funcional temprano.

---

**Autor**: [Author Name]
**Revisores**: [Reviewer 1], [Reviewer 2]
**Fecha**: [YYYY-MM-DD]
**Estado**: Listo para Desarrollo
