import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BoardService, Board } from './api/board.service';
import { TopbarComponent } from '../../shared/ui/topbar/topbar.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, RouterModule, TopbarComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  private boardService = inject(BoardService);

  // Estados Reativos (Signals)
  boards = signal<Board[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.loadBoards();
  }

  async loadBoards() {
    this.isLoading.set(true);
    try {
      const data = await this.boardService.getBoards();
      this.boards.set(data);
    } catch (error) {
      console.error(error);
      alert('Erro ao carregar os quadros.');
    } finally {
      this.isLoading.set(false);
    }
  }

  // Mapear classes Tailwind para gradientes CSS
  getBoardGradient(bgColor: string): string {
    const colorMap: Record<string, string> = {
      'bg-blue-600': 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      'bg-emerald-600': 'linear-gradient(135deg, #059669 0%, #047857 100%)',
      'bg-purple-600': 'linear-gradient(135deg, #9333ea 0%, #7c3aed 100%)',
      'bg-rose-600': 'linear-gradient(135deg, #e11d48 0%, #be123c 100%)',
      'bg-amber-500': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'bg-indigo-600': 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)'
    };
    return colorMap[bgColor] || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }

  // Criar novo quadro
  async createTestBoard(): Promise<void> {
    const title = prompt('Qual o nome do quadro?');
    if (!title) return;

    // Cores aleatórias
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      await this.boardService.createBoard(title, randomColor);
      this.loadBoards();
    } catch (error) {
      console.error('Erro ao criar quadro:', error);
      alert('Erro ao criar quadro.');
    }
  }
}