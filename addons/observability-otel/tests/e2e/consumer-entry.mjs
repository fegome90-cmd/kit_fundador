// Test-only consumer, copied next to a real compiled Core in a temporary project.
// A0 resolves configuration only: even ON does not instantiate an OTel SDK.
import { resolveObservabilityOptions } from './r4-config.js';

let config;
try {
  const input = process.env.R4_E2E_OPTIONS === undefined
    ? undefined : JSON.parse(process.env.R4_E2E_OPTIONS);
  config = resolveObservabilityOptions(input);
} catch {
  // Do not serialize the rejected config or an arbitrary exception.
  process.stderr.write('R4_CONFIG_REJECTED\n');
  process.exitCode = 2;
}
if (config !== undefined) {
  process.stdout.write(`R4_CONFIG_ACCEPTED ${JSON.stringify({ enabled: config.enabled })}\n`);
  // Validate before importing the application or opening its listener.
  const { buildApp } = await import('./dist/app.js');
  const { listen } = await import('./dist/runtime.js');
  await listen(buildApp());
}
