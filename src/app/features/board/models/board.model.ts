/**
 * Tipagens centralizadas do módulo Board
 * 
 * Essas interfaces espelham EXATAMENTE as tabelas do Supabase.
 * Isso garante type-safety entre o frontend e o banco.
 */

export interface Board {
  id: number;
  title: string;
  bg_color: string;
  created_at?: string;
  user_id?: string;           // Quem criou o board
  organization_id: string;    // Organização dona do board
}

export interface List {
  id: number;
  title: string;
  position: number;
  board_id: number;
  created_at?: string;
  created_by?: string;        // Quem criou a lista
  cards?: Card[];             // Cards carregados junto com a lista
}

/**
 * Card representa uma tarefa/cartão dentro de uma lista.
 * 
 * ATENÇÃO: O campo principal é "content" (não "title") 
 * para corresponder à tabela do Supabase.
 */
export interface Card {
  id: number;
  content: string;            // Texto principal do card
  description?: string;       // Descrição detalhada (opcional)
  position: number;
  list_id: number;
  created_at?: string;
  created_by?: string;        // Quem criou o card
  comments?: Comment[];       // Comentários carregados sob demanda
}

export interface Comment {
  id: number;
  card_id: number;
  content: string;
  created_at: string;
  user_id: string; // ID do usuário que comentou
  user?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

// DTOs para criação
export interface CreateListDto {
  title: string;
  board_id: number;
  position?: number;
}

export interface CreateCardDto {
  content: string;        // Mudou de title para content
  list_id: number;
  description?: string;
  position?: number;
}

// DTOs para atualização
export interface UpdateListDto {
  title?: string;
  position?: number;
}

export interface UpdateCardDto {
  content?: string;       // Mudou de title para content
  description?: string;
  position?: number;
  list_id?: number; // Para mover entre listas
}
