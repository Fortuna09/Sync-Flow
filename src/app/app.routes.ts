import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: 'board', pathMatch: 'full' },
  { 
    path: 'board', 
    loadComponent: () => import('./features/board/board.component')
        .then(m => m.BoardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'board/:id',
    loadComponent: () => import('./features/board/pages/board-detail/board-detail.component')
        .then(m => m.BoardDetailComponent),
    canActivate: [authGuard]
  }
];