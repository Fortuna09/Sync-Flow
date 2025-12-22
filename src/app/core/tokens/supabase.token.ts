import { InjectionToken } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SupabaseClient', {
  providedIn: 'root',
  factory: () => {
    return createClient(environment.supabaseUrl, environment.supabaseKey);
  }
});