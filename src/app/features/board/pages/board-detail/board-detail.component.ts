import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { BoardService } from '../../api/board.service';
import { ListService } from '../../api/list.service';
import { CardService } from '../../api/card.service';
import { OrganizationService } from '../../../organization/organization.service';
import { Board, List, Card } from '../../models/board.model';
import { KanbanListComponent } from '../../components/kanban-list/kanban-list.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, KanbanListComponent],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.scss'
})
export class BoardDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);
  private listService = inject(ListService);
  private cardService = inject(CardService);
  private orgService = inject(OrganizationService);

  board = signal<Board | null>(null);
  lists = signal<List[]>([]);
  isLoading = signal(true);
  isAddingList = signal(false);
  newListTitle = '';
  orgSlug = signal('');

  // IDs das listas conectadas para Drag & Drop
  connectedListIds = computed(() => 
    this.lists().map(list => 'list-' + list.id)
  );

  ngOnInit(): void {
    const boardId = this.route.snapshot.paramMap.get('id');
    const slug = this.route.snapshot.paramMap.get('orgSlug');
    
    if (slug) {
      this.orgSlug.set(slug);
    }

    if (boardId) {
      this.loadBoard(+boardId);
    }
  }

  private async loadBoard(id: number): Promise<void> {
    try {
      this.isLoading.set(true);
      
      // Carregar board e listas em paralelo
      const [boards, lists] = await Promise.all([
        this.boardService.getBoards(),
        this.listService.getListsByBoardId(id)
      ]);
      
      const foundBoard = boards.find(b => b.id === id);
      if (foundBoard) {
        this.board.set(foundBoard);

        // Se não temos slug na URL, buscar da organização do board
        if (!this.orgSlug() && foundBoard.organization_id) {
          const org = await this.orgService.getOrganizationById(foundBoard.organization_id);
          if (org) {
            this.orgSlug.set(org.slug);
          }
        }
      }
      
      this.lists.set(lists);
    } catch (error) {
      console.error('Erro ao carregar board:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  // === CRUD de Listas ===
  
  startAddList() {
    this.newListTitle = '';
    this.isAddingList.set(true);
  }

  cancelAddList() {
    this.isAddingList.set(false);
    this.newListTitle = '';
  }

  async addList() {
    if (!this.newListTitle.trim() || !this.board()) return;
    
    try {
      const newList = await this.listService.createList({
        title: this.newListTitle.trim(),
        board_id: this.board()!.id
      });
      
      this.lists.update(current => [...current, newList]);
      this.newListTitle = '';
      // Mantém aberto para adicionar mais
    } catch (error) {
      console.error('Erro ao criar lista:', error);
      alert('Erro ao criar lista');
    }
  }

  async onUpdateList(event: { id: number; title: string }) {
    try {
      await this.listService.updateList(event.id, { title: event.title });
      
      this.lists.update(current => 
        current.map(list => 
          list.id === event.id ? { ...list, title: event.title } : list
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar lista:', error);
    }
  }

  async onDeleteList(list: List) {
    try {
      await this.listService.deleteList(list.id);
      this.lists.update(current => current.filter(l => l.id !== list.id));
    } catch (error) {
      console.error('Erro ao excluir lista:', error);
    }
  }

  // === CRUD de Cards ===
  
  async onAddCard(event: { listId: number; title: string }) {
    try {
      const newCard = await this.cardService.createCard({
        content: event.title,
        list_id: event.listId
      });
      
      this.lists.update(current => 
        current.map(list => 
          list.id === event.listId 
            ? { ...list, cards: [...(list.cards || []), newCard] }
            : list
        )
      );
    } catch (error) {
      console.error('Erro ao criar card:', error);
      alert('Erro ao criar cartão');
    }
  }

  onEditCard(card: Card) {
    // TODO: Abrir modal de edição
    const newTitle = prompt('Editar título:', card.content);
    if (newTitle && newTitle.trim() !== card.content) {
      this.updateCard(card.id, card.list_id, { title: newTitle.trim() });
    }
  }

  private async updateCard(cardId: number, listId: number, updates: { title?: string; description?: string }) {
    try {
      const updated = await this.cardService.updateCard(cardId, updates);
      
      this.lists.update(current => 
        current.map(list => 
          list.id === listId 
            ? { 
                ...list, 
                cards: list.cards?.map(c => c.id === cardId ? { ...c, ...updates } : c) 
              }
            : list
        )
      );
    } catch (error) {
      console.error('Erro ao atualizar card:', error);
    }
  }

  async onDeleteCard(card: Card) {
    try {
      await this.cardService.deleteCard(card.id);
      
      this.lists.update(current => 
        current.map(list => 
          list.id === card.list_id 
            ? { ...list, cards: list.cards?.filter(c => c.id !== card.id) }
            : list
        )
      );
    } catch (error) {
      console.error('Erro ao excluir card:', error);
    }
  }

  // === Drag & Drop ===
  
  async onCardDropped(event: CdkDragDrop<Card[]>) {
    const prevListId = this.getListIdFromContainerId(event.previousContainer.id);
    const currListId = this.getListIdFromContainerId(event.container.id);
    
    if (event.previousContainer === event.container) {
      // Movendo dentro da mesma lista
      const list = this.lists().find(l => l.id === currListId);
      if (list?.cards) {
        const cards = [...list.cards];
        moveItemInArray(cards, event.previousIndex, event.currentIndex);
        
        // Atualiza UI imediatamente
        this.lists.update(current => 
          current.map(l => l.id === currListId ? { ...l, cards } : l)
        );
        
        // Persiste no banco
        await this.persistCardPositions(cards, currListId);
      }
    } else {
      // Movendo entre listas
      const prevList = this.lists().find(l => l.id === prevListId);
      const currList = this.lists().find(l => l.id === currListId);
      
      if (prevList?.cards && currList) {
        const prevCards = [...prevList.cards];
        const currCards = [...(currList.cards || [])];
        
        transferArrayItem(prevCards, currCards, event.previousIndex, event.currentIndex);
        
        // Atualiza UI imediatamente
        this.lists.update(current => 
          current.map(l => {
            if (l.id === prevListId) return { ...l, cards: prevCards };
            if (l.id === currListId) return { ...l, cards: currCards };
            return l;
          })
        );
        
        // Persiste no banco
        await Promise.all([
          this.persistCardPositions(prevCards, prevListId),
          this.persistCardPositions(currCards, currListId)
        ]);
      }
    }
  }

  private getListIdFromContainerId(containerId: string): number {
    return parseInt(containerId.replace('list-', ''), 10);
  }

  private async persistCardPositions(cards: Card[], listId: number): Promise<void> {
    try {
      const updates = cards.map((card, index) => ({
        id: card.id,
        position: index,
        list_id: listId
      }));
      
      await this.cardService.reorderCards(updates);
    } catch (error) {
      console.error('Erro ao salvar posições:', error);
    }
  }
}
