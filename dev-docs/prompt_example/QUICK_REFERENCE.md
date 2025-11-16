# 🚀 Guía Rápida de Selección de Templates

**¿Qué template debo usar?** → Usa esta guía de decisión rápida.

---

## 🔍 Árbol de Decisión

```
┌─ ¿Qué tipo de trabajo vas a hacer? ─┐
│                                      │
├─ IMPLEMENTAR algo nuevo              │
│  │                                   │
│  ├─ ¿Cuánto tiempo tomará?           │
│  │  │                                │
│  │  ├─ < 2 horas                     │
│  │  │  └─► Template 5: Daily Task    │
│  │  │                                │
│  │  ├─ 2-5 días                      │
│  │  │  └─► Template 2: Medium Feature│
│  │  │                                │
│  │  └─ > 5 días o Sprint completo    │
│  │     └─► Template 1: Large Impl    │
│  │                                   │
├─ CORREGIR un bug                     │
│  └─► Template 3: Bug Fix             │
│                                      │
├─ REFACTORIZAR código existente       │
│  └─► Template 4: Refactoring         │
│                                      │
├─ AUDITAR trabajo completado          │
│  └─► Template 6: Audit               │
│                                      │
└─ TRASPASAR contexto a otro agente    │
   └─► Template 7: Handoff             │
```

---

## 📊 Tabla Comparativa Rápida

| Template | Duración | Complejidad | Cuándo Usar | Score Gate |
|----------|----------|-------------|-------------|------------|
| **1: Large Implementation** | > 5 días | Alta | Sprints, arquitecturas nuevas, módulos complejos | Sí (0-100) |
| **2: Medium Feature** | 2-5 días | Media | Features de tamaño medio, endpoints, componentes | No |
| **3: Bug Fix** | < 1 día | Baja-Media | Correcciones, hotfixes, RCA | No |
| **4: Refactoring** | 1-3 días | Media | Reducción de deuda técnica, optimización | No |
| **5: Daily Task** | < 2 horas | Baja | Cambios triviales, ajustes menores | No |
| **6: Audit** | Variable | N/A | Evaluación de calidad, gates de aprobación | Sí (Gate) |
| **7: Handoff** | Variable | N/A | Cambio de contexto, fin de sprint, traspaso | No |

---

## 🎯 Por Tipo de Tarea

### 🆕 Nuevas Funcionalidades

| Descripción | Template |
|-------------|----------|
| "Crear sistema de autenticación completo con JWT, refresh tokens y MFA" | 1: Large Implementation |
| "Añadir página de perfil de usuario con edición" | 2: Medium Feature |
| "Cambiar el texto del botón de 'Submit' a 'Register'" | 5: Daily Task |

### 🐛 Correcciones

| Descripción | Template |
|-------------|----------|
| "Solucionar error 500 al actualizar perfil sin foto (análisis de causa raíz)" | 3: Bug Fix |
| "Corregir typo en mensaje de validación" | 5: Daily Task |

### 🔧 Refactorización

| Descripción | Template |
|-------------|----------|
| "Refactorizar AuthService para reducir complejidad ciclomática de 25 a 10" | 4: Refactoring |
| "Renombrar variable `usrData` a `userData`" | 5: Daily Task |

### ✅ Evaluación

| Descripción | Template |
|-------------|----------|
| "Auditar sprint de implementación antes de merge a main" | 6: Audit |
| "Evaluar calidad de PR antes de aprobar" | 6: Audit (versión simplificada) |

### 🔄 Traspasos

| Descripción | Template |
|-------------|----------|
| "Documentar estado actual antes de cambiar de agente/chat" | 7: Handoff |
| "Traspasar contexto del backend al frontend team" | 7: Handoff |

---

## 💡 Reglas Prácticas

### Regla 1: **Duración determina complejidad**
- < 2 horas → Template 5
- 2 horas - 1 día → Template 3 o 5
- 1-5 días → Template 2 o 4
- > 5 días → Template 1

### Regla 2: **Si necesitas scoring → Template 1 o 6**
- Template 1: Incluye scoring inicial (EVALUATION_SCORE)
- Template 6: Scoring final de auditoría (Gate de aprobación)

