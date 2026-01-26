import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../../core/tokens/supabase.token';
import { Card, CreateCardDto, UpdateCardDto, Comment } from '../models/board.model';

/**
 * Serviço responsável por operações CRUD de Cards e Comentários.
 * Interage com as tabelas `cards` e `comments` do Supabase.
 */
@Injectable({ providedIn: 'root' })
export class CardService {
  private supabase = inject(SUPABASE_CLIENT);

  /** Busca todos os cards de uma lista ordenados por posição */
  async getCardsByListId(listId: number): Promise<Card[]> {
    const { data, error } = await this.supabase
      .from('cards')
      .select('*')
      .eq('list_id', listId)
      .order('position', { ascending: true });

    if (error) {
      console.error('Erro ao buscar cards:', error);
      throw error;
    }

    return data as Card[];
  }

  /**
   * Criar um novo card
   */
  async createCard(dto: CreateCardDto): Promise<Card> {
    // Buscar a maior posição atual para colocar no final
    const { data: existing } = await this.supabase
      .from('cards')
      .select('position')
      .eq('list_id', dto.list_id)
      .order('position', { ascending: false })
      .limit(1);

    const nextPosition = existing && existing.length > 0 
      ? existing[0].position + 1 
      : 0;

    const { data, error } = await this.supabase
      .from('cards')
      .insert({
        content: dto.content,
        list_id: dto.list_id,
        description: dto.description || null,
        position: dto.position ?? nextPosition
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar card:', error);
      throw error;
    }

    return data as Card;
  }

  /**
   * Atualizar um card
   */
  async updateCard(id: number, dto: UpdateCardDto): Promise<Card> {
    const { data, error } = await this.supabase
      .from('cards')
      .update(dto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar card:', error);
      throw error;
    }

    return data as Card;
  }

  /**
   * Excluir um card
   */
  async deleteCard(id: number): Promise<void> {
    const { error } = await this.supabase
      .from('cards')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao excluir card:', error);
      throw error;
    }
  }

  /**
   * Mover card para outra lista e/ou posição
   */
  async moveCard(cardId: number, newListId: number, newPosition: number): Promise<Card> {
    const { data, error } = await this.supabase
      .from('cards')
      .update({ 
        list_id: newListId, 
        position: newPosition 
      })
      .eq('id', cardId)
      .select()
      .single();

    if (error) {
      console.error('Erro ao mover card:', error);
      throw error;
    }

    return data as Card;
  }

  /**
   * Reordenar cards dentro de uma lista (atualiza posições em batch)
   */
  async reorderCards(cards: { id: number; position: number; list_id: number }[]): Promise<void> {
    const updates = cards.map(card =>
      this.supabase
        .from('cards')
        .update({ position: card.position, list_id: card.list_id })
        .eq('id', card.id)
    );

    await Promise.all(updates);
  }

  // --- Comentários ---

  async getComments(cardId: number): Promise<Comment[]> {
    const { data, error } = await this.supabase
      .from('comments')
      .select(`
        *,
        user:profiles (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('card_id', cardId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar comentários:', error);
      return []; 
    }
    
    // Mapear para adequar a estrutura se necessário, ou usar direto
    return data as any[];
  }

  async addComment(cardId: number, content: string): Promise<any> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('comments')
      .insert({
        card_id: cardId,
        content: content,
        user_id: user.id
      })
      .select(`
        *,
        user:profiles (
          first_name,
          last_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
    return data;
  }

  async deleteComment(commentId: number): Promise<void> {
    const { error } = await this.supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Erro ao excluir comentário:', error);
      throw error;
    }
  }
}
