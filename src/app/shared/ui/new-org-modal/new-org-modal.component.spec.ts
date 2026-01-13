import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NewOrgModalComponent } from './new-org-modal.component';

describe('NewOrgModalComponent', () => {
  let component: NewOrgModalComponent;
  let fixture: ComponentFixture<NewOrgModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewOrgModalComponent, ReactiveFormsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(NewOrgModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should be invalid when empty', () => {
    expect(component.orgForm.valid).toBeFalse();
  });

  it('should emit onCreate when valid form submitted', () => {
    spyOn(component.onCreate, 'emit');
    component.orgForm.setValue({ name: 'Test Org' });
    component.submit();
    expect(component.onCreate.emit).toHaveBeenCalledWith('Test Org');
  });

  it('should emit onClose when closed', () => {
    spyOn(component.onClose, 'emit');
    component.close();
    expect(component.onClose.emit).toHaveBeenCalled();
  });
});
