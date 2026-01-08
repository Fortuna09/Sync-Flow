import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrganizationService, Organization } from '../organization.service';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './organization-list.component.html',
  styleUrl: './organization-list.component.scss'
})
export class OrganizationListComponent implements OnInit {
  private orgService = inject(OrganizationService);
  private router = inject(Router);

  organizations = signal<Organization[]>([]);
  isLoading = signal(true);
  errorMessage = signal('');

  async ngOnInit(): Promise<void> {
    await this.loadOrganizations();
  }

  async loadOrganizations(): Promise<void> {
    this.isLoading.set(true);
    
    try {
      const orgs = await this.orgService.getMyOrganizations();
      this.organizations.set(orgs);
      
      // Se não tem organização, redireciona para criar
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
