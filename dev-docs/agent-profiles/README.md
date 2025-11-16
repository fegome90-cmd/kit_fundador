# Guía de Uso: Agentes Ejecutor y Validador

> Sistema de QA con dos agentes IA trabajando en conjunto para prevenir deuda técnica

---

## 🎯 Concepto

Este sistema implementa un **patrón Maker-Checker** con IA:

```
┌─────────────┐         ┌──────────────┐
│   EJECUTOR  │────────>│  VALIDADOR   │
│  (Builder)  │ Submit  │    (QA)      │
└─────────────┘         └──────────────┘
       ↑                        │
       │      Feedback          │
       └────────────────────────┘
```

**Beneficios**:
- ✅ Previene deuda técnica antes de merge
- ✅ Detecta bugs temprano
- ✅ Mejora calidad de tests
- ✅ Valida arquitectura automáticamente
- ✅ Feedback constructivo y específico

---

## 🚀 Cómo Usar

### Setup Inicial

1. **Leer los perfiles**:
   - `EJECUTOR.md` - Para modo implementación
   - `VALIDADOR.md` - Para modo validación

2. **Elegir workflow**:
   - **Opción A**: Un solo agente cambiando de rol
   - **Opción B**: Dos agentes separados
   - **Opción C**: Tú como Ejecutor, IA como Validador

---

## 📝 Workflow Completo

### Opción A: Un Solo Agente (Más Común)

#### 1. Modo Ejecutor

```markdown
**Prompt de activación**:

"Activa modo EJECUTOR. Lee el perfil en dev-docs/agent-profiles/EJECUTOR.md 
y trabaja en [TASK-XXX] siguiendo todas las reglas del perfil."
```

**El agente**:
1. Lee contexto (project-state.json, rules, task)
2. Planea approach
3. Implementa con TDD (Red-Green-Refactor)
4. Escribe tests
5. Documenta cambios
6. Prepara handoff

#### 2. Cambio a Modo Validador

```markdown
**Prompt de cambio**:

"Cambia a modo VALIDADOR. Lee el perfil en dev-docs/agent-profiles/VALIDADOR.md.
Revisa el código que acabas de escribir como Ejecutor.
Olvida que tú lo escribiste - sé crítico y objetivo."
```

**El agente**:
1. Valida tests pasan
2. Busca edge cases
3. Valida arquitectura
4. Detecta code smells
5. Da feedback estructurado

#### 3. Iterar

```markdown
Si hay issues CRITICAL o HIGH:
- Vuelve a modo EJECUTOR
- Arregla los issues
- Vuelve a modo VALIDADOR
- Repite hasta ✅ APPROVED
```

---

### Opción B: Dos Agentes Separados

#### Setup

```bash
# Terminal 1: Agente Ejecutor
export AGENT_ROLE=EJECUTOR

# Terminal 2: Agente Validador  
export AGENT_ROLE=VALIDADOR
```

#### Workflow

**Ejecutor** (Terminal 1):
```markdown
1. Implementa feature
2. Crea handoff document
3. Notifica al Validador: "@Validador - Ready for review"
```

**Validador** (Terminal 2):
```markdown
1. Recibe notificación
2. Hace code review completo
3. Genera feedback report
4. Notifica al Ejecutor con decisión
```

**Beneficio**: Separación de concerns más clara

**Desventaja**: Requiere coordinación entre agentes

---

### Opción C: Humano + IA

#### Tu Rol: Ejecutor

1. Implementas código
2. Escribes tests
3. Haces commit
4. Solicitas review

#### IA Rol: Validador

```markdown
**Prompt**:

"Actúa como Validador (perfil en dev-docs/agent-profiles/VALIDADOR.md).
Revisa estos cambios:
- [Lista de archivos modificados]
- [Criterios de aceptación]

Genera code review completo."
```

**Beneficio**: Aprovechas tu conocimiento del dominio + rigor de IA

---

## 🔄 Ejemplo de Sesión Completa

### Fase 1: Modo Ejecutor (45 min)

```bash
$ # Activar modo ejecutor
$ claude --mode ejecutor

> "Trabaja en TASK-042: Implementar email verification"
```

**Ejecutor hace**:
```markdown
1. [5 min] Lee contexto y planea
2. [30 min] TDD: Red-Green-Refactor cycle
3. [5 min] Documenta cambios
4. [5 min] Prepara handoff

OUTPUT:
- 3 archivos modificados
- 8 tests nuevos (todos pasando)
- Handoff document
- Commits descriptivos
```

### Fase 2: Cambio a Modo Validador (25 min)

```bash
$ # Cambiar a validador
> "Cambia a modo VALIDADOR. Revisa el código de TASK-042."
```

