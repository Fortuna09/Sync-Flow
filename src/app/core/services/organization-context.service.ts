import { Injectable, signal, computed } from '@angular/core';
import { Organization } from '../interfaces';

/**
 * Serviço responsável por gerenciar o contexto da organização atual.
 * Mantém estado reativo com Signals e persiste no localStorage para reload.
 */
@Injectable({ providedIn: 'root' })
export class OrganizationContextService {
  private readonly STORAGE_KEY = 'currentOrganization';

  /** Estado interno da organização atual */
  private _currentOrganization = signal<Organization | null>(this.loadFromStorage());

  /** Exposição read-only da organização atual */
  readonly currentOrganization = this._currentOrganization.asReadonly();

  /** Computed para obter apenas o ID */
  readonly currentOrganizationId = computed(() => this._currentOrganization()?.id ?? null);

  /** Computed para obter apenas o slug */
  readonly currentOrganizationSlug = computed(() => this._currentOrganization()?.slug ?? null);

  /** Computed para verificar se há organização selecionada */
  readonly hasOrganization = computed(() => this._currentOrganization() !== null);

  /**
   * Define a organização atual.
   * Persiste no localStorage para manter após reload.
   */
  setCurrentOrganization(org: Organization): void {
    this._currentOrganization.set(org);
    this.saveToStorage(org);
  }

  /**
   * Limpa a organização atual (logout, troca de conta, etc).
   */
  clearCurrentOrganization(): void {
    this._currentOrganization.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Carrega organização do localStorage (chamado no constructor).
   */
  private loadFromStorage(): Organization | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Salva organização no localStorage.
   */
  private saveToStorage(org: Organization): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(org));
    } catch {
      // Silently fail if localStorage is not available
    }
  }
}
