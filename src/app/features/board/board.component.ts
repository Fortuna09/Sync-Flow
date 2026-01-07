import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth/auth.service';
import { BoardService, Board } from './api/board.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col">
      <header class="bg-white border-b px-6 py-4 flex justify-between items-center sticky top-0 z-10">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">S</div>
          <h1 class="text-xl font-bold text-gray-800">SyncFlow</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ auth.currentUser()?.email }}</span>
          <button (click)="auth.signOut()" class="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1 rounded transition">
            Sair
          </button>
        </div>
      </header>

      <main class="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-bold text-gray-900">Seus Quadros</h2>
          
          <button (click)="createTestBoard()" 
                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2">
            <span>+</span> Novo Quadro
          </button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          @if (isLoading()) {
            <div class="animate-pulse h-32 bg-gray-200 rounded-xl"></div>
            <div class="animate-pulse h-32 bg-gray-200 rounded-xl"></div>
          }

          @for (board of boards(); track board.id) {
            <div [class]="'group relative h-32 rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden ' + board.bg_color">
              <div class="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
              <h3 class="relative text-white font-bold text-lg shadow-black/50">{{ board.title }}</h3>
            </div>
          } @empty {
            @if (!isLoading()) {
              <div class="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                <p class="text-gray-500 text-lg">Você ainda não tem quadros.</p>
                <button (click)="createTestBoard()" class="text-indigo-600 font-medium hover:underline mt-2">
                  Crie o primeiro agora
                </button>
              </div>
            }
          }
        </div>
      </main>
    </div>
  `
})
export class BoardComponent implements OnInit {
  auth = inject(AuthService);
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

  // Ação Temporária de Criação
  async createTestBoard() {
    const title = prompt('Qual o nome do projeto?');
    if (!title) return;

    // Cores aleatórias para ficar bonito
    const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-rose-600', 'bg-amber-500'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    try {
      await this.boardService.createBoard(title, randomColor);
      this.loadBoards(); // Recarrega para mostrar o novo item
    } catch (error) {
      alert('Erro ao criar quadro.');
    }
  }
}