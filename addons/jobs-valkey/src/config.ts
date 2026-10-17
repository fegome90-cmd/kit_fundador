export interface JobsValkeyOptions {
  /** redis:// is only permitted for loopback; other hosts require rediss://. */
  valkeyUrl: string;
  queueName?: string;
}

export interface ResolvedJobsConfig {
  url: string;
  queueName: string;
}

export function resolveJobsConfig(options: JobsValkeyOptions): ResolvedJobsConfig {
  if (!options || typeof options.valkeyUrl !== 'string') {
    throw new Error('Valid Valkey URL required');
  }
  let parsed: URL;
  try {
    parsed = new URL(options.valkeyUrl);
  } catch {
    throw new Error('Invalid Valkey URL');
  }
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (!['redis:', 'rediss:'].includes(parsed.protocol) ||
      !parsed.hostname || (parsed.protocol === 'redis:' && !loopback) ||
      parsed.search || parsed.hash || !['', '/', '/0'].includes(parsed.pathname) ||
      (parsed.port && (!Number.isInteger(Number(parsed.port)) || Number(parsed.port) < 1 || Number(parsed.port) > 65535))) {
    throw new Error('Valkey URL requires TLS outside loopback and no URL options');
  }
  const queueName = options.queueName ?? 'lego-digest-v1';
  if (!/^[a-z][a-z0-9-]{2,63}$/.test(queueName)) {
    throw new Error('Invalid Valkey queue name');
  }
  return { url: parsed.href, queueName };
}
