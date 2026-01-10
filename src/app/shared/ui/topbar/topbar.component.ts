import { Component, inject, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Output para quando clicar em "Nova Organização"
  onNewOrg = output<void>();

  isMenuOpen = false;

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goToProfile(): void {
    this.closeMenu();
    // TODO: Implementar tela de perfil
    console.log('Ir para perfil');
  }

  goToSettings(): void {
    this.closeMenu();
    // TODO: Implementar tela de configurações
    console.log('Ir para configurações');
  }

  async logout(): Promise<void> {
    this.closeMenu();
    await this.authService.signOut();
  }
}
