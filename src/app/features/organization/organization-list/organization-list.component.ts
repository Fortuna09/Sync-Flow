import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService, Organization } from '../organization.service';
import { ProfileService } from '../../../core/auth/profile.service';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss'
})
export class OrganizationListComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  organizations = signal<Organization[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    // Primeiro verifica se usuário já criou org
    const hasCreatedOrg = await this.profileService.hasCreatedOrg();
    
    if (!hasCreatedOrg) {
      // Nunca criou organização, redireciona para criar
      this.router.navigate(['/organizations/new']);
      return;
    }
    
    await this.loadOrganizations();
  }

  async loadOrganizations(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      const orgs = await this.orgService.getMyOrganizations();
      this.organizations.set(orgs);
      
      // Se não tem organização (foi removido de todas), redireciona para criar
      if (orgs.length === 0) {
        this.router.navigate(['/organizations/new']);
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Erro ao carregar organizações');
    } finally {
      this.isLoading.set(false);
    }
  }

  enterOrganization(org: Organization): void {
    // Salvar org selecionada no localStorage ou serviço
    localStorage.setItem('currentOrganizationId', org.id);
    localStorage.setItem('currentOrganizationSlug', org.slug);
    
    // Navegar para os boards da organização
    this.router.navigate(['/org', org.slug, 'boards']);
  }
}
