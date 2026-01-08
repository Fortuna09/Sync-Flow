import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, Session } from '@supabase/supabase-js';
import { toObservable } from '@angular/core/rxjs-interop';
import { SUPABASE_CLIENT } from '../tokens/supabase.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SUPABASE_CLIENT);
  private router = inject(Router);

  // 1. Estados
  private _currentUser = signal<User | null>(null);
  private _session = signal<Session | null>(null);
  
  // NOVO: Flag para saber se o Supabase já respondeu a primeira vez
  private _isAuthLoaded = signal<boolean>(false);

  // 2. Públicos
  public currentUser = this._currentUser.asReadonly();
  public session = this._session.asReadonly();
  public isAuthLoaded = this._isAuthLoaded.asReadonly();

  // NOVO: Transformamos o signal em Observable para usar no Guard
  public authLoaded$ = toObservable(this._isAuthLoaded);

  constructor() {
    console.log('1. AuthService: Construtor iniciado. Esperando Supabase...');

    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log('2. AuthService: Supabase respondeu!', event); 
      console.log('3. Sessão encontrada:', session ? 'SIM (Usuario Logado)' : 'NÃO (Null)');
      
      this._session.set(session);
      this._currentUser.set(session?.user ?? null);
      
      this._isAuthLoaded.set(true); 
      console.log('4. AuthService: Flag isAuthLoaded setada para TRUE');
    });
  }

  async signIn(email: string, pass: string) {
    const { error } = await this.supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
    // Redireciona para organizações (lista ou criar se não tiver)
    this.router.navigate(['/organizations']);
  }

  async signUp(email: string, pass: string, metadata?: { first_name?: string; last_name?: string }) {
    const { error } = await this.supabase.auth.signUp({
      email,
      password: pass,
      options: {
        data: metadata
      }
    });
    if (error) throw error;
  }

  async signOut() {
    await this.supabase.auth.signOut();
    this.router.navigate(['/login']);
  }
}