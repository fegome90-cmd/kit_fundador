# ⚡ AUDITORÍA DE PERFORMANCE Y OPTIMIZACIÓN - [Nombre del Aplicativo/Módulo]

**Auditoría ID:** AUDIT-PERF-[YYYYMMDD]-[APP_NAME]
**Fecha:** [YYYY-MM-DD]
**Scope:** [Componentes auditados, ej: Flujo de Checkout, API de Búsqueda]
**Auditor:** [Nombre del Auditor/Equipo de Performance]
**Metodología:** Pruebas de Carga, Profiling de Código, Análisis de Infraestructura.

---

## 📊 Resumen Ejecutivo

### **Estado General del Rendimiento: [ÓPTIMO/ACEPTABLE/REQUIERE MEJORA/CRÍTICO]**

| Área de Auditoría | KPI Principal | Medición Actual | Target | Status |
|-------------------|---------------|-----------------|--------|--------|
| **Latencia API (p95)**| Tiempo de respuesta | [XX] ms | < [YY] ms | [✅/⚠️/❌] |
| **Throughput (RPS)**| Peticiones por seg | [XX] RPS | > [YY] RPS | [✅/⚠️/❌] |
| **Uso de CPU** | % de CPU | [XX]% | < [YY]% | [✅/⚠️/❌] |
| **Uso de Memoria** | MB de RAM | [XX] MB | < [YY] MB | [✅/⚠️/❌] |
| **Carga de Página (LCP)**| Largest Contentful Paint | [X.X] s | < [Y.Y] s | [✅/⚠️/❌] |

### **Veredicto: ✅ PASA / ⚠️ REQUIERE OPTIMIZACIÓN / ❌ CRÍTICO**

**Justificación:** [Resumen de los hallazgos. Ej: "La latencia de la API de búsqueda excede el target en un 50% bajo carga. Se ha identificado un cuello de botella en una query a la base de datos. El rendimiento del frontend es aceptable, pero hay oportunidades de mejora en el tamaño de las imágenes."]

---

## 1️⃣ KPIs de Performance y Targets

**Objetivo:** Definir los indicadores clave de rendimiento (KPIs) y los objetivos a cumplir.

| Métrica | Descripción | Target | Justificación del Target |
|---------|-------------|--------|--------------------------|
| **Latencia p95 (API)** | Percentil 95 del tiempo de respuesta de la API | < 200ms | [Estándar de la industria para una buena UX] |
| **Throughput (API)** | Peticiones por segundo que el sistema puede manejar | > 500 RPS | [Proyección de carga para el pico de tráfico] |
| **Tasa de Error (API)** | Porcentaje de errores (5xx) bajo carga | < 0.1% | [Objetivo de alta disponibilidad] |
| **LCP (Frontend)** | Largest Contentful Paint | < 2.5s | [Recomendación de Google Core Web Vitals] |
| **Uso de CPU (Servidor)** | Uso promedio de CPU bajo carga | < 80% | [Dejar margen para picos inesperados] |

---

## 2️⃣ Resultados de Pruebas de Carga

**Herramienta(s) Utilizada(s):** [ej: `k6`, `JMeter`, `Gatling`]
**Escenario de Prueba:** [ej: "Simulación de 1000 usuarios concurrentes navegando y comprando durante 10 minutos"]

### Gráficos y Resultados

[Aquí se insertarían gráficos de las herramientas de prueba de carga, mostrando latencia, RPS, y errores a lo largo del tiempo.]

**Ejemplo de Tabla de Resultados:**

| Endpoint | RPS Promedio | Latencia p95 | Tasa de Error | Status |
|----------|--------------|--------------|---------------|--------|
| `GET /api/products` | 250 RPS | 150ms | 0.01% | ✅ ÓPTIMO |
| `POST /api/cart` | 150 RPS | 180ms | 0.05% | ✅ ACEPTABLE |
| `GET /api/search` | 100 RPS | **450ms** | 1.5% | ❌ CRÍTICO |

---

## 3️⃣ Análisis de Cuellos de Botella (Bottlenecks)

**Herramienta(s) Utilizada(s):** [ej: `New Relic`, `Datadog APM`, `pprof`]

### Cuello de Botella #1: [Query Lenta en la Base de Datos]

- **Síntoma:** [La latencia del endpoint `GET /api/search` es muy alta.]
- **Análisis (Profiling):** [El profiling de la aplicación muestra que el 90% del tiempo de respuesta se pasa en una única query a la tabla `products`.]
- **Causa Raíz:** [La query realiza un `JOIN` complejo sobre una tabla sin los índices adecuados. El `EXPLAIN ANALYZE` de la query confirma un "Full Table Scan".]
- **Ubicación:** `[ProductRepository.ts:150]`

### Cuello de Botella #2: [Renderizado Lento en el Frontend]

- **Síntoma:** [La página de inicio tiene un LCP de 4.2 segundos.]
- **Análisis (Lighthouse/PageSpeed Insights):** [El análisis muestra que la imagen principal (hero image) es el LCP y tarda mucho en cargar.]
- **Causa Raíz:** [La imagen es un PNG de 2.5 MB sin compresión ni optimización. No se están usando formatos modernos como WebP.]
- **Ubicación:** `[HomePage.tsx:25]`

---

## 4️⃣ Recomendaciones de Optimización

### Prioridad Alta (Impacto Inmediato)

| ID | Área | Recomendación | Esfuerzo Estimado | Impacto Esperado |
|----|------|---------------|-------------------|------------------|
| 1 | **Base de Datos** | [Añadir un índice compuesto en las columnas `(name, category)` de la tabla `products`.] | **Bajo** (1-2 horas) | [Reducción >50% en latencia de búsqueda] |
| 2 | **Frontend** | [Comprimir la imagen principal, servirla en formato WebP, y usar `srcset` para diferentes tamaños de pantalla.] | **Bajo** (2-3 horas) | [Reducción del LCP a <2.5s] |

### Prioridad Media (Mejora Continua)

| ID | Área | Recomendación | Esfuerzo Estimado | Impacto Esperado |
|----|------|---------------|-------------------|------------------|
| 3 | **API / Caching** | [Implementar una capa de caché (ej: Redis) para las búsquedas más frecuentes en `GET /api/search`.] | **Medio** (1-2 días) | [Mejora de latencia y reducción de carga en BD] |
| 4 | **Código** | [Refactorizar el bucle en `X` para evitar N+1 queries usando un `DataLoader`.] | **Medio** (1 día) | [Mejora de rendimiento en el endpoint Y] |

---

## 🚀 Plan de Acción

**Objetivo:** Implementar las recomendaciones de alta prioridad en el próximo sprint.

### Tareas Inmediatas

| Tarea | Responsable | Ticket |
|-------|-------------|--------|
| [Crear migración de base de datos para añadir índice] | [Equipo Backend] | [JIRA-789] |
| [Optimizar y comprimir imágenes del frontend] | [Equipo Frontend] | [JIRA-790] |

### Monitoreo Post-Implementación
- [Volver a ejecutar las pruebas de carga después de aplicar los cambios.]
- [Monitorear la latencia p95 de `GET /api/search` en producción.]
- [Verificar el LCP en Core Web Vitals después del despliegue.]

---
**FIN DE LA AUDITORÍA**
