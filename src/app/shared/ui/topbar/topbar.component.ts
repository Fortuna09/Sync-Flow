import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService, Profile } from '../../../core/auth/profile.service';

/**
 * Componente de barra superior (header) da aplicação.
 * Exibe informações do usuário logado e menu de ações.
 */
@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss'
})
export class TopbarComponent implements OnInit {
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  userProfile = signal<Profile | null>(null);
  userInitials = signal('U');
  userName = signal('');
  isMenuOpen = false;

  async ngOnInit(): Promise<void> {
    await this.loadProfile();
  }

  private async loadProfile(): Promise<void> {
    const profile = await this.profileService.getMyProfile();
    if (profile) {
      this.userProfile.set(profile);
      
      const firstName = profile.first_name || '';
      const lastName = profile.last_name || '';
      
      // Gerar iniciais (primeira letra de cada nome)
      const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || 'U';
      this.userInitials.set(initials);
      
      // Nome completo
      const fullName = [firstName, lastName].filter(Boolean).join(' ');
      this.userName.set(fullName || 'Usuário');
    }
  }

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
