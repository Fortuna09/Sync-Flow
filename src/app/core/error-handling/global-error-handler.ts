import { ErrorHandler, Injectable, inject } from '@angular/core';
import { LoggerService } from '../services/logger.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private logger = inject(LoggerService);

  handleError(error: unknown): void {
    this.logger.error('Erro não tratado', error);

    if (!environment.production) {
      console.error('GlobalErrorHandler:', error);
    }
  }
}
