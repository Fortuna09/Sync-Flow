import { Component, EventEmitter, Input, Output, inject, signal, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card } from '../../models/board.model';

@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-modal.component.html',
  styleUrl: './card-modal.component.scss'
})
export class CardModalComponent {
  private elementRef = inject(ElementRef);

  @Input({ required: true }) card!: Card;
  @Input({ required: true }) listName!: string;
  
  @Output() closeEvent = new EventEmitter<void>();
  @Output() updateEvent = new EventEmitter<{ title?: string; description?: string }>();
  @Output() deleteEvent = new EventEmitter<void>();

  // Title Editing
  isEditingTitle = signal(false);
  editTitle = '';

  // Description Editing
  isEditingDescription = signal(false);
  editDescription = '';

  close() {
    this.closeEvent.emit();
  }

  // --- Title Logic ---

  startEditTitle() {
    this.editTitle = this.card.content; // assuming content is title based on previous context
    this.isEditingTitle.set(true);
    setTimeout(() => {
      const input = this.elementRef.nativeElement.querySelector('input');
      if (input) {
        input.focus();
        input.select();
      }
    });
  }

  saveTitle() {
    if (this.editTitle.trim() && this.editTitle !== this.card.content) {
      this.updateEvent.emit({ title: this.editTitle.trim() });
    }
    this.isEditingTitle.set(false);
  }

  cancelEditTitle() {
    this.isEditingTitle.set(false);
  }

  // --- Description Logic ---

  startEditDescription() {
    this.editDescription = this.card.description || '';
    this.isEditingDescription.set(true);
    setTimeout(() => {
      const textarea = this.elementRef.nativeElement.querySelector('textarea');
      if (textarea) textarea.focus();
    });
  }

  saveDescription() {
    if (this.editDescription !== this.card.description) {
      this.updateEvent.emit({ description: this.editDescription });
    }
    this.isEditingDescription.set(false);
  }

  cancelEditDescription() {
    this.isEditingDescription.set(false);
  }

  // --- Actions ---

  deleteCard() {
    if (confirm('Tem certeza que deseja excluir este cartão?')) {
      this.deleteEvent.emit();
    }
  }
}
