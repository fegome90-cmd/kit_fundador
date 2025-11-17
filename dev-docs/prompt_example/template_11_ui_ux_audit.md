# 🎨 AUDITORÍA DE UI/UX Y ACCESIBILIDAD - [Nombre de la Aplicación/Flujo]

**Auditoría ID:** AUDIT-UIUX-[YYYYMMDD]-[APP_NAME]
**Fecha:** [YYYY-MM-DD]
**Scope:** [Flujos de usuario auditados, ej: Proceso de Registro, Dashboard Principal]
**Auditor:** [Nombre del Auditor/Equipo de Diseño/UX]
**Metodología:** Evaluación Heurística de Nielsen, Verificación de WCAG 2.1 AA, Revisión de Consistencia de UI.

---

## 📊 Resumen Ejecutivo

### **Calificación General de la Experiencia de Usuario: [A-F] ([EXCELENTE/BUENA/REGULAR/DEFICIENTE/MALA])**

| Área de Auditoría | Issues Críticos | Issues Mayores | Issues Menores | Status |
|-------------------|-----------------|----------------|----------------|--------|
| **Usabilidad (Heurísticas)**| [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Accesibilidad (WCAG 2.1 AA)**| [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Consistencia de UI** | [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **Contenido y Claridad** | [Nº] | [Nº] | [Nº] | [✅/⚠️/❌] |
| **TOTAL** | **[Nº]** | **[Nº]** | **[Nº]** | [✅/⚠️/❌] |

### **Veredicto: ✅ EXPERIENCIA POSITIVA / ⚠️ NECESITA MEJORAS / ❌ EXPERIENCIA FRUSTRANTE**

**Justificación:** [Resumen de los hallazgos. Ej: "La aplicación sufre de inconsistencias visuales que confunden al usuario. Se han encontrado 5 fallos críticos de accesibilidad que impiden el uso a personas con lectores de pantalla. El flujo de registro presenta una alta fricción debido a mensajes de error poco claros."]

---

## 1️⃣ Evaluación Heurística de Usabilidad (Nielsen)

**Metodología:** Se revisaron los flujos principales contra las 10 heurísticas de usabilidad de Jakob Nielsen.

| Heurística | Cumplimiento | Hallazgo Principal | Severidad | Recomendación |
|------------|----------------|------------------|-----------|---------------|
| **1. Visibilidad del estado del sistema** | [✅/⚠️/❌] | [ej: "No hay indicadores de carga (spinners) cuando se guardan datos."] | **Mayor** | [ej: "Añadir spinners en todos los botones que disparen acciones asíncronas."] |
| **2. Coincidencia entre sistema y mundo real** | [✅/⚠️/❌] | [ej: "Se usa jerga técnica ('Commit transaction') en mensajes al usuario."] | Menor | [ej: "Reemplazar por un lenguaje claro y sencillo ('Guardar cambios')."] |
| **3. Control y libertad del usuario** | [✅/⚠️/❌] | [ej: "No hay forma de deshacer la eliminación de un ítem."] | Crítico | [ej: "Implementar una función de 'Deshacer' o un diálogo de confirmación."] |
| **4. Consistencia y estándares** | [✅/⚠️/❌] | [ej: "Se usan tres estilos de botones diferentes para la misma acción ('Guardar')."] | **Mayor** | [ej: "Unificar el estilo de los botones primarios en todo el Design System."] |
| **5. Prevención de errores** | [✅/⚠️/❌] | [ej: "El formulario permite enviar fechas en formato inválido."] | **Mayor** | [ej: "Añadir validación en tiempo real y un selector de fechas (datepicker)."] |
| **... (continuar con las 10)** | ... | ... | ... | ... |

---

## 2️⃣ Auditoría de Accesibilidad (WCAG 2.1 Nivel AA)

**Herramienta(s) Utilizada(s):** [ej: `Lighthouse`, `axe DevTools`, Lector de Pantalla (VoiceOver/NVDA)]

### Resumen de Incumplimientos

- **Incumplimientos Críticos (Nivel A):** [Nº]
- **Incumplimientos Mayores (Nivel AA):** [Nº]

### Hallazgos Críticos/Mayores

| Criterio WCAG | Descripción del Fallo | Ubicación | Severidad | Recomendación |
|---------------|-----------------------|-----------|-----------|---------------|
| **1.1.1 Contenido no textual** | [ej: "La imagen del logo no tiene texto alternativo (`alt`)."] | `[Header.tsx]` | Crítico (A) | [ej: "Añadir `alt='Logo de la Empresa'` a la etiqueta `<img>`."] |
| **1.4.3 Contraste (Mínimo)** | [ej: "El texto gris claro sobre fondo blanco en los placeholders no tiene suficiente contraste (2.5:1)."] | `[Input.css]` | **Mayor** (AA) | [ej: "Aumentar el contraste del color del texto a un mínimo de 4.5:1."] |
| **2.4.4 Propósito de los enlaces (en contexto)** | [ej: "Hay múltiples enlaces con el texto 'Leer más' sin contexto adicional."] | `[ArticleList.tsx]`| **Mayor** (A) | [ej: "Añadir un `aria-label` descriptivo, ej: `aria-label='Leer más sobre [Título del Artículo]'`."] |
| **4.1.2 Nombre, Rol, Valor** | [ej: "Los botones implementados con `<div>` no son accesibles para el teclado ni anuncian su rol."] | `[CustomButton.tsx]`| Crítico (A) | [ej: "Reemplazar los `<div>` por elementos `<button>` semánticos o añadir `role='button'` y `tabindex='0'`."] |

---

## 3️⃣ Revisión de Consistencia de la Interfaz de Usuario (UI)

### Checklist de Consistencia
- [ ] **Tipografía:** ¿Se usan consistentemente los mismos tamaños, pesos y familias de fuentes para títulos, párrafos, etc.? [✅/⚠️/❌]
- [ ] **Colores:** ¿La paleta de colores se aplica de forma consistente en toda la aplicación? [✅/⚠️/❌]
- [ ] **Iconografía:** ¿Los iconos son consistentes en estilo y tamaño? [✅/⚠️/❌]
- [ ] **Espaciado y Layout:** ¿Se utiliza un sistema de espaciado (márgenes, paddings) consistente? [✅/⚠️/❌]
- [ ] **Componentes:** ¿Componentes como botones, inputs y modales tienen la misma apariencia y comportamiento en todas partes? [✅/⚠️/❌]

### Hallazgos
- [El color primario varía ligeramente entre la sección de "Settings" (`#5A5AFF`) y el "Dashboard" (`#5050FF`).]
- [Los márgenes entre secciones son inconsistentes (a veces 16px, a veces 20px).]

---

## 🚀 Plan de Acción y Remediación

### Prioridad Alta (Bloqueadores de Accesibilidad y Usabilidad)

| ID | Área | Acción Recomendada | Responsable | Ticket |
|----|------|--------------------|-------------|--------|
| 1 | **Accesibilidad** | [Corregir los 5 fallos críticos de Nivel A (logos sin alt, botones no semánticos, etc.).] | [Equipo Frontend] | [JIRA-801] |
| 2 | **Usabilidad** | [Implementar un diálogo de confirmación para la acción de eliminar.] | [Equipo Frontend] | [JIRA-802] |

### Prioridad Media (Mejoras Importantes de UX y UI)

| ID | Área | Acción Recomendada | Responsable | Ticket |
|----|------|--------------------|-------------|--------|
| 3 | **UI** | [Unificar todos los botones primarios para que usen el mismo estilo del Design System.] | [Equipo Frontend] | [JIRA-803] |
| 4 | **Accesibilidad**| [Ajustar los colores del texto para cumplir con el ratio de contraste de 4.5:1 (AA).] | [Equipo de Diseño/Frontend] | [JIRA-804] |
| 5 | **Usabilidad** | [Añadir indicadores de carga a todas las acciones asíncronas.] | [Equipo Frontend] | [JIRA-805] |

---
**FIN DE LA AUDITORÍA**
