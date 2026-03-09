import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

@Injectable({ providedIn: 'root' })
export class LoggerService {
  private isProduction = environment.production;

  debug(message: string, data?: unknown): void {
    if (!this.isProduction) {
      this.log('debug', message, data);
    }
  }

  info(message: string, data?: unknown): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log('warn', message, data);
  }

  error(message: string, error?: unknown): void {
    this.log('error', message, error);
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    const prefix = `[${level.toUpperCase()}]`;

    if (this.isProduction && level !== 'error' && level !== 'warn') {
      return;
    }

    const logFn = console[level] || console.log;
    data !== undefined ? logFn(`${prefix} ${message}`, data) : logFn(`${prefix} ${message}`);
  }
}
