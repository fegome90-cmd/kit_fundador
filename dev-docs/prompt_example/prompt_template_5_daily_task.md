---
meta:
  id: "[task-ticket-number]"
  type: "daily-task"
  priority: "[high/medium/low]"
  estimated_duration: "[X]h"
---

# PROMPT: Tarea Diaria - [Título Corto de la Tarea]

**Ticket/ID**: [ID del Ticket, ej: JIRA-456]
**Prioridad**: [Alta/Media/Baja]
**Módulo**: [Nombre del Módulo]
**Estimación**: [X horas]

## ¿Qué hay que hacer? (What)

[Describe la tarea de forma clara y directa en 1-3 frases. Ejemplos:
- "Actualizar el texto del botón 'Enviar' a 'Registrarse' en la página de registro."
- "Añadir un nuevo campo 'Teléfono' al formulario de perfil de usuario."
- "Incrementar el timeout de la llamada a la API de `X` de 5 a 15 segundos."]

## ¿Por qué hay que hacerlo? (Why)

[Explica brevemente la razón de la tarea. Esto da contexto y ayuda a entender la importancia. Ejemplos:
- "El cambio fue solicitado por el equipo de UX para mejorar la claridad."
- "Para cumplir con los nuevos requisitos del producto."
- "Para solucionar timeouts intermitentes en producción."]

## Detalles de Implementación (How)

**Archivos a modificar**:
- `src/components/views/RegisterPage.tsx`
- `src/constants/translations.json`

**Consideraciones técnicas**:
- [Cualquier detalle técnico importante. Ej: "Asegúrate de actualizar tanto la traducción en español como en inglés."]
- [Ej: "El nuevo campo debe tener una validación de formato de número de teléfono."]

## Criterios de Aceptación (Definition of Done)

- [ ] **Funcionalidad**: [El cambio está visible/operativo en la aplicación.]
- [ ] **Tests**: [Si aplica, el test `X` ha sido actualizado o creado.]
- [ ] **Código Limpio**: [El código sigue las guías de estilo (linter pasa).]
- [ ] **Revisión**: [El Pull Request ha sido aprobado.]

---
**Asignado a**: [Developer Name]
**Fecha**: [YYYY-MM-DD]
