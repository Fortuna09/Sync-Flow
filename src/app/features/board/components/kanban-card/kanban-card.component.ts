import { Component, Input, Output, EventEmitter, signal, ElementRef, inject } from '@angular/core';
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
  private elementRef = inject(ElementRef);

  @Input({ required: true }) card!: Card;
  @Output() edit = new EventEmitter<Card>();
  @Output() delete = new EventEmitter<Card>();

  // Estado de edição
  isEditing = signal(false);
  editContent = '';

  onCardClick() {
    // Para simplificar, clicar no card edita ele, já que não temos modal de detalhes ainda
    this.startEdit();
  }

  startEdit(event?: Event) {
    if (event) event.stopPropagation();
    this.editContent = this.card.content;
    this.isEditing.set(true);
    
    setTimeout(() => {
      const textarea = this.elementRef.nativeElement.querySelector('textarea');
      if (textarea) {
        textarea.focus();
        textarea.select();
      }
    });
  }

  saveEdit() {
    if (this.editContent.trim() && this.editContent !== this.card.content) {
      this.edit.emit({ ...this.card, content: this.editContent.trim() });
    }
    this.isEditing.set(false);
  }

  cancelEdit() {
    this.isEditing.set(false);
    this.editContent = '';
  }

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.card);
  }
}
