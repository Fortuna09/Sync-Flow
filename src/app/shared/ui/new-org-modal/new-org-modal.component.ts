import { Component, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { inject } from '@angular/core';

@Component({
  selector: 'app-new-org-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './new-org-modal.component.html',
  styleUrl: './new-org-modal.component.scss'
})
export class NewOrgModalComponent {
  private fb = inject(FormBuilder);

  isOpen = input<boolean>(false);
  onClose = output<void>();
  onCreate = output<string>();

  orgForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]]
  });

  isLoading = false;

  get name() { return this.orgForm.get('name'); }

  close(): void {
    this.orgForm.reset();
    this.onClose.emit();
  }

  submit(): void {
    if (this.orgForm.invalid) {
      this.orgForm.markAllAsTouched();
      return;
    }

    this.onCreate.emit(this.orgForm.value.name);
  }

  // Placeholder para funcionalidade futura
  joinOrganization(): void {
    console.log('Entrar em organização existente - TODO');
  }
}
