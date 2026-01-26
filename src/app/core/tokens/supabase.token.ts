import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

/**
 * Token de injeção de dependência para o cliente Supabase.
 * Permite injetar o SupabaseClient em qualquer serviço via `inject(SUPABASE_CLIENT)`.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SupabaseClient', {
  providedIn: 'root',
  factory: () => createClient(environment.supabaseUrl, environment.supabaseKey)
});