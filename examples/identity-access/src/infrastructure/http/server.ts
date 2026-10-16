/**
 * HTTP Server Configuration
 * Express server setup with middleware and routing
 */

import express from 'express';
import helmet from 'helmet';
import { Server } from 'http';
import { createUserRoutes } from './routes/userRoutes';
import { RegisterUserResponseBuilder } from './dto/RegisterUserResponse';

export interface ServerConfig {
  port: number;
  environment: string;
}

export class HttpServer {
  private readonly app: express.Application;
  private readonly config: ServerConfig;
  private server?: Server;

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    this.setupBodyParsing();
    this.setupSecurityMiddleware();
    this.setupLogging();
  }

  private setupSecurityMiddleware(): void {
    this.app.use(helmet());
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
    // Express 4 detects error middleware by its four-argument signature.
    this.app.use((
      error: Error & { status?: number; statusCode?: number; type?: string },
      req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => this.errorHandler(error, req, res));
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
      path: req.path,
    });
  }

  private errorHandler(
    error: Error & { status?: number; statusCode?: number; type?: string },
    req: express.Request,
    res: express.Response
  ): void {
    // Body-parser malformed-JSON errors are client errors, not server failures.
    // Never send the parser's raw message or request body to the client.
    if (
      error.type === 'entity.parse.failed' &&
      (error.status === 400 || error.statusCode === 400)
    ) {
      res.status(400).json(RegisterUserResponseBuilder.validationError(['Malformed JSON']));
      return;
    }
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
      errorType: error.name,
      hasStack: !!error.stack,
    };

    process.stderr.write(JSON.stringify(errorInfo) + '\n');
  }

  public start(): void {
    const port = this.config.port;

    this.server = this.app.listen(port, '127.0.0.1', () => {
      // Fix: Log actual bound port, not requested port
      const address = this.server?.address();
      const actualPort = (typeof address === 'string') ? port : address?.port || port;
      this.logServerStart(actualPort);
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('Server stopped');
          // Fix: Make stop() idempotent - clear server reference
          this.server = undefined;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public isRunning(): boolean {
    return !!this.server && this.server.listening;
  }

  private logServerStart(port: number): void {
    process.stdout.write(`Server running on port ${port}\n`);
    process.stdout.write(`Environment: ${this.config.environment}\n`);
    process.stdout.write(`Health check: http://localhost:${port}/health\n`);
  }
}

/**
 * Create an HttpServer instance using environment-derived defaults with optional overrides.
 *
 * The factory reads PORT and NODE_ENV from the process environment (defaulting to `3000` and
 * `development` respectively), applies any fields provided in `config`, and returns a new
 * HttpServer configured with the resulting values.
 *
 * @param config - Partial server configuration to override environment-derived defaults
 * @returns An HttpServer configured with the resolved `port` and `environment`
 */
export function createServer(config?: Partial<ServerConfig>): HttpServer {
  const defaultConfig: ServerConfig = {
    port: Number.parseInt(process.env.PORT || '3000', 10),
    environment: process.env.NODE_ENV || 'development',
    ...config,
  };

  return new HttpServer(defaultConfig);
}