### Regla 3: **Si cambias comportamiento → Template según tamaño**
- Nueva feature → 1, 2 o 5 según duración
- Bug fix → 3
- Refactor (sin cambiar comportamiento) → 4

### Regla 4: **Si terminas contexto → Template 7**
- Fin de sprint
- Cambio de agente IA
- Handoff a otro equipo
- Pausa prolongada en el proyecto

### Regla 5: **Si evalúas calidad → Template 6**
- Pre-merge a main
- Gate de release
- Evaluación post-sprint

---

## 🔗 Flujos de Trabajo Típicos

### Flujo 1: Sprint Completo

```
Template 1 (Large Impl) → Desarrollo → Template 6 (Audit) → Gate PASS? → Template 7 (Handoff)
```

### Flujo 2: Feature de Producto

```
Template 2 (Medium Feature) → Desarrollo → Template 6 (Audit) → Merge
```

### Flujo 3: Hotfix de Producción

```
Template 3 (Bug Fix) → Fix → Tests → Merge → Deploy
```

### Flujo 4: Refactorización Técnica

```
Template 4 (Refactoring) → Cambios → Tests (anti-regresión) → Template 6 (Audit) → Merge
```

### Flujo 5: Tarea Trivial

```
Template 5 (Daily Task) → Cambio → Merge
```

---

## 📝 Ejemplos Rápidos

### Ejemplo 1: "Necesito implementar un sistema de notificaciones por email y SMS"

**Análisis**:
- Duración estimada: 7 días
- Complejidad: Alta (integración con servicios externos, múltiples canales)
- Tipo: Nueva funcionalidad

**Template recomendado**: `prompt_template_1_large_implementation.md`

---

### Ejemplo 2: "Hay un bug donde los emails con + en el nombre fallan la validación"

**Análisis**:
- Duración estimada: 2 horas
- Complejidad: Baja
- Tipo: Bug fix

**Template recomendado**: `prompt_template_3_bug_fix.md`

---

### Ejemplo 3: "El UserService tiene 500 líneas y hace demasiadas cosas"

**Análisis**:
- Duración estimada: 2-3 días
- Complejidad: Media
- Tipo: Refactorización (sin cambiar comportamiento)

**Template recomendado**: `prompt_template_4_refactoring.md`

---

### Ejemplo 4: "Cambiar el timeout de la API de 5s a 15s"

**Análisis**:
- Duración estimada: 15 minutos
- Complejidad: Muy baja
- Tipo: Ajuste de configuración

**Template recomendado**: `prompt_template_5_daily_task.md`

---

### Ejemplo 5: "Evaluar si el sprint está listo para producción"

**Análisis**:
- Tipo: Auditoría/Gate de calidad
- Necesita scoring y decisión PASS/FAIL

**Template recomendado**: `template_6_general_audit.md`

---

### Ejemplo 6: "Voy a cambiar de chat/agente y necesito documentar el estado actual"

**Análisis**:
- Tipo: Traspaso de contexto
- Necesita documentar tareas completadas, issues pendientes, ADRs

**Template recomendado**: `template_7_general_handoff.md`

---

## ⚡ Atajos de Memoria

**"¿Qué hago?"**
- Nueva feature grande → 1
- Nueva feature mediana → 2
- Bug → 3
- Refactor → 4
- Tarea rápida → 5
- Auditoría → 6
- Traspaso → 7

**"¿Cuánto tiempo?"**
- < 2h → 5
- 2h-1d → 3, 5
- 1-5d → 2, 4
- > 5d → 1

**"¿Necesito gate?"**
- Sí → 6 (auditoría)
- No → 1, 2, 3, 4, 5

**"¿Cambio de contexto?"**
- Sí → 7 (handoff)
- No → 1-6

---

## 📖 Ver También

- [README completo](./README.md) - Documentación detallada de todos los templates
- [Agent Profiles](../agent-profiles/README.md) - Perfiles de agentes IA
- [Task Management](../task.md) - Gestión de tareas del proyecto

---

**Tip**: Guarda esta página en favoritos para acceso rápido 🔖
