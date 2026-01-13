import { ComponentFixture, TestBed } from '@angular/core/testing';
import { KanbanListComponent } from './kanban-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { List } from '../../models/board.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('KanbanListComponent', () => {
  let component: KanbanListComponent;
  let fixture: ComponentFixture<KanbanListComponent>;

  const mockList: List = {
    id: 1,
    title: 'To Do',
    position: 0,
    board_id: 1,
    cards: []
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KanbanListComponent, DragDropModule, NoopAnimationsModule]
    }).compileComponents();

    fixture = TestBed.createComponent(KanbanListComponent);
    component = fixture.componentInstance;
    component.list = mockList;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render list title', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('To Do');
  });
});
