import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signIn', 'signUp']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.loginForm.valid).toBeFalsy();
  });

  it('should have valid form when filled correctly', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: '123456'
    });
    expect(component.loginForm.valid).toBeTruthy();
  });

  it('should show error for invalid email', () => {
    component.loginForm.patchValue({
      email: 'invalid-email',
      password: '123456'
    });
    expect(component.loginForm.get('email')?.errors?.['email']).toBeTruthy();
  });

  it('should show error for short password', () => {
    component.loginForm.patchValue({
      email: 'test@example.com',
      password: '123'
    });
    expect(component.loginForm.get('password')?.errors?.['minlength']).toBeTruthy();
  });
});
