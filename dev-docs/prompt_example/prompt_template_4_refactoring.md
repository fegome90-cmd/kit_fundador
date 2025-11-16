---
meta:
  id: "[refactor-target-module]"
  version: "1.0.0"
  created_at: "[YYYY-MM-DD]"
  updated_at: "[YYYY-MM-DD]"
  type: "refactoring"
  complexity: "[high/medium/low]"
  estimated_duration: "[X]d"
---

# PROMPT: Refactorización - [Módulo/Componente a Refactorizar]

## 1. Resumen de la Refactorización

**Módulo/Componente**: [Nombre del Módulo, ej: `AuthenticationService`]
**Complejidad**: [Alta/Media/Baja]
**Duración Estimada**: [X días/horas]

### Motivación (¿Por qué refactorizar?)
[Explica la razón principal para esta refactorización. Ejemplos:
- **Deuda Técnica**: El código es difícil de mantener, entender o extender.
- **Performance**: El componente actual es lento y necesita optimización.
- **Escalabilidad**: La implementación actual no soportará el crecimiento esperado.
- **Duplicación de Código**: Existe lógica similar en varias partes del código que puede ser unificada.]

### Objetivos Específicos
- **O1**: [Reducir la complejidad ciclomática del método `X` en un 20%.]
- **O2**: [Extraer la lógica de `Y` a un servicio reutilizable.]
- **O3**: [Mejorar la cobertura de tests del módulo del 60% al 85%.]
- **O4**: [No introducir ningún cambio en el comportamiento de cara al usuario/API.]

---

## 2. Estado Actual del Código (Code Smell)

### Problemas Identificados
- **[Code Smell 1, ej: "Método Largo"]**: [El método `handleLogin` tiene más de 200 líneas, mezclando validación, autenticación y logging.]
- **[Code Smell 2, ej: "Clase Grande"]**: [La clase `UserSession` tiene demasiadas responsabilidades, manejando tanto el estado de la sesión como la configuración del usuario.]
- **[Code Smell 3, ej: "Bajo Rendimiento"]**: [Se realizan N+1 queries a la base de datos en el bucle de `X`.]

### Métricas Actuales (Opcional)
- **Complejidad Ciclomática**: [Valor Actual]
- **Líneas de Código (LOC)**: [Valor Actual]
- **Cobertura de Tests**: [Porcentaje Actual]
- **Tiempo de Ejecución (Performance)**: [Medición Actual]

---

## 3. Plan de Refactorización

### Cambios Propuestos
- **P1: [Extraer Servicio de Validación]**
  - **Descripción**: [Crear un nuevo `ValidationService` y mover toda la lógica de validación de `AuthenticationService` a este nuevo servicio.]
  - **Archivos a crear/modificar**: `ValidationService.ts`, `AuthenticationService.ts`.

- **P2: [Simplificar el Método `handleLogin`]**
  - **Descripción**: [Dividir el método `handleLogin` en tres métodos más pequeños y privados: `_validateInput`, `_authenticateUser`, `_createSession`.]
  - **Archivos a modificar**: `AuthenticationService.ts`.

- **P3: [Optimizar Queries de Base de Datos]**
  - **Descripción**: [Reemplazar el bucle que causa N+1 queries con una única query usando `Promise.all` y un `dataloader`.]
  - **Archivos a modificar**: `data-access/UserRepository.ts`.

### Archivos Afectados
- `src/services/AuthenticationService.ts`
- `src/services/ValidationService.ts` (Nuevo)
- `src/data-access/UserRepository.ts`
- `tests/services/AuthenticationService.test.ts`

---

## 4. Estrategia de Verificación (Anti-Regresión)

### Pruebas Existentes
- [Asegurar que todos los tests unitarios y de integración existentes para `AuthenticationService` sigan pasando después del refactor.]

### Nuevas Pruebas
- [Añadir tests unitarios para el nuevo `ValidationService`.]
- [Crear un test de integración que cubra el flujo de login completo para verificar que el comportamiento no ha cambiado.]
- [Añadir un test de performance para medir el tiempo de ejecución del método optimizado.]

### Proceso de Verificación Manual
1. [Ejecutar la aplicación en un entorno de desarrollo.]
2. [Realizar un login de usuario exitoso.]
3. [Intentar un login con credenciales incorrectas y verificar el mensaje de error.]
4. [Verificar que la sesión de usuario se crea y destruye correctamente.]
5. **Criterio**: [Toda la funcionalidad de autenticación debe operar exactamente como antes del refactor.]

### Criterios de Aceptación (Definition of Done)
- [ ] El código ha sido refactorizado según el plan.
- [ ] El comportamiento externo del módulo no ha cambiado.
- [ ] Todos los tests existentes pasan.
- [ ] Se han añadido nuevos tests para la lógica extraída/modificada.
- [ ] La cobertura de tests ha alcanzado el objetivo de [85]%.
- [ ] El código ha sido revisado (code review) y aprobado.

---

**Autor**: [Developer Name]
**Revisor**: [Reviewer Name]
**Fecha**: [YYYY-MM-DD]
**Estado**: Listo para Implementación
