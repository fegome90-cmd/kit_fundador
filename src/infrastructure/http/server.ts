/**
 * HTTP Server Configuration
 * Express server setup with middleware and routing
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createUserRoutes } from './routes/userRoutes';
import { specs, swaggerUi } from './swagger';

export interface ServerConfig {
  port: number;
  environment: string;
}

export class HttpServer {
  private readonly app: express.Application;
  private readonly config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupSwagger();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.setupBodyParsing();
    this.setupSecurityMiddleware();
    this.setupLogging();
  }

  private setupSwagger(): void {
    // Serve Swagger UI at /api-docs and handle the redirect properly
    this.app.get('/api-docs', swaggerUi.setup(specs));
    this.app.use('/api-docs', swaggerUi.serve);
  }

  private setupSecurityMiddleware(): void {
    this.app.use(helmet());
    this.app.use(cors());
  }

  private setupBodyParsing(): void {
    // Enhanced JSON parsing with better error handling
    this.app.use(
      express.json({
        limit: '10mb',
        strict: false,
        type: ['application/json'],
      })
    );
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private setupLogging(): void {
    this.app.use((req, res, next) => this.requestLogger(req, res, next));
  }

  private setupRoutes(): void {
    this.setupApiRoutes();
    this.setupHealthCheck();
    this.setup404Handler();
  }

  private setupApiRoutes(): void {
    this.app.use('/api/users', createUserRoutes());
  }

  private setupHealthCheck(): void {
    this.app.get('/health', (req, res) => this.healthCheckHandler(req, res));
  }

  private setup404Handler(): void {
    this.app.use('*', (req, res) => this.notFoundHandler(req, res));
  }

  private setupErrorHandling(): void {
    this.app.use((error: Error, req: express.Request, res: express.Response) =>
      this.errorHandler(error, req, res)
    );
  }

  private requestLogger(
    req: express.Request,
    _res: express.Response,
    next: express.NextFunction
  ): void {
    const timestamp = new Date().toISOString();
    process.stdout.write(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}\n`);
    next();
  }

  private healthCheckHandler(_req: express.Request, res: express.Response): void {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.config.environment,
    });
  }

  private notFoundHandler(req: express.Request, res: express.Response): void {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.originalUrl,
    });
  }

  private errorHandler(error: Error, req: express.Request, res: express.Response): void {
    const timestamp = new Date().toISOString();

    this.logError(req, error, timestamp);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      timestamp,
    });
  }

  private logError(req: express.Request, error: Error, timestamp: string): void {
    const errorInfo = {
      timestamp,
      method: req.method,
      path: req.path,
      error: error.message,
      hasStack: !!error.stack,
    };

    process.stderr.write(JSON.stringify(errorInfo) + '\n');
  }

  public start(): void {
    const port = this.config.port;

    this.app.listen(port, () => {
      this.logServerStart(port);
    });
  }

  private logServerStart(port: number): void {
    process.stdout.write(`Server running on port ${port}\n`);
    process.stdout.write(`Environment: ${this.config.environment}\n`);
    process.stdout.write(`Health check: http://localhost:${port}/health\n`);
  }

  public getApp(): express.Application {
    return this.app;
  }
}

// Factory function for creating server instance
export function createServer(config?: Partial<ServerConfig>): HttpServer {
  const defaultConfig: ServerConfig = {
    port: Number.parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    ...config,
  };

  return new HttpServer(defaultConfig);
}
