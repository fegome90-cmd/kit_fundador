/**
 * Performance Monitor Helper
 * Utilidades para pruebas de rendimiento y detección de memory leaks
 */

import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  responseTime: {
    p50: number;
    p95: number;
    p99: number;
    avg: number;
    min: number;
    max: number;
  };
  throughput: {
    requestsPerSecond: number;
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
  };
  errors: {
    rate: number;
    byStatus: Record<number, number>;
  };
  memory?: {
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
}

export interface LoadTestConfig {
  stages: Array<{
    duration: string;
    target: number;
  }>;
  thresholds: {
    p95?: number;
    p99?: number;
    errorRate?: number;
  };
}

/**
 * Calcula percentiles de un array de números
 */
export function percentile(arr: number[], p: number): number {
  if (arr.length === 0) return 0;
  
  const sorted = arr.slice().sort((a, b) => a - b);
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Calcula métricas de rendimiento desde tiempos de respuesta
 */
export function calculatePerformanceMetrics(
  responseTimes: number[],
  totalRequests: number,
  successfulRequests: number,
  testDurationSeconds: number,
  errorStatuses: number[] = []
): PerformanceMetrics {
  const failedRequests = totalRequests - successfulRequests;
  
  // Response time metrics
  const p50 = percentile(responseTimes, 50);
  const p95 = percentile(responseTimes, 95);
  const p99 = percentile(responseTimes, 99);
  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length || 0;
  const min = Math.min(...responseTimes);
  const max = Math.max(...responseTimes);

  // Error metrics
  const errorRate = failedRequests / totalRequests || 0;
  const errorsByStatus: Record<number, number> = {};
  errorStatuses.forEach((status) => {
    errorsByStatus[status] = (errorsByStatus[status] || 0) + 1;
  });

  // Throughput metrics
  const requestsPerSecond = totalRequests / testDurationSeconds;

  return {
    responseTime: { p50, p95, p99, avg, min, max },
    throughput: {
      requestsPerSecond,
      totalRequests,
      successfulRequests,
      failedRequests,
    },
    errors: {
      rate: errorRate,
      byStatus: errorsByStatus,
    },
  };
}

/**
 * Monitorea uso de memoria en tiempo real
 */
export class MemoryMonitor extends EventEmitter {
  private intervalId?: NodeJS.Timeout;
  private samples: Array<NodeJS.MemoryUsage> = [];
  private baseline?: NodeJS.MemoryUsage;

  start(sampleIntervalMs: number = 100): void {
    this.baseline = process.memoryUsage();
    this.samples = [];

    this.intervalId = setInterval(() => {
      const usage = process.memoryUsage();
      this.samples.push(usage);
      this.emit('sample', usage);
    }, sampleIntervalMs);
  }

  stop(): NodeJS.MemoryUsage {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }

    const finalUsage = process.memoryUsage();
    const leaked = this.detectLeak();

    if (leaked) {
      this.emit('leak-detected', leaked);
    }

    return finalUsage;
  }

  detectLeak(): { initial: number; final: number; growth: number } | null {
    if (this.samples.length < 2 || !this.baseline) return null;

    const initialHeap = this.baseline.heapUsed;
    const finalHeap = this.samples[this.samples.length - 1].heapUsed;
    const growth = finalHeap - initialHeap;
    const growthRate = growth / initialHeap;

    // Considerar leak si creció más del 20%
    if (growthRate > 0.2) {
      return {
        initial: initialHeap,
        final: finalHeap,
        growth,
      };
    }

    return null;
  }

  getReport(): {
    baseline: NodeJS.MemoryUsage;
    peak: NodeJS.MemoryUsage;
    final: NodeJS.MemoryUsage;
    trend: 'stable' | 'growing' | 'shrinking';
  } {
    if (this.samples.length === 0 || !this.baseline) {
      throw new Error('No samples collected. Call start() first.');
    }

    const peak = this.samples.reduce((max, sample) => 
      sample.heapUsed > max.heapUsed ? sample : max
    );

    const final = this.samples[this.samples.length - 1];
    const trend = final.heapUsed > this.baseline.heapUsed * 1.1 
      ? 'growing' 
      : final.heapUsed < this.baseline.heapUsed * 0.9 
        ? 'shrinking' 
        : 'stable';

    return {
      baseline: this.baseline,
      peak,
      final,
      trend,
    };
  }
}

/**
 * Genera reporte de rendimiento en formato Markdown
 */
