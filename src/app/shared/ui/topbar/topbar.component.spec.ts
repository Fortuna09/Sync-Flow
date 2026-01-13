import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { TopbarComponent } from './topbar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ProfileService } from '../../../core/auth/profile.service';
import { signal } from '@angular/core';

describe('TopbarComponent', () => {
  let component: TopbarComponent;
  let fixture: ComponentFixture<TopbarComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut']);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getMyProfile']);
    profileServiceSpy.getMyProfile.and.resolveTo(null);

    await TestBed.configureTestingModule({
      imports: [TopbarComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init', async () => {
    expect(profileServiceSpy.getMyProfile).toHaveBeenCalled();
  });

  it('should toggle menu', () => {
    expect(component.isMenuOpen).toBeFalse();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();
    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });
});
