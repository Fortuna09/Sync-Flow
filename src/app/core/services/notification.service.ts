import { Injectable, signal } from '@angular/core';

export type NotificationType = 'error' | 'success' | 'info';

export interface AppNotification {
  id: number;
  type: NotificationType;
  message: string;
}

const AUTO_DISMISS_MS = 5000;

/**
 * Substitui alert() nativo por toasts não-bloqueantes.
 * Estado exposto como signal readonly; o ToastComponent (montado uma vez em AppComponent) renderiza a fila.
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  error(message: string): void {
    this.show('error', message);
  }

  success(message: string): void {
    this.show('success', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  dismiss(id: number): void {
    this._notifications.update(list => list.filter(n => n.id !== id));
  }

  private show(type: NotificationType, message: string): void {
    const id = this.nextId++;
    this._notifications.update(list => [...list, { id, type, message }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }
}
