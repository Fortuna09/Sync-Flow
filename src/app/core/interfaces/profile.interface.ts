/**
 * Interface que representa o perfil de um usuário no sistema.
 * Espelha a tabela `profiles` do Supabase (extensão de auth.users).
 */
export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  has_created_org: boolean;
  created_at: string;
  updated_at: string;
}
