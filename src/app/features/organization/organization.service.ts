import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../../core/tokens/supabase.token';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  is_personal: boolean;
  created_at: string;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  created_at: string;
}

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
