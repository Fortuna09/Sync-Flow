import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Log levels for structured logging.
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Structure of a log entry for potential remote logging.
 */
interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: unknown;
}

/**
 * Centralized logging service.
 * 
 * In development: logs to console with formatting.
 * In production: can be extended to send to remote logging service.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private isProduction = environment.production;

  /**
   * Log debug information (only in development).
   */
  debug(message: string, data?: unknown): void {
    if (!this.isProduction) {
      this.log('debug', message, data);
    }
  }

  /**
   * Log general information.
   */
  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  /**
   * Log warnings.
   */
  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  /**
   * Log errors.
   */
  error(message: string, error?: unknown): void {
    this.log('error', message, error);
    
    // In production, you might want to send to error tracking service
    if (this.isProduction) {
      this.sendToErrorTracking({ level: 'error', message, timestamp: new Date().toISOString(), data: error });
    }
  }

  /**
   * Internal logging method.
   */
  private log(level: LogLevel, message: string, data?: unknown): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (this.isProduction) {
      // In production, only log warnings and errors, and without verbose data
      if (level === 'error' || level === 'warn') {
        console[level](`${prefix} ${message}`);
      }
    } else {
      // In development, log everything with full data
      const logFn = console[level] || console.log;
      if (data !== undefined) {
        logFn(`${prefix} ${message}`, data);
      } else {
        logFn(`${prefix} ${message}`);
      }
    }
  }

  /**
   * Send error to remote tracking service.
   * TODO: Implement with Sentry, LogRocket, or similar.
   */
  private sendToErrorTracking(entry: LogEntry): void {
    // Placeholder for error tracking integration
    // Example: Sentry.captureException(entry.data);
    void entry; // Suppress unused variable warning
  }
}
