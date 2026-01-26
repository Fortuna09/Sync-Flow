import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';

/**
 * Guard funcional que protege rotas autenticadas.
 * Aguarda o carregamento inicial do Supabase antes de decidir.
 * Redireciona para /login se o usuário não estiver autenticado.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authLoaded$.pipe(
    filter(loaded => loaded),
    take(1),
    map(() => {
      const isLogged = !!authService.session();
      return isLogged ? true : router.createUrlTree(['/login']);
    })
  );
};