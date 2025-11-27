import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { config } from '@/shared/config';
import { database } from '@/server/utils/database';
import { logger } from '@/server/utils/logger';
import { rateLimit, requestLogger, errorHandler, notFoundHandler } from '@/server/middleware';
import routes from '@/server/routes';
import { initializeWebSocket } from '@/server/sockets';

class Server {
  private app: express.Application;
  private server: any;
  private wsService: any;

  constructor() {
    this.app = express();
    this.server = createServer(this.app);
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: config.cors.origins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    this.app.use(requestLogger);

    // Rate limiting
    this.app.use(rateLimit);
  }

  private setupRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Static files
    this.app.use('/uploads', express.static(config.upload.path));
    this.app.use('/public', express.static('public'));

    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        success: true,
        message: 'AI Interview Platform API',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
      });
    });
  }

  private setupErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await database.connect();
      logger.info('Database connected successfully');

      // Initialize WebSocket
      this.wsService = initializeWebSocket(this.server);
      logger.info('WebSocket service initialized');

      // Start server
      this.server.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
        logger.info(`Environment: ${config.env}`);
        
        if (config.env === 'development') {
          logger.info(`API Documentation: http://localhost:${config.port}/api`);
          logger.info(`Health Check: http://localhost:${config.port}/api/health`);
        }
      });

      // Graceful shutdown
      this.setupGracefulShutdown();

    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, starting graceful shutdown...`);

      try {
        // Close HTTP server
        this.server.close(() => {
          logger.info('HTTP server closed');
        });

        // Close WebSocket connections
        if (this.wsService) {
          // WebSocket connections will be closed when server closes
          logger.info('WebSocket connections closed');
        }

        // Close database connection
        await database.disconnect();
        logger.info('Database connection closed');

        logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during graceful shutdown:', error);
        process.exit(1);
      }
    };

    // Handle process signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('uncaughtException');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('unhandledRejection');
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getServer(): any {
    return this.server;
  }
}

// Create and start server
const server = new Server();
server.start();

export default server;