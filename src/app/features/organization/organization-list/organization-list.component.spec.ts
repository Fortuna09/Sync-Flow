import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OrganizationListComponent } from './organization-list.component';
import { OrganizationService } from '../organization.service';
import { ProfileService } from '../../../core/auth/profile.service';
import { SUPABASE_CLIENT } from '../../../core/tokens/supabase.token';
import { createMockSupabaseClient } from '../../../core/tokens/supabase.token.mock';

describe('OrganizationListComponent', () => {
  let component: OrganizationListComponent;
  let fixture: ComponentFixture<OrganizationListComponent>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['getMyOrganizations']);
    orgServiceSpy.getMyOrganizations.and.resolveTo([]);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['hasCreatedOrg', 'getMyProfile']);
    profileServiceSpy.hasCreatedOrg.and.resolveTo(true);
    profileServiceSpy.getMyProfile.and.resolveTo(null);

    await TestBed.configureTestingModule({
      imports: [OrganizationListComponent],
      providers: [
        { provide: OrganizationService, useValue: orgServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy },
        { provide: SUPABASE_CLIENT, useValue: createMockSupabaseClient() },
        // TopbarComponent (renderizado dentro deste componente) usa routerLink
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load organizations on init', async () => {
    await fixture.whenStable(); // Wait for ngOnInit async call
    expect(orgServiceSpy.getMyOrganizations).toHaveBeenCalled();
  });
});
