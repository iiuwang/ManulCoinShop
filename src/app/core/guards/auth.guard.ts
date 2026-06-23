import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const isLoggedIn = authService.getCurrentUser() !== null;
    const guestOnly = route.data['guestOnly'] === true;

    if (guestOnly){
        return isLoggedIn ? router.createUrlTree(['/catalog_products']) : true;
    } else{
        return isLoggedIn ? true : router.createUrlTree(['/']);
    }
};
