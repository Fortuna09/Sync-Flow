import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth.service';
import { filter, map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Retornamos um Observable que o Angular vai "assinar" e esperar completar
  return authService.authLoaded$.pipe(
    // 1. PARE AQUI até que isAuthLoaded seja true (ignora o false inicial)
    filter(loaded => loaded), 
    
    // 2. Assim que passar um "true", finaliza a observação (não fica escutando pra sempre)
    take(1), 
    
    // 3. Agora que sabemos que carregou, verificamos a sessão
    map(() => {
      const isLogged = !!authService.session();
      
      if (isLogged) {
        return true; // Pode passar
      } else {
        // Não está logado? Redireciona e bloqueia
        return router.createUrlTree(['/login']);
      }
    })
  );
};