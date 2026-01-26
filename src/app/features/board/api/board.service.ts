import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/tokens/supabase.token';
import { Board } from '../models/board.model';

export { Board } from '../models/board.model';

/**
 * Serviço responsável por operações CRUD de Boards (quadros Kanban).
 * Interage com a tabela `boards` do Supabase.
 */
@Injectable({ providedIn: 'root' })
export class BoardService {
  private supabase = inject(SUPABASE_CLIENT);

  /** Busca todos os boards de uma organização específica */
  async getBoardsByOrganization(organizationId: string): Promise<Board[]> {
    const { data, error } = await this.supabase
      .from('boards')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar boards:', error);
      throw error;
    }
    return data as Board[];
  }

  // 2. Buscar todos os boards (legacy - para compatibilidade)
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

  // 3. Criar um novo board dentro de uma organização
  async createBoard(title: string, color: string = 'bg-blue-600', organizationId?: string) {
    // Pega o usuário atual para garantir a autoria
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const insertData: any = {
      title,
      bg_color: color,
      user_id: user.id
    };

    // Adicionar organization_id se fornecido
    if (organizationId) {
      insertData.organization_id = organizationId;
    }

    const { data, error } = await this.supabase
      .from('boards')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}