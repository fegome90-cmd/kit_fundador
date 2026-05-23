/**
 * HTTP Server Configuration
 * Express server setup with middleware and routing
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createUserRoutes } from './routes/userRoutes';
import { specs, swaggerUi } from './swagger';
export class HttpServer {
    app;
    config;
    server;
    constructor(config) {
        this.config = config;
        this.app = express();
        this.setupMiddleware();
        this.setupSwagger();
        this.setupRoutes();
        this.setupErrorHandling();
    }
    setupMiddleware() {
        this.setupBodyParsing();
        this.setupSecurityMiddleware();
        this.setupLogging();
    }
    setupSwagger() {
        // Serve Swagger UI at /api-docs and handle redirect properly
        this.app.get('/api-docs', swaggerUi.setup(specs));
        this.app.use('/api-docs', swaggerUi.serve);
    }
    setupSecurityMiddleware() {
        this.app.use(helmet());
        this.app.use(cors());
    }
    setupBodyParsing() {
        // Enhanced JSON parsing with better error handling
        this.app.use(express.json({
            limit: '10mb',
            strict: false,
            type: ['application/json'],
        }));
        this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    }
    setupLogging() {
        this.app.use((req, res, next) => this.requestLogger(req, res, next));
    }
    setupRoutes() {
        this.setupApiRoutes();
        this.setupHealthCheck();
        this.setup404Handler();
    }
    setupApiRoutes() {
        this.app.use('/api/users', createUserRoutes());
    }
    setupHealthCheck() {
        this.app.get('/health', (req, res) => this.healthCheckHandler(req, res));
    }
    setup404Handler() {
        this.app.use('*', (req, res) => this.notFoundHandler(req, res));
    }
    setupErrorHandling() {
        this.app.use((error, req, res) => this.errorHandler(error, req, res));
    }
    requestLogger(req, _res, next) {
        const timestamp = new Date().toISOString();
        process.stdout.write(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}\n`);
        next();
    }
    healthCheckHandler(_req, res) {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: this.config.environment,
        });
    }
    notFoundHandler(req, res) {
        res.status(404).json({
            success: false,
            message: 'Route not found',
            path: req.originalUrl,
        });
    }
    errorHandler(error, req, res) {
        const timestamp = new Date().toISOString();
        this.logError(req, error, timestamp);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            timestamp,
        });
    }
    logError(req, error, timestamp) {
        const errorInfo = {
            timestamp,
            method: req.method,
            path: req.path,
            error: error.message,
            hasStack: !!error.stack,
        };
        process.stderr.write(JSON.stringify(errorInfo) + '\n');
    }
    start() {
        const port = this.config.port;
        this.server = this.app.listen(port, () => {
            // Fix: Log actual bound port, not requested port
            const address = this.server?.address();
            const actualPort = (typeof address === 'string') ? port : address?.port || port;
            this.logServerStart(actualPort);
        });
    }
    stop() {
        return new Promise((resolve) => {
            if (this.server) {
                this.server.close(() => {
                    console.log('Server stopped');
                    // Fix: Make stop() idempotent - clear server reference
                    this.server = undefined;
                    resolve();
                });
            }
            else {
                resolve();
            }
        });
    }
    getApp() {
        return this.app;
    }
    isRunning() {
        return !!this.server && this.server.listening;
    }
    logServerStart(port) {
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
export function createServer(config) {
    const defaultConfig = {
        port: Number.parseInt(process.env.PORT || '3000', 10),
        environment: process.env.NODE_ENV || 'development',
        ...config,
    };
    return new HttpServer(defaultConfig);
}
//# sourceMappingURL=server.js.map