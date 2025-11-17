---
meta:
  id: "[bug-ticket-number]"
  version: "1.0.0"
  created_at: "[YYYY-MM-DD]"
  updated_at: "[YYYY-MM-DD]"
  type: "bug-fix"
  severity: "[critical/high/medium/low]"
  estimated_duration: "[X]h"
---

# PROMPT: Corrección de Bug - [Breve Descripción del Bug]

## 1. Resumen del Bug

**Ticket/ID**: [Número o ID del Ticket, ej: JIRA-123]
**Severidad**: [Crítica/Alta/Media/Baja]
**Módulo Afectado**: [Nombre del Módulo/Componente/Servicio]
**Reportado por**: [Nombre o Equipo]

### Comportamiento Observado (El Problema)
[Describe de manera clara y concisa qué es lo que está fallando. ¿Qué ve el usuario o qué ocurre en el sistema que no debería?]

### Comportamiento Esperado
[Describe qué debería ocurrir si el bug no existiera. ¿Cuál es el funcionamiento correcto?]

### Pasos para Reproducir
1. [Primer paso para reproducir el bug]
2. [Segundo paso...]
3. [Tercer paso...]
4. **Resultado**: [Se observa el comportamiento inesperado]

---

## 2. Análisis de la Causa Raíz (Root Cause Analysis)

### Investigación Realizada
[Describe brevemente qué has investigado para encontrar la causa. ¿Revisaste logs? ¿Depuraste el código en una sección específica? ¿Analizaste algún cambio reciente?]

### Causa Raíz Identificada
[Explica cuál es la causa fundamental del problema. Por ejemplo: "Una validación de nulos está ausente en el servicio `UserService` cuando se procesan usuarios sin foto de perfil, causando una excepción de puntero nulo."]

---

## 3. Solución Propuesta

### Descripción de la Solución
[Describe el cambio que planeas implementar para solucionar el bug. Sé específico. Por ejemplo: "Añadir una guarda (null check) al principio del método `processUserProfile` en `UserService` para asignar una imagen por defecto si `user.profilePicture` es nulo."]

### Archivos a Modificar
- `src/services/UserService.ts`
- `tests/services/UserService.test.ts`

### Impacto de la Solución
- **Funcional**: [El perfil de usuario ahora se mostrará correctamente incluso sin foto de perfil.]
- **Técnico**: [Mínimo. El cambio está localizado y no afecta a otras partes del sistema.]
- **Riesgos**: [Bajo. El cambio está cubierto por tests unitarios y no introduce lógica compleja.]

---

## 4. Plan de Verificación

### Pruebas a Realizar
- **Prueba Unitaria**: [Añadir un nuevo caso de prueba en `UserService.test.ts` que verifique el comportamiento con un usuario sin foto de perfil.]
- **Prueba Manual**: [Seguir los "Pasos para Reproducir" después de aplicar el fix y verificar que el comportamiento esperado ocurre.]
- **Prueba de Regresión**: [Revisar la funcionalidad de perfiles de usuario en general para asegurar que no se introdujeron efectos secundarios.]

### Criterios de Aceptación (Definition of Done)
- [ ] El bug ya no es reproducible.
- [ ] El código del fix está implementado y sigue las guías de estilo.
- [ ] Se ha añadido un test unitario que cubre el caso del bug.
- [ ] Todos los tests existentes (unitarios y de integración) siguen pasando.
- [ ] El cambio ha sido revisado (code review) y aprobado.

---

**Asignado a**: [Developer Name]
**Revisor**: [Reviewer Name]
**Fecha**: [YYYY-MM-DD]
**Estado**: Listo para Implementación
