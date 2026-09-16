import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

/**
 * Renderiza a fila de notificações do NotificationService.
 * Montado uma única vez em AppComponent.
 */
@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html'
})
export class ToastComponent {
  private notificationService = inject(NotificationService);

  notifications = this.notificationService.notifications;

  dismiss(id: number): void {
    this.notificationService.dismiss(id);
  }

  iconFor(type: string): string {
    if (type === 'error') return '⚠️';
    if (type === 'success') return '✅';
    return 'ℹ️';
  }
}
