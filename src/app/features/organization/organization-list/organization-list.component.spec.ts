import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrganizationListComponent } from './organization-list.component';
import { OrganizationService } from '../organization.service';
import { Router } from '@angular/router';

describe('OrganizationListComponent', () => {
  let component: OrganizationListComponent;
  let fixture: ComponentFixture<OrganizationListComponent>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['getMyOrganizations']);
    orgServiceSpy.getMyOrganizations.and.resolveTo([]);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [OrganizationListComponent],
      providers: [
        { provide: OrganizationService, useValue: orgServiceSpy },
        { provide: Router, useValue: routerSpy }
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
