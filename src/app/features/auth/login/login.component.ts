import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { getErrorMessage } from '../../../core/interfaces';

/**
 * Componente de login.
 * Utiliza Reactive Forms para validação e Signals para estado de UI.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);

  isLoading = signal(false);
  errorMessage = signal('');

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  async onSubmit() {
    if (this.loginForm.invalid) return;
    this.startLoading();

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.signIn(email!, password!);
      // O redirect acontece no Service
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  async onSignUp() {
    if (this.loginForm.invalid) {
      this.errorMessage.set('Preencha email e senha (mín 6 chars) para criar conta.');
      return;
    }
    this.startLoading();

    const { email, password } = this.loginForm.getRawValue();

    try {
      await this.authService.signUp(email!, password!);
      this.errorMessage.set('Conta criada! Entrando...');
    } catch (error: unknown) {
      this.handleError(error);
    }
  }

  // Helpers para limpar o código
  private startLoading() {
    this.isLoading.set(true);
    this.errorMessage.set('');
  }

  private handleError(error: unknown) {
    this.isLoading.set(false);
    this.errorMessage.set(getErrorMessage(error));
    console.error(error);
  }
}