import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { OrganizationService, Organization } from '../organization.service';
import { ProfileService } from '../../../core/auth/profile.service';
import { OrganizationContextService } from '../../../core/services/organization-context.service';
import { TopbarComponent } from '../../../shared/ui/topbar/topbar.component';
import { NewOrgModalComponent } from '../../../shared/ui/new-org-modal/new-org-modal.component';
import { getErrorMessage } from '../../../core/interfaces';

/**
 * Componente que lista todas as organizações do usuário
 * Redireciona para criação se o usuário ainda não possui nenhuma
 */
@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, TopbarComponent, NewOrgModalComponent],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss'
})
export class OrganizationListComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private profileService = inject(ProfileService);
  private orgContext = inject(OrganizationContextService);
  private router = inject(Router);

  organizations = signal<Organization[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');
  isModalOpen = signal(false);

  async ngOnInit(){
    // Primeiro verifica se usuário já criou uma org
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
      
      // Se não tem organização (caso tenha saido ou apagado todas), redireciona para criar
      if (orgs.length === 0) {
        this.router.navigate(['/organizations/new']);
      }
    } catch (error: unknown) {
      this.errorMessage.set(getErrorMessage(error));
    } finally {
      this.isLoading.set(false);
    }
  }

  openNewOrgModal(): void {
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  async createOrganization(name: string): Promise<void> {
    try {
      await this.orgService.createOrganization(name);
      this.closeModal();
      await this.loadOrganizations();
    } catch (error: unknown) {
      console.error('Erro ao criar organização:', getErrorMessage(error));
    }
  }

  enterOrganization(org: Organization): void {
    // Salvar org no serviço de contexto (com signals e persistência)
    this.orgContext.setCurrentOrganization(org);
    
    // Navegar para os boards da organização
    this.router.navigate(['/org', org.slug, 'boards']);
  }
}
