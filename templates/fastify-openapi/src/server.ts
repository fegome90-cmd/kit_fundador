import { buildApp } from './app.js';
import { listen } from './runtime.js';
import { registerSwagger, registerSwaggerUi } from './plugins/api-docs.js';

const flag = process.env.DOCS_ENABLED ?? '0';
if (flag !== '0' && flag !== '1') {
  throw new Error('DOCS_ENABLED must be 0 or 1');
}

const app = buildApp(flag === '1'
  ? { beforeRoutes: registerSwagger, afterRoutes: registerSwaggerUi }
  : {});
await listen(app);
