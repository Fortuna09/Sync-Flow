/**
 * Interface que representa uma Organização (workspace/time).
 * Espelha a tabela `organizations` do Supabase.
 */
export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_personal: boolean;
  created_at: string;
}

/**
 * Interface que representa a relação entre usuário e organização.
 * Espelha a tabela `organization_members` do Supabase.
 */
export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: OrganizationRole;
  created_at: string;
}

/**
 * Papéis disponíveis dentro de uma organização (RBAC).
 */
export type OrganizationRole = 'owner' | 'admin' | 'member' | 'viewer';
