import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const hasSession = authService.hasSession();
    const guestOnly = route.data['guestOnly'] === true;

    if (guestOnly) {
        return hasSession ? router.createUrlTree(['/catalog_products']) : true;
    }
    return hasSession ? true : router.createUrlTree(['/']);
};
