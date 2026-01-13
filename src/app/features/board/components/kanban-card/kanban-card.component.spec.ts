import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanCardComponent } from './kanban-card.component';
import { Card } from '../../models/board.model';

describe('KanbanCardComponent', () => {
  let component: KanbanCardComponent;
  let fixture: ComponentFixture<KanbanCardComponent>;

  const mockCard: Card = {
    id: 1,
    content: 'Test Card',
    position: 0,
    list_id: 1,
    organization_id: 'org-1' // Added to satisfy potential strict typing
  } as any; // Using any to bypass optional fields if needed

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanCardComponent);
    component = fixture.componentInstance;
    component.card = mockCard;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display card content', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Test Card');
  });

  it('should emit edit event on click', () => {
    spyOn(component.edit, 'emit');
    component.onCardClick();
    expect(component.edit.emit).toHaveBeenCalledWith(mockCard);
  });
});
