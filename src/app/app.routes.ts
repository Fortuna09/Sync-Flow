import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/landing/landing.component')
        .then(m => m.LandingComponent)
  },
  { path: 'login', component: LoginComponent },
  { 
    path: 'register', 
    loadComponent: () => import('./features/auth/register/register.component')
        .then(m => m.RegisterComponent)
  },
  // Organizações
  {
    path: 'organizations',
    loadComponent: () => import('./features/organization/organization-list/organization-list.component')
        .then(m => m.OrganizationListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'organizations/new',
    loadComponent: () => import('./features/organization/create-organization/create-organization.component')
        .then(m => m.CreateOrganizationComponent),
    canActivate: [authGuard]
  },
  // Boards dentro de uma organização
  {
    path: 'org/:orgSlug/boards',
    loadComponent: () => import('./features/board/board.component')
        .then(m => m.BoardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'org/:orgSlug/board/:id',
    loadComponent: () => import('./features/board/pages/board-detail/board-detail.component')
        .then(m => m.BoardDetailComponent),
    canActivate: [authGuard]
  },
  // Rotas legadas (manter compatibilidade por enquanto)
  { 
    path: 'board', 
    redirectTo: 'organizations',
    pathMatch: 'full'
  },
  {
    path: 'board/:id',
    loadComponent: () => import('./features/board/pages/board-detail/board-detail.component')
        .then(m => m.BoardDetailComponent),
    canActivate: [authGuard]
  }
];