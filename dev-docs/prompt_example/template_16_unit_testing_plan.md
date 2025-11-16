# 🎯 PLAN DE PRUEBAS UNITARIAS - [Módulo/Componente]

**ID:** UNIT-[YYYYMMDD]-[MODULE_NAME]
**Fecha:** [YYYY-MM-DD]
**Módulo/Componente:** [Nombre del componente, clase o función a probar]
**Responsable:** [Nombre del Desarrollador]

---

## 1. Alcance de las Pruebas Unitarias

**Objetivo:** Verificar que cada unidad de código (función, método, componente) funciona correctamente de forma aislada, cubriendo tanto los "happy paths" como los casos borde y de error.

**Unidades a Probar:**
- **[Función/Método 1]:** `[nombreDeLaFuncion(argumentos)]`
- **[Función/Método 2]:** `[otraFuncion(argumentos)]`
- **[Componente de UI 1]:** `<MiComponente props={...} />`

**Dependencias Mockeadas:**
- [Para probar `X`, se mockeará el servicio `YService` para que devuelva datos predecibles.]
- [Se usará `jest.spyOn` para verificar que la función `Z` es llamada.]

---

## 2. Casos de Prueba para [Función/Método 1: `nombreDeLaFuncion`]

| ID del Caso | Descripción del Caso de Prueba | Input/Props | Resultado Esperado |
|-------------|--------------------------------|-------------|--------------------|
| UT-001 | **Happy Path:** Probar con un input válido y estándar. | `[valor_valido]` | Devuelve `[resultado_esperado]` |
| UT-002 | **Caso Borde:** Probar con un input vacío o cero. | `[]` o `0` | Devuelve `[resultado_para_vacio]` |
| UT-003 | **Caso Borde:** Probar con un input muy grande. | `[valor_grande]` | Devuelve `[resultado_esperado]` sin errores |
| UT-004 | **Caso de Error:** Probar con un input `null` o `undefined`. | `null` | Lanza un `TypeError` con el mensaje "El input no puede ser nulo" |
| UT-005 | **Caso de Error:** Probar con un tipo de dato incorrecto. | `"texto"` (si espera un número) | Lanza un `ValidationError` |

---

## 3. Casos de Prueba para [Componente de UI 1: `<MiComponente />`]

| ID del Caso | Descripción del Caso de Prueba | Props | Aserción (Assert) |
|-------------|--------------------------------|-------|-------------------|
| UI-001 | **Renderizado Básico:** El componente se renderiza sin errores. | `{}` (props mínimas) | `expect(component).not.toBeNull()` |
| UI-002 | **Renderizado Condicional:** Muestra el estado de "Cargando..." cuando `isLoading` es `true`. | `{ isLoading: true }` | `expect(getByText('Cargando...')).toBeInTheDocument()` |
| UI-003 | **Renderizado Condicional:** Muestra la lista de ítems cuando se le pasan datos. | `{ isLoading: false, items: [...] }` | `expect(getAllByRole('listitem')).toHaveLength(items.length)` |
| UI-004 | **Interacción:** Llama a la función `onClick` cuando se hace clic en el botón. | `{ onClick: mockOnClick }` | `fireEvent.click(getByRole('button')); expect(mockOnClick).toHaveBeenCalledTimes(1)` |
| UI-005 | **Accesibilidad:** El componente tiene los roles y atributos ARIA correctos. | `{}` | `expect(getByRole('region')).toHaveAttribute('aria-label', 'Mi Región')` |

---

## 4. Criterios de Aceptación

- [ ] Todos los casos de prueba definidos en este plan están implementados.
- [ ] La cobertura de código para las unidades probadas es ≥ [90]%.
- [ ] Todos los tests unitarios pasan en el pipeline de CI.
- [ ] Los tests son rápidos (la suite completa de unit tests se ejecuta en < [2] minutos).

---
**FIN DEL PLAN DE PRUEBAS UNITARIAS**
