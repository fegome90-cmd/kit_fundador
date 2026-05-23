# ADR-007: Performance Testing Tools and Thresholds

## Status
✅ Accepted (2024-01-XX)

## Context
Necesitamos establecer una estrategia de performance testing para el proyecto que:
- Sea consistente con la arquitectura Clean Architecture
- Permita detectar regresiones de rendimiento tempranamente
- Defina thresholds claros y medibles
- Use herramientas adecuadas para cada tipo de test

## Problem
¿Qué herramientas y thresholds usar para performance testing cuando:
1. Jest no está diseñado para load testing real?
2. Necesitamos medir percentiles (p50, p95, p99)?
3. Queremos detectar memory leaks de forma confiable?
4. Debemos simular carga concurrente realista?

## Decision

### Herramientas Seleccionadas

#### 1. Tests de Rendimiento Unitarios (Jest)
**Uso**: Mediciones básicas de tiempo de respuesta en tests existentes
**Herramienta**: Jest nativo + `performance.now()`
**Ejemplo**:
```typescript
test('registro debe ser < 50ms', async () => {
  const start = performance.now();
  await registerUser(validUser);
  const duration = performance.now() - start;
  expect(duration).toBeLessThan(50);
});
```

#### 2. Load Testing (k6)
**Uso**: Pruebas de carga, stress testing, escenarios complejos
**Herramienta**: k6 (https://k6.io/)
**Instalación**: 
```bash
npm install --save-dev k6 @types/k6
```

**Ejemplo** (`tests/performance/load-scenarios.perf.test.ts`):
```typescript
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '30s', target: 10 },   // Warm up
    { duration: '1m', target: 50 },    // Carga media
    { duration: '2m', target: 100 },   // Carga pico
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<100'],  // 95% < 100ms
    errors: ['rate<0.01'],             // < 1% errores
  },
};

export default function () {
  const res = http.post('http://localhost:3000/api/users/register', {
    email: `test@${Date.now()}.com`,
    password: 'SecurePass123!',
    name: 'Load Test User'
  });

  check(res, {
    'status is 200 or 201': (r) => [200, 201].includes(r.status),
  });
}
```

#### 3. Quick Load Testing (autocannon)
**Uso**: Pruebas rápidas de throughput durante desarrollo
**Herramienta**: autocannon
**Instalación**:
```bash
npm install --save-dev autocannon @types/autocannon
```

**Ejemplo**:
```bash
autocannon -c 10 -d 30 -m POST -H Content-Type=application/json \
  -b '{"email":"test@test.com","password":"Pass123!","name":"Test"}' \
  http://localhost:3000/api/users/register
```

#### 4. Memory Leak Detection (Script Dedicado)
**Uso**: Detección de fugas de memoria en procesos aislados
**Herramienta**: Node.js native + worker_threads
**Ejemplo** (`tests/performance/memory-leak.detector.test.ts`):
```typescript
import { Worker } from 'worker_threads';
import { monitorEventLoopDelay } from 'perf_hooks';

// Ejecutar en proceso aislado sin Jest overhead
```

### Thresholds Definidos

#### Response Time Thresholds

| Percentil | Threshold | Justificación |
|-----------|-----------|---------------|
| p50       | < 50ms    | Experiencia óptima para usuario individual |
| p95       | < 100ms   | Límite superior aceptable para 95% de requests |
| p99       | < 200ms   | Casos extremos, aún dentro de lo aceptable |
| p99.9     | < 500ms   | Casos excepcionales bajo carga extrema |

#### Throughput Thresholds

| Escenario | Requests/segundo | Usuarios Concurrentes |
|-----------|------------------|----------------------|
| Baja carga | 100+ req/s | 10 usuarios |
| Media carga | 500+ req/s | 50 usuarios |
| Alta carga | 1000+ req/s | 100 usuarios |
| Stress test | Determinar punto de quiebre | Hasta fallo |

#### Error Rate Thresholds

| Métrica | Threshold | Acción |
|---------|-----------|--------|
| Error rate normal | < 0.1% | ✅ OK |
| Error rate bajo carga | < 1% | ⚠️ Monitorear |
| Error rate crítico | > 5% | 🔴 Investigar inmediatamente |

#### Memory Thresholds

| Métrica | Threshold | Acción |
|---------|-----------|--------|
| Heap growth por request | < 1KB | ✅ OK |
| Memory leak detectado | > 10MB en 1 hora | 🔴 Investigar |
| GC frequency | < 1 vez por segundo | ✅ OK |

### Arquitectura de Tests de Performance

```
tests/
├── performance/
│   ├── load-scenarios.perf.test.ts    # k6 scenarios
│   ├── memory-leak.detector.test.ts   # Memory profiling
│   ├── stress-test.script.js          # Stress testing
│   └── helpers/
│       ├── performance-monitor.ts     # Utilidades de medición
│       └── threshold-config.ts        # Configuración de thresholds
```

### Integración con CI/CD

```yaml
# .github/workflows/performance.yml
jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install k6
        run: npm install -g k6
      - name: Run performance tests
        run: k6 run tests/performance/load-scenarios.perf.test.ts
      - name: Upload results
        uses: actions/upload-artifact@v3
        with:
          name: k6-results
          path: k6-results.json
```

### Configuración de Thresholds

Los thresholds deben ser configurables vía environment variables o config files:

```typescript
// tests/helpers/threshold-config.ts
export const PERFORMANCE_THRESHOLDS = {
  p50: parseInt(process.env.PERF_P50_THRESHOLD || '50'),
  p95: parseInt(process.env.PERF_P95_THRESHOLD || '100'),
  p99: parseInt(process.env.PERF_P99_THRESHOLD || '200'),
  errorRate: parseFloat(process.env.PERF_ERROR_RATE || '0.01'),
};
```

## Consequences

### Positivas
- ✅ Herramientas especializadas para cada tipo de test
- ✅ Thresholds claros y medibles
- ✅ Detección temprana de regresiones
- ✅ Integración con CI/CD
- ✅ Memoria y performance monitoreadas separadamente

### Negativas
- ⚠️ Curva de aprendizaje para k6
- ⚠️ Requiere configuración adicional en CI/CD
- ⚠️ Tests de performance más lentos que tests unitarios

### Riesgos Mitigados
- 🔒 Falsos positivos: Mitigado con múltiples herramientas
- 🔒 Thresholds arbitrarios: Mitigado con configuración basada en datos reales
- 🔒 Impacto en CI/CD: Mitigado con ejecución condicional (solo en main/PRs críticos)

## Compliance

Este ADR cumple con:
- ✅ ADR-003: Test Isolation Strategy
- ✅ ADR-004: Integration Test Structure Standards
- ✅ Clean Architecture principles
- ✅ Industry best practices for performance testing

## References

- k6 Documentation: https://k6.io/docs/
- autocannon: https://github.com/mcollina/autocannon
- Node.js Performance Hooks: https://nodejs.org/api/perf_hooks.html
- Google Web Vitals: https://web.dev/vitals/

## Appendix: Comandos Útiles

### Ejecutar load test con k6
```bash
k6 run tests/performance/load-scenarios.perf.test.ts
```

### Ejecutar quick benchmark con autocannon
```bash
autocannon -c 50 -d 60 http://localhost:3000/api/users/register
```

### Generar reporte detallado
```bash
k6 run --out json=results.json tests/performance/load-scenarios.perf.test.ts
k6 inspect results.json
```

### Comparar resultados históricos
```bash
k6 compare results-current.json results-previous.json
```
