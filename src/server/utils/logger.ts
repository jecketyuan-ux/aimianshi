import winston from 'winston';
import path from 'path';
import { config } from '@/shared/config';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
  })
);

export const logger = winston.createLogger({
  level: config.logging.level,
  format: logFormat,
  defaultMeta: { service: 'aimianshi' },
  transports: [
    new winston.transports.File({
      filename: path.join(config.logging.file),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    new winston.transports.File({
      filename: path.join(path.dirname(config.logging.file), 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    })
  ],
});

if (config.env !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat
  }));
}

export class Logger {
  static info(message: string, meta?: any): void {
    logger.info(message, meta);
  }

  static error(message: string, error?: Error | any): void {
    if (error instanceof Error) {
      logger.error(message, { error: error.message, stack: error.stack });
    } else {
      logger.error(message, { error });
    }
  }

  static warn(message: string, meta?: any): void {
    logger.warn(message, meta);
  }

  static debug(message: string, meta?: any): void {
    logger.debug(message, meta);
  }

  static http(message: string, meta?: any): void {
    logger.http(message, meta);
  }
}

export default logger;