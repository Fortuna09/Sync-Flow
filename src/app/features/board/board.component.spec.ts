import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { BoardComponent } from './board.component';
import { BoardService } from './api/board.service';
import { OrganizationService } from '../organization/organization.service';
import { SUPABASE_CLIENT } from '../../core/tokens/supabase.token';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let boardServiceSpy: jasmine.SpyObj<BoardService>;
  let orgServiceSpy: jasmine.SpyObj<OrganizationService>;

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
    is_personal: false,
    created_at: '2024-01-01'
  };

  const mockBoards = [
    { id: 1, title: 'Board 1', bg_color: 'bg-blue-600', organization_id: 'org-1' },
    { id: 2, title: 'Board 2', bg_color: 'bg-emerald-600', organization_id: 'org-1' }
  ];

  beforeEach(async () => {
    boardServiceSpy = jasmine.createSpyObj('BoardService', ['getBoardsByOrganization', 'createBoard']);
    orgServiceSpy = jasmine.createSpyObj('OrganizationService', ['getOrganizationBySlug']);

    boardServiceSpy.getBoardsByOrganization.and.resolveTo(mockBoards);
    orgServiceSpy.getOrganizationBySlug.and.resolveTo(mockOrganization);

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        { provide: BoardService, useValue: boardServiceSpy },
        { provide: OrganizationService, useValue: orgServiceSpy },
        { provide: SUPABASE_CLIENT, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'orgSlug' ? 'test-org' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load organization on init', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(orgServiceSpy.getOrganizationBySlug).toHaveBeenCalledWith('test-org');
    expect(component.organizationName()).toBe('Test Organization');
  }));

  it('should load boards after organization is loaded', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    expect(boardServiceSpy.getBoardsByOrganization).toHaveBeenCalledWith('org-1');
    expect(component.boards().length).toBe(2);
  }));

  it('should display organization name in sidebar', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.org-name')?.textContent).toContain('Test Organization');
  }));

  it('should switch tabs when clicking nav items', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('boards');

    component.setActiveTab('members');
    expect(component.activeTab()).toBe('members');
  }));

  it('should show loading state initially', () => {
    expect(component.isLoading()).toBe(true);
  });
});
