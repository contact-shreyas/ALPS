/**
 * Enhanced error handling and logging system
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from './prisma';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  component?: string;
  userId?: string;
  requestId?: string;
  metadata?: Record<string, any>;
  stack?: string;
}

class Logger {
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = entry.level.toUpperCase().padEnd(5);
    const component = entry.component ? `[${entry.component}]` : '';
    const requestId = entry.requestId ? `{${entry.requestId}}` : '';
    
    return `${timestamp} ${level} ${component}${requestId} ${entry.message}`;
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    
    // Keep buffer size under control
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer = this.logBuffer.slice(-this.maxBufferSize);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    component?: string,
    metadata?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date(),
      component,
      metadata,
      stack: error?.stack,
      requestId: this.getCurrentRequestId(),
    };
  }

  private getCurrentRequestId(): string | undefined {
    // In a real implementation, you'd get this from async context
    return undefined;
  }

  debug(message: string, component?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.DEBUG, message, component, metadata);
    this.addToBuffer(entry);
    
    if (process.env.NODE_ENV === 'development') {
      console.debug(this.formatMessage(entry));
    }
  }

  info(message: string, component?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.INFO, message, component, metadata);
    this.addToBuffer(entry);
    console.info(this.formatMessage(entry));
  }

  warn(message: string, component?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.WARN, message, component, metadata);
    this.addToBuffer(entry);
    console.warn(this.formatMessage(entry));
  }

  error(message: string, error?: Error, component?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.ERROR, message, component, metadata, error);
    this.addToBuffer(entry);
    console.error(this.formatMessage(entry));
    
    if (error?.stack) {
      console.error(error.stack);
    }

    // Store critical errors in database
    this.persistError(entry).catch(console.error);
  }

  fatal(message: string, error?: Error, component?: string, metadata?: Record<string, any>): void {
    const entry = this.createLogEntry(LogLevel.FATAL, message, component, metadata, error);
    this.addToBuffer(entry);
    console.error(this.formatMessage(entry));
    
    if (error?.stack) {
      console.error(error.stack);
    }

    // Store fatal errors in database
    this.persistError(entry).catch(console.error);
  }

  private async persistError(entry: LogEntry): Promise<void> {
    try {
      await prisma.agentLog.create({
        data: {
          component: entry.component || 'unknown',
          status: 'error',
          error: `${entry.message}${entry.stack ? '\n' + entry.stack : ''}`,
        },
      });
    } catch (persistError) {
      console.error('Failed to persist error to database:', persistError);
    }
  }

  getLogs(level?: LogLevel, component?: string, limit = 100): LogEntry[] {
    let filtered = this.logBuffer;

    if (level) {
      const levelPriority = {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 1,
        [LogLevel.WARN]: 2,
        [LogLevel.ERROR]: 3,
        [LogLevel.FATAL]: 4,
      };
      
      const minPriority = levelPriority[level];
      filtered = filtered.filter(entry => levelPriority[entry.level] >= minPriority);
    }

    if (component) {
      filtered = filtered.filter(entry => entry.component === component);
    }

    return filtered.slice(-limit);
  }

  clearBuffer(): void {
    this.logBuffer = [];
  }
}

// Global logger instance
export const logger = new Logger();

// Custom error classes
export class ApplicationError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly component?: string;

  constructor(
    message: string,
    statusCode = 500,
    isOperational = true,
    component?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.component = component;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, component?: string) {
    super(message, 400, true, component);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string, component?: string) {
    super(`${resource} not found`, 404, true, component);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message = 'Unauthorized access', component?: string) {
    super(message, 401, true, component);
  }
}

export class RateLimitError extends ApplicationError {
  constructor(message = 'Rate limit exceeded', component?: string) {
    super(message, 429, true, component);
  }
}

export class DatabaseError extends ApplicationError {
  constructor(message: string, component?: string) {
    super(message, 500, true, component);
  }
}

export class ExternalServiceError extends ApplicationError {
  constructor(service: string, component?: string) {
    super(`External service ${service} unavailable`, 503, true, component);
  }
}

// Error handler for API routes
export function handleApiError(error: any, component?: string): NextResponse {
  logger.error(
    `API Error: ${error.message}`,
    error,
    component,
    { statusCode: error.statusCode }
  );

  if (error instanceof ApplicationError) {
    return NextResponse.json(
      {
        error: error.name,
        message: error.message,
        statusCode: error.statusCode,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: 'InternalServerError',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'An unexpected error occurred',
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

// Try-catch wrapper for async operations
export async function safeAsync<T>(
  operation: () => Promise<T>,
  component?: string,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await operation();
  } catch (error) {
    logger.error(
      `Safe async operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error instanceof Error ? error : undefined,
      component
    );
    return fallback;
  }
}

// Retry wrapper with exponential backoff
export async function retry<T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000,
  component?: string
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        logger.error(
          `Operation failed after ${maxAttempts} attempts`,
          lastError,
          component,
          { attempts: maxAttempts }
        );
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      logger.warn(
        `Operation failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms`,
        component,
        { error: lastError.message, attempt, delay }
      );

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

// Performance timing decorator
export function timed(component?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const timerName = `${target.constructor.name}.${propertyKey}`;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await originalMethod.apply(this, args);
        const duration = Date.now() - startTime;
        
        logger.debug(
          `${timerName} completed in ${duration}ms`,
          component || timerName,
          { duration, success: true }
        );
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        
        logger.error(
          `${timerName} failed after ${duration}ms`,
          error instanceof Error ? error : undefined,
          component || timerName,
          { duration, success: false }
        );
        
        throw error;
      }
    };

    return descriptor;
  };
}

// Global error handler for unhandled rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.fatal(
    'Unhandled Promise Rejection',
    reason instanceof Error ? reason : new Error(String(reason)),
    'global',
    { promise: promise.toString() }
  );
});

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.fatal('Uncaught Exception', error, 'global');
  process.exit(1);
});