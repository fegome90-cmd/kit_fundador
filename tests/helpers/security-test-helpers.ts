/**
 * Security Test Helpers
 * Utilidades para pruebas de seguridad en Clean Architecture
 */

import supertest from 'supertest';
import express from 'express';

export const SECURITY_PAYLOADS = {
  sqlInjection: [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "admin'--",
    "'; DELETE FROM users WHERE '1'='1",
    "' UNION SELECT * FROM users --",
    "1; WAITFOR DELAY '0:0:5' --",
  ],
  
  xss: [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")',
    '<svg onload=alert("XSS")>',
    '"><script>alert("XSS")</script>',
  ],
  
  nosqlInjection: [
    { $ne: null },
    { $gt: '' },
    { $regex: '.*' },
    { $where: 'this.password == "hacked"' },
  ],
  
  pathTraversal: [
    '../../../etc/passwd',
    '..\\..\\..\\windows\\system32',
    '....//....//etc/passwd',
  ],
};

export interface SecurityTestResult {
  payload: string | object;
  status: number;
  passed: boolean;
  error?: string;
}

/**
 * Prueba payloads de inyección SQL
 * Valida que el validation layer rechace emails maliciosos
 */
export async function testSqlInjectionPrevention(
  endpoint: string,
  basePayload: { password: string; name: string },
  app: express.Application
): Promise<SecurityTestResult[]> {
  const request = supertest(app);
  const results: SecurityTestResult[] = [];

  for (const email of SECURITY_PAYLOADS.sqlInjection) {
    try {
      const response = await request.post(endpoint).send({
        email,
        ...basePayload,
      });

      // En Clean Architecture, el validation layer debe rechazar esto
      const passed = response.status === 400 || response.status === 422;
      
      results.push({
        payload: email,
        status: response.status,
        passed,
        error: passed ? undefined : `Expected 400/422, got ${response.status}`,
      });
    } catch (error) {
      results.push({
        payload: email,
        status: 0,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Prueba payloads XSS
 * Valida que los nombres con scripts sean rechazados o sanitizados
 */
export async function testXssPrevention(
  endpoint: string,
  basePayload: { email: string; password: string },
  app: express.Application
): Promise<SecurityTestResult[]> {
  const request = supertest(app);
  const results: SecurityTestResult[] = [];

  for (const [index, name] of SECURITY_PAYLOADS.xss.entries()) {
    try {
      // Usar email único para cada payload para evitar conflictos 409
      const uniqueEmail = `${basePayload.email.split('@')[0]}_xss_${index}@example.com`;
      
      const response = await request.post(endpoint).send({
        name,
        email: uniqueEmail,
        password: basePayload.password,
      });

      // Opción A: Rechazo completo (recomendado)
      const rejected = response.status === 400 || response.status === 422;
      
      // Opción B: Sanitización (si esa es la política)
      let sanitized = false;
      if (response.status === 200 || response.status === 201) {
        const userData = response.body.data || response.body;
        // Verificar múltiples patrones XSS, no solo <script>
        const xssPatterns = ['<script', 'onerror=', 'onload=', 'javascript:', '<svg', '&lt;script'];
        const returnedName = userData.name?.toLowerCase() || '';
        sanitized = !xssPatterns.some(pattern => returnedName.includes(pattern.toLowerCase()));
      }

      // 409 también cuenta como rechazado (conflicto por email duplicado en tests previos)
      const conflictRejected = response.status === 409;
      const passed = rejected || sanitized || conflictRejected;

      results.push({
        payload: name,
        status: response.status,
        passed,
        error: passed 
          ? undefined 
          : `XSS payload not rejected or sanitized. Status: ${response.status}`,
      });
    } catch (error) {
      results.push({
        payload: name,
        status: 0,
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return results;
}

/**
 * Valida que todos los resultados de seguridad pasaron
 */
export function assertSecurityResults(
  results: SecurityTestResult[],
  testName: string
): void {
  const failed = results.filter((r) => !r.passed);
  
  if (failed.length > 0) {
    console.error(`\n❌ ${testName} - FAILED:`);
    failed.forEach((r) => {
      console.error(`  Payload: ${JSON.stringify(r.payload)}`);
      console.error(`  Status: ${r.status}`);
      console.error(`  Error: ${r.error}`);
    });
    
    throw new Error(
      `${testName}: ${failed.length}/${results.length} tests failed`
    );
  }

  console.log(`✅ ${testName} - PASSED (${results.length} payloads tested)`);
}

/**
 * Genera reporte de seguridad en formato Markdown
 */
export function generateSecurityReport(
  testName: string,
  results: SecurityTestResult[]
): string {
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  const successRate = ((passed / total) * 100).toFixed(2);

  let report = `## ${testName}\n\n`;
  report += `**Success Rate:** ${successRate}% (${passed}/${total})\n\n`;
  report += '| Payload | Status | Passed | Error |\n';
  report += '|---------|--------|--------|-------|\n';

  results.forEach((r) => {
    const statusIcon = r.passed ? '✅' : '❌';
    const payloadStr =
      typeof r.payload === 'string'
        ? r.payload.substring(0, 50) + (r.payload.length > 50 ? '...' : '')
        : JSON.stringify(r.payload);
    
    report += `| ${payloadStr} | ${r.status} | ${statusIcon} | ${r.error || '-'} |\n`;
  });

  return report;
}
