import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';

/**
 * Global error handler for the application.
 * Catches unhandled errors and logs them appropriately.
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: unknown): void {
    // Log the error using our logger service
    this.logger.error('Unhandled error caught by GlobalErrorHandler', error);

    // In development, also log to console for debugging
    if (typeof window !== 'undefined' && (window as Record<string, unknown>)['__DEV__']) {
      console.error('GlobalErrorHandler caught:', error);
    }

    // Here you could also:
    // - Send error to monitoring service (Sentry, LogRocket, etc)
    // - Show user-friendly notification
    // - Navigate to error page for critical errors
  }
}
