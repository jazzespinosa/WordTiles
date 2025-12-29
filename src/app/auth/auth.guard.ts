import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      const isAuth = user ? true : false;
      if (isAuth) {
        return true;
      } else {
        return router.createUrlTree(['/auth']);
      }
    }),
  );
};

export const loginGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.user$.pipe(
    take(1),
    map((user) => {
      const isAuth = user ? true : false;
      if (isAuth) {
        return router.createUrlTree(['/home']);
      } else {
        return true;
      }
    }),
  );
};
