import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/tokens/supabase.token';
import { Board } from '../models/board.model';

// Re-exportar para compatibilidade
export { Board } from '../models/board.model';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  private supabase = inject(SUPABASE_CLIENT);

  // 1. Buscar todos os boards do usuário logado
  async getBoards(): Promise<Board[]> {
    const { data, error } = await this.supabase
      .from('boards')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar boards:', error);
      throw error;
    }
    return data as Board[];
  }

  // 2. Criar um novo board
  async createBoard(title: string, color: string = 'bg-blue-600') {
    // Pega o usuário atual para garantir a autoria
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('boards')
      .insert({
        title,
        bg_color: color,
        user_id: user.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}