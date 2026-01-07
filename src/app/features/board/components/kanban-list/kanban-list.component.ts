import { Component, Input, Output, EventEmitter, signal, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDragPlaceholder } from '@angular/cdk/drag-drop';
import { List, Card } from '../../models/board.model';
import { KanbanCardComponent } from '../kanban-card/kanban-card.component';

@Component({
  selector: 'app-kanban-list',
  standalone: true,
  imports: [CommonModule, FormsModule, KanbanCardComponent, CdkDropList, CdkDrag, CdkDragPlaceholder],
  templateUrl: './kanban-list.component.html',
  styleUrl: './kanban-list.component.scss'
})
export class KanbanListComponent {
  @Input({ required: true }) list!: List;
  @Input() connectedLists: string[] = [];
  
  @Output() updateList = new EventEmitter<{ id: number; title: string }>();
  @Output() deleteList = new EventEmitter<List>();
  @Output() addCardEvent = new EventEmitter<{ listId: number; title: string }>();
  @Output() editCard = new EventEmitter<Card>();
  @Output() deleteCard = new EventEmitter<Card>();
  @Output() cardDropped = new EventEmitter<CdkDragDrop<Card[]>>();

  // Referência aos componentes filhos KanbanCard
  @ViewChildren(KanbanCardComponent) kanbanCards!: QueryList<KanbanCardComponent>;

  // Estados locais
  isEditingTitle = signal(false);
  isAddingCard = signal(false);
  editTitle = '';
  newCardTitle = '';

  // Drag & Drop
  onCardDropped(event: CdkDragDrop<Card[]>) {
    this.cardDropped.emit(event);
  }

  // Editar título da lista
  startEditTitle() {
    this.editTitle = this.list.title;
    this.isEditingTitle.set(true);
  }

  saveTitle() {
    if (this.editTitle.trim() && this.editTitle !== this.list.title) {
      this.updateList.emit({ id: this.list.id, title: this.editTitle.trim() });
    }
    this.isEditingTitle.set(false);
  }

  cancelEditTitle() {
    this.isEditingTitle.set(false);
  }

  onDeleteList() {
    if (confirm(`Excluir lista "${this.list.title}" e todos os seus cartões?`)) {
      this.deleteList.emit(this.list);
    }
  }

  // Adicionar card
  startAddCard() {
    this.newCardTitle = '';
    this.isAddingCard.set(true);
  }

  addCard() {
    if (this.newCardTitle.trim()) {
      this.addCardEvent.emit({ listId: this.list.id, title: this.newCardTitle.trim() });
      this.newCardTitle = '';
      // Mantém aberto para adicionar mais
    }
  }

  cancelAddCard() {
    this.isAddingCard.set(false);
    this.newCardTitle = '';
  }

  // Card actions
  onEditCard(card: Card) {
    this.editCard.emit(card);
  }

  onDeleteCard(card: Card) {
    if (confirm(`Excluir cartão "${card.content}"?`)) {
      this.deleteCard.emit(card);
    }
  }
}
