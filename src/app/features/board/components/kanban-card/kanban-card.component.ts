import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Card } from '../../models/board.model';

/**
 * Componente que representa um cartão individual no quadro Kanban.
 * Emite eventos de edição e exclusão para o componente pai.
 */
@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './kanban-card.component.html',
  styleUrl: './kanban-card.component.scss'
})
export class KanbanCardComponent {
  @Input({ required: true }) card!: Card;
  @Output() edit = new EventEmitter<Card>();
  @Output() delete = new EventEmitter<Card>();

  onCardClick() {
    this.edit.emit(this.card);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.card);
  }
}