**Validador hace**:
```markdown
1. [5 min] Validación rápida (tests, linter, build)
2. [15 min] Code review detallado
3. [5 min] Genera feedback report

OUTPUT:
- Code review document
- 0 CRITICAL issues ✅
- 1 HIGH issue (null email edge case)
- 2 MEDIUM issues (mejoras)
- 1 LOW issue (sugerencia)
- Status: ⚠️ APPROVED WITH COMMENTS
```

### Fase 3: Fix Issues (15 min)

```bash
$ # Volver a ejecutor
> "Vuelve a modo EJECUTOR. Arregla HIGH-1 del review."
```

**Ejecutor hace**:
```markdown
1. [10 min] Implementa fix + test
2. [5 min] Re-submit

OUTPUT:
- 1 archivo modificado
- 1 test agregado
- Issue HIGH-1 resuelto
```

### Fase 4: Re-Validación (5 min)

```bash
$ # Validador final
> "Modo VALIDADOR. Valida fix de HIGH-1."
```

**Validador hace**:
```markdown
1. [5 min] Revisa solo el fix

OUTPUT:
- ✅ Fix correcto
- ✅ Test agregado y pasando
- Status: ✅ APPROVED
- Listo para merge
```

**Total time**: ~90 minutos  
**Quality**: Alta (issues encontrados y corregidos antes de merge)

---

## 📊 Métricas de Éxito

### Para el Ejecutor
- ✅ Tasks completadas / semana
- ✅ % de tasks que pasan validación en 1er intento
- ✅ Cobertura de tests promedio
- ✅ Tiempo promedio por task

### Para el Validador
- ✅ Issues críticos detectados
- ✅ False positive rate <10%
- ✅ Tiempo promedio de review
- ✅ Feedback quality score

### Para el Sistema
- ✅ Bugs en producción ⬇️
- ✅ Deuda técnica ⬇️
- ✅ Calidad de código ⬆️
- ✅ Velocity mantenida (no ralentiza)

---

## 💡 Tips para Maximizar Efectividad

### 1. Separación Mental

Cuando cambies de Ejecutor a Validador:
```markdown
**Reset mental**:
"Olvida que acabas de escribir este código.
Eres un revisor externo viendo este código por primera vez.
¿Qué problemas ves?"
```

### 2. Usa Timebox

```markdown
- Ejecutor: 45-60 min por task
- Validador: 20-30 min por review
- Si pasas el tiempo, hay algo mal con el approach
```

### 3. No Saltees el Proceso

```markdown
❌ NO: "Ya sé que está bien, salteo validación"
✅ SI: Siempre valida, siempre encuentras algo
```

### 4. Feedback Escrito

```markdown
No solo pienses el feedback, escríbelo.
Esto fuerza claridad y puede revisarse después.
```

### 5. Iterar Rápido

```markdown
No esperes perfección en 1era iteración.
Red → Green → Refactor también aplica al proceso.
```

---

## 🎓 Ejemplos de Uso

### Ejemplo 1: Feature Nueva

```markdown
# TASK-123: Implementar reset de password

## Ejecutor
- Crea PasswordResetToken entity
- Implementa use case
- Escribe 12 tests
- Coverage 100%
- [45 min]

## Validador
- Encuentra: Token no expira (CRITICAL)
- Encuentra: Rate limiting falta (HIGH)
- Sugiere: Mejores mensajes de error (MEDIUM)
- Status: ❌ NEEDS REVISION

## Ejecutor (iteración 2)
- Agrega expiration a token
- Implementa rate limiting
- Mejora error messages
- [20 min]

## Validador (iteración 2)
- ✅ Todos los issues resueltos
- Status: ✅ APPROVED
- [10 min]

Total: 75 min
Bugs prevenidos: 2 críticos
```

### Ejemplo 2: Bug Fix

```markdown
# BUG-456: Usuario puede hacer double-checkout

## Ejecutor
- Identifica race condition
- Agrega transaction lock
- Agrega test concurrency
- [30 min]

## Validador
- ✅ Fix correcto
- Sugiere: Agregar metric para monitorear (LOW)
- Status: ✅ APPROVED WITH COMMENTS
- [15 min]

Total: 45 min
Bug crítico resuelto correctamente
```

### Ejemplo 3: Refactor

