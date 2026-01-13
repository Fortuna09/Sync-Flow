import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreateOrganizationComponent } from './create-organization.component';
import { OrganizationService } from '../organization.service';
import { ProfileService } from '../../../core/auth/profile.service';
import { of } from 'rxjs';

describe('CreateOrganizationComponent', () => {
  let component: CreateOrganizationComponent;
  let fixture: ComponentFixture<CreateOrganizationComponent>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['createOrganization']);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', [], {
      currentProfile: jasmine.createSpy().and.returnValue(null) // Mock signal
    });
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [CreateOrganizationComponent, ReactiveFormsModule],
      providers: [
        { provide: OrganizationService, useValue: orgServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CreateOrganizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form initially', () => {
    expect(component.orgForm.valid).toBeFalsy();
  });

  it('should validate name requirement', () => {
    const nameControl = component.orgForm.get('name');
    nameControl?.setValue('');
    expect(nameControl?.valid).toBeFalsy();
    expect(nameControl?.errors?.['required']).toBeTruthy();
  });

  it('should call createOrganization on valid submit', async () => {
    component.orgForm.setValue({ name: 'Nova Org' });
    orgServiceSpy.createOrganization.and.resolveTo({ id: '1', name: 'Nova Org', slug: 'nova-org', is_personal: false, created_at: '' });

    await component.onSubmit();

    expect(orgServiceSpy.createOrganization).toHaveBeenCalledWith('Nova Org');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/org', 'nova-org', 'boards']);
  });
});
