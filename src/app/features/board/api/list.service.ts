import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/tokens/supabase.token';
import { List, CreateListDto, UpdateListDto } from '../models/board.model';

/**
 * Serviço responsável por operações CRUD de Listas dentro de um Board.
 * Interage com a tabela `lists` do Supabase.
 */
@Injectable({ providedIn: 'root' })
export class ListService {
  private supabase = inject(SUPABASE_CLIENT);

  /** Busca todas as listas de um board com seus cards ordenados */
  async getListsByBoardId(boardId: number): Promise<List[]> {
    const { data, error } = await this.supabase
      .from('lists')
      .select('*, cards(*)')
      .eq('board_id', boardId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Erro ao buscar listas:', error);
      throw error;
    }

    // Ordenar os cards dentro de cada lista
    return (data as List[]).map(list => ({
      ...list,
      cards: list.cards?.sort((a, b) => a.position - b.position) || []
    }));
  }

  /**
   * Criar uma nova lista
   */
  async createList(dto: CreateListDto): Promise<List> {
    // Buscar a maior posição atual para colocar no final
    const { data: existing } = await this.supabase
      .from('lists')
      .select('position')
      .eq('board_id', dto.board_id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existing && existing.length > 0 
      ? existing[0].position + 1 
      : 0;

    const { data, error } = await this.supabase
      .from('lists')
      .insert({
        title: dto.title,
        board_id: dto.board_id,
        position: dto.position ?? nextPosition
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar lista:', error);
      throw error;
    }

    return { ...data, cards: [] } as List;
  }

  /**
   * Atualizar uma lista
   */
  async updateList(id: number, dto: UpdateListDto): Promise<List> {
    const { data, error } = await this.supabase
      .from('lists')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar lista:', error);
      throw error;
    }

    return data as List;
  }

  /**
   * Excluir uma lista (cards são excluídos em cascata)
   */
  async deleteList(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('lists')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir lista:', error);
      throw error;
    }
  }

  /**
   * Reordenar listas (atualiza posições em batch)
   */
  async reorderLists(lists: { id: number; position: number }[]): Promise<void> {
    const updates = lists.map(list =>
      this.supabase
        .from('lists')
        .update({ position: list.position })
        .eq('id', list.id)
    );

    await Promise.all(updates);
  }
}
