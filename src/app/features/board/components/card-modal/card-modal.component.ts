import { Component, EventEmitter, Input, Output, inject, signal, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Card, Comment } from '../../models/board.model';
import { CardService } from '../../api/card.service';
import { ProfileService } from '../../../../core/auth/profile.service';

/**
 * Modal de detalhes do card.
 * Permite edição de título, descrição e gerenciamento de comentários.
 */
@Component({
  selector: 'app-card-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-modal.component.html',
  styleUrl: './card-modal.component.scss'
})
export class CardModalComponent implements OnInit {
  private elementRef = inject(ElementRef);
  private cardService = inject(CardService);
  private profileService = inject(ProfileService);

  @Input({ required: true }) card!: Card;
  @Input({ required: true }) listName!: string;
  
  @Output() closeEvent = new EventEmitter<void>();
  @Output() updateEvent = new EventEmitter<{ title?: string; description?: string }>();
  @Output() deleteEvent = new EventEmitter<void>();

  // Creator Info
  creatorName = signal<string>('');

  // Title Editing
  isEditingTitle = signal(false);
  editTitle = '';

  // Description Editing
  isEditingDescription = signal(false);
  editDescription = '';

  // Comments
  comments = signal<Comment[]>([]);
  newComment = '';

  ngOnInit() {
    this.loadComments();
    this.loadCreator();
  }

  async loadCreator() {
    if (this.card.created_by) {
      const profile = await this.profileService.getProfileById(this.card.created_by);
      if (profile) {
        const name = profile.first_name 
          ? `${profile.first_name} ${profile.last_name || ''}`.trim()
          : 'Usuário desconhecido';
        this.creatorName.set(name);
      } else {
        this.creatorName.set('Usuário desconhecido');
      }
    }
  }

  async loadComments() {
    try {
      const data = await this.cardService.getComments(this.card.id);
      this.comments.set(data);
    } catch (error) {
      console.error('Failed to load comments', error);
    }
  }

  async addComment() {
    if (!this.newComment.trim()) return;
    
    try {
      const added = await this.cardService.addComment(this.card.id, this.newComment);
      if (added) {
        this.comments.update(prev => [...prev, added]);
        this.newComment = '';
      } else {
        this.newComment = '';
      }
    } catch (error) {
      console.error('Failed to add comment', error);
    }
  }

  async deleteComment(id: number) {
    if (!confirm('Excluir comentário?')) return;
    
    try {
      await this.cardService.deleteComment(id);
      this.comments.update(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete comment', error);
    }
  }

  adjustTextareaHeight(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto'; 
    textarea.style.height = textarea.scrollHeight + 'px';
  }

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
