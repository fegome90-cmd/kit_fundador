# 🛠️ AUDITORÍA DE CALIDAD DE CÓDIGO Y DEUDA TÉCNICA - [Nombre del Repositorio/Módulo]

**Auditoría ID:** AUDIT-CODE-[YYYYMMDD]-[REPO_NAME]
**Fecha:** [YYYY-MM-DD]
**Scope:** [Componentes auditados, ej: Módulo de `core-billing`, Repositorio `frontend-app`]
**Auditor:** [Nombre del Auditor/Equipo de Arquitectura]
**Metodología:** Análisis Estático de Código, Revisión de Cobertura de Tests, Identificación de "Code Smells".

---

## 📊 Resumen Ejecutivo

### **Índice de Salud del Código: [A-E] ([EXCELENTE/BUENO/ACEPTABLE/DEFICIENTE/CRÍTICO])**

| Área de Auditoría | Métrica Clave | Medición Actual | Target | Status |
|-------------------|---------------|-----------------|--------|--------|
| **Complejidad Ciclomática** | Promedio por función | [X.XX] | < 10 | [✅/⚠️/❌] |
| **Duplicación de Código** | % de código duplicado | [X.X]% | < 5% | [✅/⚠️/❌] |
| **Cobertura de Tests** | Cobertura de líneas | [XX]% | > 80% | [✅/⚠️/❌] |
| **Issues de Linter/Estilo**| Issues Críticos/Mayores | [Nº] | 0 | [✅/⚠️/❌] |
| **Deuda Técnica Estimada**| Días de esfuerzo | [XX] días | N/A | [⚠️] |

### **Veredicto: ✅ SALUDABLE / ⚠️ REQUIERE REFACTORIZACIÓN / ❌ REFACTORIZACIÓN URGENTE**

**Justificación:** [Resumen de los hallazgos. Ej: "La cobertura de tests está por debajo del objetivo (65%) y se ha detectado un alto nivel de duplicación de código (15%) en los módulos `A` y `B`. Se estima una deuda técnica de 15 días-persona para alcanzar un estado saludable."]

---

## 1️⃣ Análisis Estático Cuantitativo

**Herramienta(s) Utilizada(s):** [ej: `SonarQube`, `CodeClimate`, `cloc`, `eslint`]
**Fecha del Análisis:** [YYYY-MM-DD]

### Métricas Clave

| Métrica | Valor Actual | Benchmark/Target | Interpretación |
|---------|--------------|------------------|----------------|
| **Líneas de Código (LOC)** | [Nº] | N/A | [Tamaño general del codebase] |
| **Complejidad Ciclomática (promedio)**| [X.XX] | < 10 | [Indica la complejidad de las rutas lógicas. Valores altos dificultan el testing y la comprensión.] |
| **Duplicación de Código (%)** | [X.X]% | < 5% | [Indica código copiado/pegado. Aumenta el costo de mantenimiento.] |
| **Mantenibilidad (Índice)** | [A-E] | A/B | [Calificación general de la herramienta sobre la facilidad de mantenimiento.] |
| **Cobertura de Tests (%)** | [XX]% | > 80% | [Porcentaje de código cubierto por tests automatizados.] |

### Módulos Más Problemáticos

| Módulo | Complejidad Prom. | Duplicación | Cobertura Tests | Deuda Técnica (días) |
|--------|-------------------|-------------|-----------------|----------------------|
| `[path/to/moduleA]` | **18.5** | 25% | 30% | 8 |
| `[path/to/moduleB]` | 12.0 | **35%** | 55% | 5 |
| `[path/to/moduleC]` | 9.5 | 5% | **45%** | 2 |

---

## 2️⃣ Análisis Cualitativo ("Code Smells")

**Metodología:** Revisión manual de los módulos más problemáticos identificados en el análisis cuantitativo.

### "Smell" #1: [Clase/Módulo Grande (God Object)]

