/** R4-A0 configuration only. Importing this module never starts telemetry. */
export type ObservabilityConfiguration =
  | Readonly<{ enabled: false }>
  | Readonly<{
      enabled: true;
      serviceName: string;
      /** OTLP base origin, without signal-specific paths or credentials. */
      endpoint: string;
      sampleRatio: number;
      exportTimeoutMs: number;
      shutdownTimeoutMs: number;
    }>;

const disabled: ObservabilityConfiguration = Object.freeze({ enabled: false });
const allowedKeys = new Set([
  'enabled', 'serviceName', 'endpoint', 'sampleRatio',
  'exportTimeoutMs', 'shutdownTimeoutMs',
]);

/**
 * Validate an explicit OTLP base origin before URL normalization removes syntax.
 * Plain HTTP is restricted to normalized loopback hosts; this performs no DNS,
 * connection, or authorization checks. Rejections never expose the input URL.
 */
function endpointOrigin(value: unknown): string {
  const invalid = 'Invalid observability endpoint';
  // Validate the raw shape before URL normalization can erase path/query markers.
  if (typeof value !== 'string' || !/^https?:\/\/[^\s\\/?#@]+\/?$/i.test(value)) {
    throw new Error(invalid);
  }
  let url: URL;
  try { url = new URL(value); }
  catch { throw new Error(invalid); }

  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname ||
      (url.protocol === 'http:' && !loopback) || url.username || url.password ||
      url.pathname !== '/' || url.search || url.hash || url.port === '0') {
    throw new Error(invalid);
  }
  return url.origin;
}

/**
 * Resolve an optional timeout to its default or validate integer milliseconds
 * within [100, maximum]. `field` is an internal label, not caller-supplied data.
 */
function boundedInteger(
  value: unknown, field: string, fallback: number, maximum: number,
): number {
  if (value === undefined) return fallback;
  if (typeof value !== 'number' || !Number.isSafeInteger(value) ||
      value < 100 || value > maximum) {
    throw new Error('Invalid observability ' + field);
  }
  return value;
}

/**
 * Pure, explicit configuration resolution: no environment reads, SDK creation,
 * network connections, timers, or process handlers. OFF ignores inactive fields.
 * Timeout fields are validated budgets, not implemented runtime cancellation.
 */
export function resolveObservabilityOptions(input?: unknown): ObservabilityConfiguration {
  if (input === undefined) return disabled;
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Invalid observability options');
  }
  const options = input as Record<string, unknown>;
  // Configuration must be explicit; inherited values cannot enable or tune it.
  const own = (key: string): unknown => Object.hasOwn(options, key) ? options[key] : undefined;
  const enabled = own('enabled');
  if (enabled !== undefined && typeof enabled !== 'boolean') {
    throw new Error('Invalid observability enabled flag');
  }
  if (enabled !== true) return disabled;
  if (Object.keys(options).some((key) => !allowedKeys.has(key))) {
    throw new Error('Unknown observability option');
  }
  const serviceName = own('serviceName');
  if (typeof serviceName !== 'string' || !/^[a-z][a-z0-9._-]{2,62}$/.test(serviceName)) {
    throw new Error('Invalid observability serviceName');
  }
  const endpoint = endpointOrigin(own('endpoint'));
  const requestedRatio = own('sampleRatio');
  const sampleRatio = requestedRatio === undefined ? 1 : requestedRatio;
  if (typeof sampleRatio !== 'number' || !Number.isFinite(sampleRatio) ||
      sampleRatio < 0 || sampleRatio > 1) {
    throw new Error('Invalid observability sampleRatio');
  }
  const exportTimeoutMs = boundedInteger(own('exportTimeoutMs'), 'exportTimeoutMs', 1000, 5000);
  const shutdownTimeoutMs = boundedInteger(own('shutdownTimeoutMs'), 'shutdownTimeoutMs', 2000, 10000);
  if (shutdownTimeoutMs < exportTimeoutMs) {
    throw new Error('Observability shutdown timeout must cover export timeout');
  }
  return Object.freeze({ enabled: true, serviceName, endpoint, sampleRatio,
    exportTimeoutMs, shutdownTimeoutMs });
}
