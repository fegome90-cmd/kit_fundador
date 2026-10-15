import type { FastifyInstance } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';

/** Swagger MUST register before routes or it cannot discover them. */
export function registerSwagger(app: FastifyInstance): void {
  app.register(swagger, {
    openapi: { info: { title: 'Kit Fundador API', version: '0.1.0' } },
  });
}

/** Swagger UI is opt-in, and must follow registration of API routes. */
export function registerSwaggerUi(app: FastifyInstance): void {
  app.register(swaggerUI, { routePrefix: '/docs' });
}
