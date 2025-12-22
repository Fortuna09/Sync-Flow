import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-board',
  standalone: true,
  template: `
    <div class="p-10">
      <h1 class="text-2xl font-bold">Bem-vindo ao SyncFlow!</h1>
      <p>Você está logado como: {{ auth.currentUser()?.email }}</p>
      
      <button (click)="auth.signOut()" class="mt-4 bg-red-500 text-white px-4 py-2 rounded">
        Sair
      </button>
    </div>
  `
})
export class BoardComponent {
  public auth = inject(AuthService);
}