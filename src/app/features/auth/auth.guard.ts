import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { filter, map, take } from 'rxjs';
import { AuthService } from '../../core/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  console.log('🛡️ Guard: Iniciando verificação...');

  return authService.authLoaded$.pipe(
    filter(loaded => {
      console.log('🛡️ Guard: isAuthLoaded valendo:', loaded);
      return loaded; // Só passa se for true
    }),
    take(1),
    map(() => {
      const isLogged = !!authService.session();
      console.log('🛡️ Guard: Decisão final. Está logado?', isLogged);
      
      if (isLogged) return true;
      
      console.log('🛡️ Guard: Bloqueado! Redirecionando para Login.');
      return router.createUrlTree(['/login']);
    })
  );
};