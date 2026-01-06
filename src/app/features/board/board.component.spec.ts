import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BoardComponent } from './board.component';
import { AuthService } from '../../core/auth/auth.service';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut'], {
      currentUser: signal({ email: 'test@example.com' })
    });

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display user email', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('p')?.textContent).toContain('test@example.com');
  });

  it('should call signOut when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(authServiceSpy.signOut).toHaveBeenCalled();
  });
});
