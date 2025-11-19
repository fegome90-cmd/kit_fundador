/**
 * Swagger UI Configuration
 * API documentation setup for the HTTP server
 */

import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Kit Fundador API',
      version: '1.0.0',
      description: `
        User Registration API for the Kit Fundador project.
        
        This API provides endpoints for user account registration with comprehensive
        validation, security features, and standardized error handling.
        
        ## Features
        - User account creation with email validation
        - Role-based access control (user/admin)
        - Comprehensive input validation and sanitization
        - Duplicate email prevention
        - Security headers and middleware
        - Structured error responses
        
        ## Authentication
        Currently, no authentication is required for user registration.
        Future versions will include authentication and authorization features.
      `,
      contact: {
        name: 'Kit Fundador Team',
        email: 'dev@kitfundador.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.kitfundador.com',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'User Registration',
        description: 'Endpoints for user account creation and management',
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API key for authentication (future use)',
        },
      },
    },
    security: [
      {
        ApiKeyAuth: [],
      },
    ],
  },
  apis: [
    './src/infrastructure/http/routes/*.ts',
    './src/infrastructure/http/controllers/*.ts',
    './src/infrastructure/docs/api/openapi.yaml',
  ],
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
