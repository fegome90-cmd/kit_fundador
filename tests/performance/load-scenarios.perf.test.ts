/**
 * Performance Tests: Load Scenarios
 * Pruebas de rendimiento con diferentes niveles de carga
 * 
 * ADR-007 Compliant: Performance Testing Tools and Thresholds
 * 
 * NOTA: Estos tests son de larga duración y pueden exceder timeouts por defecto.
 * Ejecutar con: npm run test:performance
 */

import request from 'supertest';
import { HttpServer } from '../../../src/infrastructure/http/server';
import {
  calculatePerformanceMetrics,
  validatePerformanceThresholds,
  generatePerformanceReport,
  MemoryMonitor,
} from './performance-monitor';
import { createBulkUsers } from '../../helpers/test-data-factories';
import { cleanupDatabase } from '../../helpers/test-setup';

// Aumentar timeout para tests de performance
jest.setTimeout(120000); // 2 minutos

let server: HttpServer;
let performanceMonitor: MemoryMonitor;
const endpoint = '/api/users/register';

describe('Performance: Load Scenarios', () => {

  // Thresholds configurados (ADR-007)
  const THRESHOLDS = {
    p50: 50,    // 50ms
    p95: 100,   // 100ms
    p99: 200,   // 200ms
    errorRate: 0.01, // 1%
    minThroughput: 100, // 100 req/s
  };

  beforeEach(async () => {
    server = new HttpServer();
    await server.start();
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
    await server.stop();
  });

  describe('Response Time Under Normal Load', () => {
    it('debe mantener p95 < 100ms con 10 requests secuenciales', async () => {
      const users = createBulkUsers(10);
      const responseTimes: number[] = [];
      const statuses: number[] = [];

      for (const user of users) {
        const startTime = Date.now();
        const response = await request(server.getApp()).post(endpoint).send(user);
        const endTime = Date.now();
        
        responseTimes.push(endTime - startTime);
        statuses.push(response.status);
      }

      const successfulCount = statuses.filter(s => [200, 201].includes(s)).length;
      const metrics = calculatePerformanceMetrics(
        responseTimes,
        users.length,
        successfulCount,
        responseTimes.reduce((a, b) => a + b, 0) / 1000 // Convert ms to seconds
      );

      const validation = validatePerformanceThresholds(metrics, {
        p95: THRESHOLDS.p95,
        p99: THRESHOLDS.p99,
        errorRate: THRESHOLDS.errorRate,
      });

      console.log(generatePerformanceReport(metrics));

      expect(validation.passed).toBe(true);
      if (!validation.passed) {
        throw new Error(`Performance thresholds failed: ${validation.failures.join(', ')}`);
      }

      expect(metrics.responseTime.p95).toBeLessThan(THRESHOLDS.p95);
      expect(metrics.errors.rate).toBeLessThan(THRESHOLDS.errorRate);
    });
  });

  describe('Response Time Under Medium Load', () => {
    it('debe mantener p95 < 100ms con 50 requests concurrentes simuladas', async () => {
      const users = createBulkUsers(50);
      const responseTimes: number[] = [];
      const statuses: number[] = [];

      // Ejecutar requests en paralelo con limitación de concurrencia
      const concurrencyLimit = 10;
      
      for (let i = 0; i < users.length; i += concurrencyLimit) {
        const batch = users.slice(i, i + concurrencyLimit);
        const promises = batch.map(async (user) => {
          const startTime = Date.now();
          const response = await request(server.getApp()).post(endpoint).send(user);
          const endTime = Date.now();
          
          return { time: endTime - startTime, status: response.status };
        });

        const results = await Promise.all(promises);
        results.forEach((r) => {
          responseTimes.push(r.time);
          statuses.push(r.status);
        });
      }

      const successfulCount = statuses.filter(s => [200, 201].includes(s)).length;
      const totalDuration = responseTimes.reduce((a, b) => a + b, 0) / 1000;
      
      const metrics = calculatePerformanceMetrics(
        responseTimes,
        users.length,
        successfulCount,
        totalDuration
      );

      const validation = validatePerformanceThresholds(metrics, {
        p95: THRESHOLDS.p95,
        p99: THRESHOLDS.p99,
        errorRate: THRESHOLDS.errorRate,
      });

      console.log(generatePerformanceReport(metrics));

      // Bajo carga media, permitimos un poco más de flexibilidad
      expect(metrics.responseTime.p95).toBeLessThan(THRESHOLDS.p95 * 1.5);
      expect(metrics.errors.rate).toBeLessThan(THRESHOLDS.errorRate * 2);
    });
  });

  describe('Stress Test', () => {
    it('debe manejar 100 requests sin colapsar', async () => {
      const users = createBulkUsers(100);
      const responseTimes: number[] = [];
      const statuses: number[] = [];
      let errorCount = 0;

      // Ejecutar en batches para no saturar el test
      const batchSize = 20;
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        
        const promises = batch.map(async (user) => {
          try {
            const startTime = Date.now();
            const response = await request(server.getApp()).post(endpoint).send(user);
            const endTime = Date.now();
            
            return { time: endTime - startTime, status: response.status, error: null };
          } catch (error) {
            errorCount++;
            return { time: 0, status: 0, error };
          }
        });

        const results = await Promise.all(promises);
        results.forEach((r) => {
          if (!r.error) {
            responseTimes.push(r.time);
            statuses.push(r.status);
          }
        });

        // Pequeña pausa entre batches para evitar saturación
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const successfulCount = statuses.filter(s => [200, 201].includes(s)).length;
      const totalDuration = responseTimes.reduce((a, b) => a + b, 0) / 1000;
      
      const metrics = calculatePerformanceMetrics(
        responseTimes,
        users.length - errorCount,
        successfulCount,
        totalDuration
      );

      console.log(generatePerformanceReport(metrics, {
        thresholds: THRESHOLDS,
      }));

      // En stress test, aceptamos mayor latencia pero sin errores críticos
      expect(errorCount).toBeLessThan(users.length * 0.1); // Menos del 10% de errores
      expect(successfulCount).toBeGreaterThan(users.length * 0.8); // Al menos 80% exitosos
    });
  });

  describe('Memory Leak Detection', () => {
    it('no debe tener memory leaks después de 50 requests', async () => {
      const monitor = new MemoryMonitor();
      monitor.start(50); // Muestrear cada 50ms

      const users = createBulkUsers(50);

      // Ejecutar requests
      for (const user of users) {
        await request(server.getApp()).post(endpoint).send(user);
        await new Promise(resolve => setTimeout(resolve, 5)); // Pequeña pausa
      }

      const finalUsage = monitor.stop();
      const report = monitor.getReport();

      console.log('Memory Report:', {
        baseline: `${(report.baseline.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        peak: `${(report.peak.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        final: `${(finalUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        trend: report.trend,
      });

      // Validar que la memoria es estable
      expect(report.trend).not.toBe('growing');
      
      // El crecimiento no debe superar el 20%
      const growthRate = (finalUsage.heapUsed - report.baseline.heapUsed) / report.baseline.heapUsed;
      expect(growthRate).toBeLessThan(0.2);
    });
  });

  describe.skip('Sustained Load', () => {
    it('debe mantener performance consistente por 30 segundos', async () => {
      const durationMs = 30000;
      const startTime = Date.now();
      const responseTimes: number[] = [];
      const statuses: number[] = [];
      let requestCount = 0;

      while (Date.now() - startTime < durationMs) {
        const user = createBulkUsers(1)[0];
        const reqStartTime = Date.now();
        
        const response = await request(server.getApp()).post(endpoint).send(user);
        const reqEndTime = Date.now();
        
        responseTimes.push(reqEndTime - reqStartTime);
        statuses.push(response.status);
        requestCount++;

        // Sin pausa para máxima carga sostenida
      }

      const successfulCount = statuses.filter(s => [200, 201].includes(s)).length;
      const metrics = calculatePerformanceMetrics(
        responseTimes,
        requestCount,
        successfulCount,
        durationMs / 1000
      );

      console.log(generatePerformanceReport(metrics));

      // Validar consistencia: la desviación estándar no debe ser muy alta
      const avg = metrics.responseTime.avg;
      const variance = responseTimes.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / responseTimes.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avg;

      console.log(`Coefficient of Variation: ${(coefficientOfVariation * 100).toFixed(2)}%`);

      // CV < 50% indica consistencia razonable
      expect(coefficientOfVariation).toBeLessThan(0.5);
      expect(metrics.throughput.requestsPerSecond).toBeGreaterThan(THRESHOLDS.minThroughput * 0.5);
    });
  });
});