export function generatePerformanceReport(
  metrics: PerformanceMetrics,
  config?: LoadTestConfig
): string {
  let report = '## Performance Report\n\n';

  // Thresholds validation
  if (config?.thresholds) {
    report += '### Threshold Validation\n\n';
    
    if (config.thresholds.p95) {
      const passed = metrics.responseTime.p95 <= config.thresholds.p95;
      report += `- **p95 Response Time:** ${metrics.responseTime.p95.toFixed(2)}ms `;
      report += passed ? '✅ PASS' : `❌ FAIL (threshold: ${config.thresholds.p95}ms)`;
      report += '\n';
    }

    if (config.thresholds.p99) {
      const passed = metrics.responseTime.p99 <= config.thresholds.p99;
      report += `- **p99 Response Time:** ${metrics.responseTime.p99.toFixed(2)}ms `;
      report += passed ? '✅ PASS' : `❌ FAIL (threshold: ${config.thresholds.p99}ms)`;
      report += '\n';
    }

    if (config.thresholds.errorRate) {
      const passed = metrics.errors.rate <= config.thresholds.errorRate;
      report += `- **Error Rate:** ${(metrics.errors.rate * 100).toFixed(2)}% `;
      report += passed ? '✅ PASS' : `❌ FAIL (threshold: ${config.thresholds.errorRate * 100}%)`;
      report += '\n';
    }

    report += '\n';
  }

  // Response time details
  report += '### Response Time\n\n';
  report += '| Metric | Value |\n';
  report += '|--------|-------|\n';
  report += `| p50 | ${metrics.responseTime.p50.toFixed(2)} ms |\n`;
  report += `| p95 | ${metrics.responseTime.p95.toFixed(2)} ms |\n`;
  report += `| p99 | ${metrics.responseTime.p99.toFixed(2)} ms |\n`;
  report += `| Average | ${metrics.responseTime.avg.toFixed(2)} ms |\n`;
  report += `| Min | ${metrics.responseTime.min.toFixed(2)} ms |\n`;
  report += `| Max | ${metrics.responseTime.max.toFixed(2)} ms |\n`;
  report += '\n';

  // Throughput details
  report += '### Throughput\n\n';
  report += '| Metric | Value |\n';
  report += '|--------|-------|\n';
  report += `| Requests/sec | ${metrics.throughput.requestsPerSecond.toFixed(2)} |\n`;
  report += `| Total Requests | ${metrics.throughput.totalRequests} |\n`;
  report += `| Successful | ${metrics.throughput.successfulRequests} |\n`;
  report += `| Failed | ${metrics.throughput.failedRequests} |\n`;
  report += '\n';

  // Error details
  report += '### Errors\n\n';
  report += `- **Error Rate:** ${(metrics.errors.rate * 100).toFixed(2)}%\n`;
  
  if (Object.keys(metrics.errors.byStatus).length > 0) {
    report += '- **By Status Code:**\n';
    Object.entries(metrics.errors.byStatus).forEach(([status, count]) => {
      report += `  - ${status}: ${count}\n`;
    });
  }
  report += '\n';

  return report;
}

/**
 * Valida métricas contra thresholds configurados
 */
export function validatePerformanceThresholds(
  metrics: PerformanceMetrics,
  thresholds: {
    p50?: number;
    p95?: number;
    p99?: number;
    errorRate?: number;
    minThroughput?: number;
  }
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];

  if (thresholds.p50 && metrics.responseTime.p50 > thresholds.p50) {
    failures.push(`p50 ${metrics.responseTime.p50.toFixed(2)}ms > ${thresholds.p50}ms`);
  }

  if (thresholds.p95 && metrics.responseTime.p95 > thresholds.p95) {
    failures.push(`p95 ${metrics.responseTime.p95.toFixed(2)}ms > ${thresholds.p95}ms`);
  }

  if (thresholds.p99 && metrics.responseTime.p99 > thresholds.p99) {
    failures.push(`p99 ${metrics.responseTime.p99.toFixed(2)}ms > ${thresholds.p99}ms`);
  }

  if (thresholds.errorRate && metrics.errors.rate > thresholds.errorRate) {
    failures.push(
      `Error rate ${(metrics.errors.rate * 100).toFixed(2)}% > ${thresholds.errorRate * 100}%`
    );
  }

  if (
    thresholds.minThroughput &&
    metrics.throughput.requestsPerSecond < thresholds.minThroughput
  ) {
    failures.push(
      `Throughput ${metrics.throughput.requestsPerSecond.toFixed(2)} req/s < ${thresholds.minThroughput} req/s`
    );
  }

  return {
    passed: failures.length === 0,
    failures,
  };
}
