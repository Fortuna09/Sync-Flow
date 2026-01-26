import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, Session } from '@supabase/supabase-js';
import { toObservable } from '@angular/core/rxjs-interop';
import { SUPABASE_CLIENT } from '../tokens/supabase.token';

/**
 * Serviço de autenticação responsável por gerenciar o estado do usuário.
 * Utiliza Signals para reatividade e integra com Supabase Auth.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SUPABASE_CLIENT);
  private router = inject(Router);

  /** Estado interno do usuário atual */
  private _currentUser = signal<User | null>(null);
  /** Estado interno da sessão */
  private _session = signal<Session | null>(null);
  /** Flag que indica se o Supabase já respondeu ao menos uma vez */
  private _isAuthLoaded = signal<boolean>(false);

  /** Exposição read-only dos estados */
  public currentUser = this._currentUser.asReadonly();
  public session = this._session.asReadonly();
  public isAuthLoaded = this._isAuthLoaded.asReadonly();

  /** Observable para uso em Guards (aguarda carregamento inicial) */
  public authLoaded$ = toObservable(this._isAuthLoaded);

  constructor() {
    this.supabase.auth.onAuthStateChange((event, session) => {
      this._session.set(session);
      this._currentUser.set(session?.user ?? null);
      this._isAuthLoaded.set(true);
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