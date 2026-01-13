import { Injectable, inject } from '@angular/core';
import { SUPABASE_CLIENT } from '../tokens/supabase.token';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  has_created_org: boolean;
  created_at: string;
  updated_at: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private supabase = inject(SUPABASE_CLIENT);

  // Buscar perfil do usuário logado
  async getMyProfile(): Promise<Profile | null> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Erro ao buscar profile:', error);
      return null;
    }
    
    return data;
  }

  // Buscar perfil por ID
  async getProfileById(userId: string): Promise<Profile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // console.error(`Erro ao buscar profile do user ${userId}:`, error); // Optional logging
      return null;
    }
    
    return data;
  }

  // Verificar se usuário já criou organização
  async hasCreatedOrg(): Promise<boolean> {
    const profile = await this.getMyProfile();
    return profile?.has_created_org ?? false;
  }

  // Marcar que usuário criou primeira organização
  async markOrgCreated(): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .from('profiles')
      .update({ has_created_org: true, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
  }

  // Atualizar perfil
  async updateProfile(data: Partial<Profile>): Promise<void> {
    const { data: { user } } = await this.supabase.auth.getUser();
    if (!user) throw new Error('Usuário não autenticado');

    const { error } = await this.supabase
      .from('profiles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (error) throw error;
  }
}
