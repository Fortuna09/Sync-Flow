import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/board.model';

@Component({
  selector: 'app-kanban-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './kanban-card.component.html',
  styleUrl: './kanban-card.component.scss'
})
export class KanbanCardComponent {
  @Input({ required: true }) card!: Card;
  @Output() edit = new EventEmitter<Card>();
  @Output() delete = new EventEmitter<Card>();

  // Referência ao elemento raiz do card (ElementRef)
  @ViewChild('cardElement') cardElement?: ElementRef<HTMLDivElement>;

  onCardClick() {
    this.edit.emit(this.card);
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.card);
  }
}
