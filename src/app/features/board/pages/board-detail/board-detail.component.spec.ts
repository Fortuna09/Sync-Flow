import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BoardDetailComponent } from './board-detail.component';
import { ActivatedRoute } from '@angular/router';
import { BoardService } from '../../api/board.service';
import { ListService } from '../../api/list.service';
import { CardService } from '../../api/card.service';
import { OrganizationService } from '../../../../features/organization/organization.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { ProfileService } from '../../../../core/auth/profile.service';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

describe('BoardDetailComponent', () => {
  let component: BoardDetailComponent;
  let fixture: ComponentFixture<BoardDetailComponent>;
  
  let boardServiceSpy: jasmine.SpyObj<BoardService>;
  let listServiceSpy: jasmine.SpyObj<ListService>;
  let cardServiceSpy: jasmine.SpyObj<CardService>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let profileServiceSpy: jasmine.SpyObj<ProfileService>;

  beforeEach(async () => {
    boardServiceSpy = jasmine.createSpyObj('BoardService', ['getBoards']);
    listServiceSpy = jasmine.createSpyObj('ListService', ['getListsByBoardId']);
    cardServiceSpy = jasmine.createSpyObj('CardService', ['createCard']);
    orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationById']);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['signOut']);
    profileServiceSpy = jasmine.createSpyObj('ProfileService', ['getMyProfile']);

    boardServiceSpy.getBoards.and.resolveTo([{ id: 1, title: 'Test Board', bg_color: 'bg-blue-500', organization_id: 'org1' }]);
    listServiceSpy.getListsByBoardId.and.resolveTo([]);
    orgServiceSpy.getOrganizationById.and.resolveTo({ id: 'org1', name: 'Org 1', slug: 'org1', is_personal: false, created_at: '2023-01-01' });
    profileServiceSpy.getMyProfile.and.resolveTo({ first_name: 'Test', last_name: 'User', id: '1', email: 'test@example.com' } as any);

    await TestBed.configureTestingModule({
      imports: [BoardDetailComponent, RouterTestingModule],
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
        { provide: OrganizationService, useValue: orgServiceSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ProfileService, useValue: profileServiceSpy }
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
    expect(boardServiceSpy.getBoards).toHaveBeenCalled();
  });
});
