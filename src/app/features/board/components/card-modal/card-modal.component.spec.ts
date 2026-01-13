import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardModalComponent } from './card-modal.component';
import { CardService } from '../../api/card.service';
import { Card } from '../../models/board.model';
import { FormsModule } from '@angular/forms';

describe('CardModalComponent', () => {
  let component: CardModalComponent;
  let fixture: ComponentFixture<CardModalComponent>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;

  const mockCard: Card = {
    id: 1,
    content: 'Test Card',
    position: 0,
    list_id: 1
  };

  beforeEach(async () => {
    cardServiceSpy = jasmine.createSpyObj('CardService', ['addComment', 'deleteComment']);

    await TestBed.configureTestingModule({
      imports: [CardModalComponent, FormsModule],
      providers: [
        { provide: CardService, useValue: cardServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CardModalComponent);
    component = fixture.componentInstance;
    component.card = mockCard;
    component.listName = 'To Do';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display card content', () => {
    expect(component.card.content).toBe('Test Card');
  });
});
