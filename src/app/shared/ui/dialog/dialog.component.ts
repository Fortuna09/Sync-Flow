import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogService } from '../../../core/services/dialog.service';

/**
 * Modal único de confirmação/prompt, controlado pelo DialogService.
 * Montado uma única vez em AppComponent.
 */
@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dialog.component.html'
})
export class DialogComponent {
  private dialogService = inject(DialogService);

  request = this.dialogService.request;
  promptValue = signal('');

  constructor() {
    // Reseta o input do prompt sempre que uma nova requisição chega
    effect(() => {
      const req = this.request();
      this.promptValue.set(req?.defaultValue ?? '');
    });
  }

  confirm(): void {
    const req = this.request();
    if (!req) return;

    if (req.mode === 'prompt') {
      const value = this.promptValue().trim();
      this.dialogService.respond(value ? value : null);
    } else {
      this.dialogService.respond(true);
    }
  }

  cancel(): void {
    const req = this.request();
    if (!req) return;

    this.dialogService.respond(req.mode === 'prompt' ? null : false);
  }
}
