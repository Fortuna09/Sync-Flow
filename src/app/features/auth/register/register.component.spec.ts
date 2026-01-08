import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent, RouterTestingModule, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when empty', () => {
    expect(component.registerForm.valid).toBeFalsy();
  });

  it('should validate email format', () => {
    component.email?.setValue('invalid-email');
    expect(component.email?.errors?.['email']).toBeTruthy();
    
    component.email?.setValue('valid@email.com');
    expect(component.email?.errors).toBeNull();
  });

  it('should validate password match', () => {
    component.password?.setValue('123456');
    component.confirmPassword?.setValue('different');
    component.registerForm.updateValueAndValidity();
    
    expect(component.confirmPassword?.errors?.['passwordMismatch']).toBeTruthy();
  });
});
