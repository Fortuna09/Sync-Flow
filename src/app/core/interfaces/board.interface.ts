/**
 * Interface que representa um Quadro (Board) Kanban.
 * Espelha a tabela `boards` do Supabase.
 */
export interface Board {
  id: number;
  title: string;
  bg_color: string;
  created_at?: string;
  user_id?: string;
  organization_id: string;
}

/**
 * Interface que representa uma Lista dentro de um Board.
 * Espelha a tabela `lists` do Supabase.
 */
export interface List {
  id: number;
  title: string;
  position: number;
  board_id: number;
  created_at?: string;
  created_by?: string;
  cards?: Card[];
}

/**
 * Interface que representa um Card (tarefa) dentro de uma Lista.
 * Espelha a tabela `cards` do Supabase.
 */
export interface Card {
  id: number;
  content: string;
  description?: string;
  position: number;
  list_id: number;
  created_at?: string;
  created_by?: string;
  comments?: Comment[];
}

/**
 * Interface que representa um Comentário em um Card.
 * Espelha a tabela `comments` do Supabase.
 */
export interface Comment {
  id: number;
  card_id: number;
  content: string;
  created_at: string;
  user_id: string;
  user?: {
    first_name?: string;
    last_name?: string;
    avatar_url?: string;
  };
}

/**
 * DTO para criação de uma nova Lista.
 */
export interface CreateListDto {
  title: string;
  board_id: number;
  position?: number;
}

/**
 * DTO para criação de um novo Card.
 */
export interface CreateCardDto {
  content: string;
  list_id: number;
  description?: string;
  position?: number;
}

/**
 * DTO para atualização de uma Lista.
 */
export interface UpdateListDto {
  title?: string;
  position?: number;
}

/**
 * DTO para atualização de um Card.
 */
export interface UpdateCardDto {
  content?: string;
  description?: string;
  position?: number;
  list_id?: number;
}
