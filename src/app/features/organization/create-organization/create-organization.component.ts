import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationService } from '../organization.service';
import { ProfileService } from '../../../core/auth/profile.service';
import { getErrorMessage } from '../../../core/interfaces';

/**
 * Componente para criação da primeira organização do usuário.
 * Exibido após o cadastro inicial.
 */
@Component({
  selector: 'app-create-organization',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-organization.component.html',
  styleUrl: './create-organization.component.scss'
})
export class CreateOrganizationComponent {
  private fb = inject(FormBuilder);
  private orgService = inject(OrganizationService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  orgForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
  });

  isLoading = false;
  errorMessage = '';

  get name() { return this.orgForm.get('name'); }

  async onSubmit(): Promise<void> {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Primeira organização é sempre pessoal
      const org = await this.orgService.createOrganization(this.orgForm.value.name, true);
      
      // Marcar no profile que já criou organização
      await this.profileService.markOrgCreated();
      
      // Redirecionar para a lista de organizações
      this.router.navigate(['/organizations']);
    } catch (error: unknown) {
      this.errorMessage = getErrorMessage(error);
    } finally {
      this.isLoading = false;
    }
  }
}
