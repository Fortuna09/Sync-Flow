import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardDetailComponent } from './board-detail.component';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../../api/board.service';
import { ListService } from '../../api/list.service';
import { CardService } from '../../api/card.service';
import { OrganizationService } from '../../../../features/organization/organization.service';
import { of } from 'rxjs';

describe('BoardDetailComponent', () => {
  let component: BoardDetailComponent;
  let fixture: ComponentFixture<BoardDetailComponent>;
  
  let boardServiceSpy: jasmine.SpyObj<BoardService>;
  let listServiceSpy: jasmine.SpyObj<ListService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;

  beforeEach(async () => {
    boardServiceSpy = jasmine.createSpyObj('BoardService', ['getBoardById']);
    listServiceSpy = jasmine.createSpyObj('ListService', ['getListsByBoardId']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['createCard']);
    orgServiceSpy = jasmine.createSpyObj('OrganizationService', []);

    boardServiceSpy.getBoardById.and.resolveTo({ id: 1, title: 'Test Board', bg_color: 'bg-blue-500', organization_id: 'org1' });
    listServiceSpy.getListsByBoardId.and.resolveTo([]);

    await TestBed.configureTestingModule({
      imports: [BoardDetailComponent],
      providers: [
        { 
          provide: ActivatedRoute, 
          useValue: { 
            snapshot: { paramMap: { get: () => '1' } },
            paramMap: of({ get: () => '1' })
          } 
        },
        { provide: BoardService, useValue: boardServiceSpy },
        { provide: ListService, useValue: listServiceSpy },
        { provide: CardService, useValue: cardServiceSpy },
        { provide: OrganizationService, useValue: orgServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load board data on init', () => {
    expect(boardServiceSpy.getBoardById).toHaveBeenCalled();
  });
});