- **Descripción:** [El módulo `[moduleA]` tiene más de 2000 líneas y maneja responsabilidades que no le corresponden, como `X`, `Y` y `Z`.]
- **Impacto:** [Alta cohesión, bajo acoplamiento. Dificulta la reutilización y el testing. Cualquier cambio pequeño requiere modificar este archivo gigante.]
- **Recomendación:** [Aplicar el Principio de Responsabilidad Única (SRP). Extraer las lógicas de `X` e `Y` a sus propios módulos/clases: `XService` e `YService`.]

### "Smell" #2: [Método Largo]

- **Descripción:** [El método `processOrder` en `[moduleA]` tiene 300 líneas y múltiples niveles de anidamiento (`if/else`, `for`).]
- **Impacto:** [Difícil de leer, entender y testear. Alta complejidad ciclomática.]
- **Recomendación:** [Descomponer el método en funciones más pequeñas y con nombres claros, siguiendo el patrón "Extract Method". Por ejemplo: `_validateOrder`, `_calculateTaxes`, `_saveOrderToDB`.]

### "Smell" #3: [Duplicación de Código]

- **Descripción:** [La lógica para validar direcciones de usuario está duplicada en `[moduleA]` y `[moduleB]` con ligeras variaciones.]
- **Impacto:** [Cuando se necesita un cambio, hay que aplicarlo en múltiples lugares, lo que es propenso a errores.]
- **Recomendación:** [Crear un módulo/utilidad compartida `AddressValidator` y reutilizarlo en ambos módulos.]

---

## 3️⃣ Evaluación de la Calidad de los Tests

### Checklist de Calidad
- [ ] **Claridad y Legibilidad:** ¿Los tests son fáciles de entender? ¿Siguen un patrón como Arrange-Act-Assert? [✅/⚠️/❌]
- [ ] **Fiabilidad (No Flaky):** ¿Los tests dan resultados consistentes o fallan de forma intermitente? [✅/⚠️/❌]
- [ ] **Cobertura de Casos Borde:** ¿Se testean casos como inputs nulos, vacíos, o valores extremos? [✅/⚠️/❌]
- [ ] **Independencia:** ¿Los tests se pueden ejecutar en cualquier orden y no dependen de otros tests? [✅/⚠️/❌]
- [ ] **Velocidad:** ¿La suite de tests se ejecuta en un tiempo razonable? [✅/⚠️/❌]

### Hallazgos
- [La mayoría de los tests se enfocan en el "happy path" y no cubren suficientes casos de error.]
- [Se encontraron 5 tests "flaky" en la suite de E2E que dependen de timeouts fijos.]

---

## 🚀 Plan de Acción para Reducir Deuda Técnica

### Prioridad Alta (Próximo Sprint)

| ID | Tipo | Acción Recomendada | Módulo Afectado | Esfuerzo Estimado |
|----|------|--------------------|-----------------|-------------------|
| 1 | **Refactor** | [Extraer lógicas de `[moduleA]` a nuevos servicios (`XService`, `YService`).] | `[moduleA]` | 5 días |
| 2 | **Test** | [Aumentar la cobertura de tests de `[moduleC]` del 45% al 80%, enfocándose en casos de error.] | `[moduleC]` | 3 días |

### Prioridad Media (Siguiente Trimestre)

| ID | Tipo | Acción Recomendada | Módulo Afectado | Esfuerzo Estimado |
|----|------|--------------------|-----------------|-------------------|
| 3 | **Refactor** | [Unificar la lógica duplicada de validación de direcciones.] | `[moduleA]`, `[moduleB]` | 2 días |
| 4 | **Refactor** | [Descomponer el método `processOrder` en funciones más pequeñas.] | `[moduleA]` | 2 días |
| 5 | **Test** | [Refactorizar los 5 tests E2E "flaky" para usar esperas explícitas en lugar de timeouts.] | `[e2e-suite]` | 3 días |

---
**FIN DE LA AUDITORÍA**