```markdown
# TASK-789: Refactor God Object UserService

## Ejecutor
- Extrae EmailService
- Extrae PasswordService
- Extrae ProfileService
- Todos los tests siguen pasando
- [60 min]

## Validador
- ✅ Separación de concerns correcta
- Encuentra: Circular dependency UserService <-> EmailService (HIGH)
- Sugiere: Mejores nombres (MEDIUM)
- Status: ⚠️ APPROVED WITH COMMENTS

## Ejecutor (iteración 2)
- Rompe dependencia circular con event
- Mejora nombres
- [15 min]

## Validador (iteración 2)
- ✅ Todo resuelto
- Status: ✅ APPROVED

Total: 90 min
Arquitectura mejorada sin bugs introducidos
```

---

## 🛠️ Personalización

### Ajustar Severidad de Issues

Edita `VALIDADOR.md` sección "Categorías de Issues" según tu contexto:

```markdown
# Para startup early-stage:
- Más permisivo con MEDIUM/LOW
- Stricter con CRITICAL (security, data corruption)

# Para empresa enterprise:
- Más estricto en todos los niveles
- Compliance issues son CRITICAL
```

### Ajustar Checklist

Agrega/quita items según tu stack:

```markdown
# Para backend API:
+ Rate limiting
+ API versioning
+ Authentication/Authorization

# Para frontend:
+ Accessibility
+ Performance (bundle size)
+ Browser compatibility
```

### Ajustar Tiempo

```markdown
# Para tasks pequeñas:
- Ejecutor: 20-30 min
- Validador: 10 min

# Para tasks grandes:
- Ejecutor: 2-4 horas
- Validador: 30-60 min
```

---

## ❓ FAQs

### ¿Esto no ralentiza el desarrollo?

**R**: Inicialmente sí (~30% más tiempo), pero:
- Menos bugs en producción (ahorro)
- Menos deuda técnica (ahorro futuro)
- Mejor calidad = menos refactors

**ROI positivo después de 1-2 sprints**.

### ¿Qué pasa si Validador y Ejecutor no están de acuerdo?

**R**: 
1. Documentar el desacuerdo
2. Consultar con humano (Tech Lead)
3. Crear ADR con la decisión
4. Aplicar consistentemente

### ¿Debo validar TODAS las tasks?

**R**:
- ✅ Features nuevas: SIEMPRE
- ✅ Bug fixes críticos: SIEMPRE  
- ✅ Refactors: SIEMPRE
- ⚠️ Fixes menores de typos: Opcional
- ⚠️ Documentación: Opcional (pero recomendado)

### ¿Puedo tener más de 2 agentes?

**R**: Sí, algunos equipos usan:
- **Ejecutor**: Implementa
- **Validador**: Revisa calidad
- **Arquitecto**: Valida diseño
- **Security**: Valida seguridad

Pero 2 es el sweet spot para la mayoría.

---

## 🎯 Checklist de Implementación

Para adoptar este sistema en tu proyecto:

- [ ] Leer ambos perfiles completamente
- [ ] Elegir workflow (opción A, B, o C)
- [ ] Hacer primera task con el sistema
- [ ] Ajustar severidades si es necesario
- [ ] Ajustar checklists para tu stack
- [ ] Documentar customizaciones en este archivo
- [ ] Entrenar equipo (si hay humanos)
- [ ] Medir métricas (antes vs después)
- [ ] Iterar el proceso

---

## 📚 Referencias

- **Maker-Checker Pattern**: https://en.wikipedia.org/wiki/Maker-checker
- **Code Review Best Practices**: Google Engineering Practices
- **TDD**: Kent Beck - "Test Driven Development by Example"
- **Clean Code**: Robert C. Martin - "Clean Code"

---

## 🆘 Troubleshooting

### Problema: Validador demasiado estricto

**Solución**: Ajusta definiciones de severidad en `VALIDADOR.md`. No todo debe ser CRITICAL.

### Problema: Ejecutor ignorando TDD

**Solución**: Refuerza en `EJECUTOR.md` que TDD es OBLIGATORIO. No negociable.

### Problema: Reviews muy largas

**Solución**: 
- Limita tasks a max 2 horas de implementación
- Si review >30 min, task es muy grande

### Problema: Muchas iteraciones

**Solución**:
- Ejecutor debe leer mejor las reglas antes de empezar
- Validador debe dar feedback más claro
- Considerar pair programming en lugar de async

---

## 🚀 Próximos Pasos

1. **Prueba el sistema** en una task real
2. **Mide resultados** (bugs found, time spent)
3. **Ajusta el proceso** según tus necesidades
4. **Documenta aprendizajes** en este archivo
5. **Escala** a más tasks/agentes

---

**¿Preguntas?** Abre issue en el proyecto o consulta a Tech Lead.

**¿Mejoras al sistema?** Contribuye con PR actualizando estos perfiles.

---

Última actualización: 2025-01-16  
Versión: 1.0  
Mantenedor: [Tu nombre/equipo]
