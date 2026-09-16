import { Injectable, signal } from '@angular/core';

export type DialogMode = 'confirm' | 'prompt';

export interface DialogRequest {
  mode: DialogMode;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  danger: boolean;
  defaultValue?: string;
  placeholder?: string;
  resolve: (value: boolean | string | null) => void;
}

export interface ConfirmOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
}

export interface PromptOptions {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
  placeholder?: string;
}

/**
 * Substitui confirm()/prompt() nativos por um modal próprio.
 * Um único DialogComponent (montado em AppComponent) lê `request()` e resolve a Promise
 * pendente quando o usuário confirma/cancela.
 */
@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _request = signal<DialogRequest | null>(null);
  readonly request = this._request.asReadonly();

  confirm(message: string, options: ConfirmOptions = {}): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      this._request.set({
        mode: 'confirm',
        title: options.title ?? 'Confirmar ação',
        message,
        confirmText: options.confirmText ?? 'Confirmar',
        cancelText: options.cancelText ?? 'Cancelar',
        danger: options.danger ?? false,
        resolve: resolve as (value: boolean | string | null) => void
      });
    });
  }

  prompt(message: string, options: PromptOptions = {}): Promise<string | null> {
    return new Promise<string | null>(resolve => {
      this._request.set({
        mode: 'prompt',
        title: options.title ?? message,
        message,
        confirmText: options.confirmText ?? 'Criar',
        cancelText: options.cancelText ?? 'Cancelar',
        danger: false,
        defaultValue: options.defaultValue ?? '',
        placeholder: options.placeholder,
        resolve: resolve as (value: boolean | string | null) => void
      });
    });
  }

  respond(value: boolean | string | null): void {
    this._request()?.resolve(value);
    this._request.set(null);
  }
}
