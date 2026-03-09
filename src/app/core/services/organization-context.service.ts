import { Injectable, signal, computed } from '@angular/core';
import { Organization } from '../interfaces';

@Injectable({ providedIn: 'root' })
export class OrganizationContextService {
  private readonly STORAGE_KEY = 'currentOrganization';
  private _currentOrganization = signal<Organization | null>(this.loadFromStorage());

  readonly currentOrganization = this._currentOrganization.asReadonly();
  readonly currentOrganizationId = computed(() => this._currentOrganization()?.id ?? null);
  readonly currentOrganizationSlug = computed(() => this._currentOrganization()?.slug ?? null);
  readonly hasOrganization = computed(() => this._currentOrganization() !== null);

  setCurrentOrganization(org: Organization): void {
    this._currentOrganization.set(org);
    this.saveToStorage(org);
  }

  clearCurrentOrganization(): void {
    this._currentOrganization.set(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private loadFromStorage(): Organization | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private saveToStorage(org: Organization): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(org));
    } catch {
      // localStorage indisponível
    }
  }
}
