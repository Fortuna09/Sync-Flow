import { Component, Input, Output, EventEmitter, signal, ElementRef, ViewChild, inject } from '@angular/core';
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
  private elementRef = inject(ElementRef);

  @Input({ required: true }) list!: List;
  @Input() connectedLists: string[] = [];
  
  @Output() updateList = new EventEmitter<{ id: number; title: string }>();
  @Output() deleteList = new EventEmitter<List>();
  @Output() addCardEvent = new EventEmitter<{ listId: number; title: string }>();
  @Output() editCard = new EventEmitter<Card>();
  @Output() deleteCard = new EventEmitter<Card>();
  @Output() cardDropped = new EventEmitter<CdkDragDrop<Card[]>>();

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
    // Pequeno delay para permitir que o DOM atualize e o input apareça para focar se necessário
    setTimeout(() => {
      const input = this.elementRef.nativeElement.querySelector('textarea');
      if (input) input.focus();
    });
  }

  addCard() {
    if (this.newCardTitle.trim()) {
      this.addCardEvent.emit({ listId: this.list.id, title: this.newCardTitle.trim() });
      this.newCardTitle = '';
      this.isAddingCard.set(false); // Fecha o formulário
    }
  }

  cancelAddCard() {
    this.isAddingCard.set(false);
    this.newCardTitle = '';
  }

  // Detectar clique fora do formulário de adição
  onFormFocusOut(event: FocusEvent) {
    // Verifica se o novo foco está dentro do elemento do formulário
    const formElement = event.currentTarget as HTMLElement;
    const relatedTarget = event.relatedTarget as HTMLElement;
    
    // Se o elemento clicado (relatedTarget) não faz parte do formulário, fecha
    if (!formElement.contains(relatedTarget)) {
      this.cancelAddCard();
    }
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
