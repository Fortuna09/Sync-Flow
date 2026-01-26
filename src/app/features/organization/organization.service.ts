import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/tokens/supabase.token';
import { Organization, OrganizationMember } from '../../core/interfaces';

// Re-exporta para compatibilidade com imports existentes
export { Organization, OrganizationMember } from '../../core/interfaces';

/**
 * Serviço responsável por gerenciar organizações (workspaces/times).
 * Interage com as tabelas `organizations` e `organization_members` do Supabase.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private supabase = inject(SUPABASE_CLIENT);

  // Buscar organizações do usuário logado
  async getMyOrganizations(): Promise<Organization[]> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { data, error } = await this.supabase
      .from('organization_members')
      .select(`
        organization:organizations (
          id,
          name,
          slug,
          is_personal,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (error) throw error;
    
    // Extrair organizations do resultado
    return data?.map((item: any) => item.organization) || [];
  }

  // Criar nova organização
  async createOrganization(name: string, isPersonal: boolean = false): Promise<Organization> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const slug = this.generateSlug(name);

    // 1. Criar a organização
    const { data: org, error: orgError } = await this.supabase
      .from('organizations')
      .insert({ name, slug, is_personal: isPersonal })
      .select()
      .single();

    if (orgError) throw orgError;

    // 2. Adicionar o usuário como owner
    const { error: memberError } = await this.supabase
      .from('organization_members')
      .insert({
        user_id: user.id,
        organization_id: org.id,
        role: 'owner'
      });

    if (memberError) throw memberError;

    return org;
  }

  // Buscar uma organização por slug
  async getOrganizationBySlug(slug: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }

  // Buscar uma organização por ID
  async getOrganizationById(id: string): Promise<Organization | null> {
    const { data, error } = await this.supabase
      .from('organizations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  // Verificar se usuário tem pelo menos uma organização
  async hasOrganization(): Promise<boolean> {
    const orgs = await this.getMyOrganizations();
    return orgs.length > 0;
  }

  // Gerar slug a partir do nome
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')     // Substitui caracteres especiais por -
      .replace(/^-|-$/g, '');           // Remove - do início e fim
  }
}
