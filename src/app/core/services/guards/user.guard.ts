import {inject} from '@angular/core';
import {CanActivateFn, Router} from '@angular/router';
import {AuthService} from '../auth.service';

export const userGuard: CanActivateFn = ()=>{
    const authService = inject(AuthService);
    const router = inject(Router);
    if (authService.getCurrentUser() !== null){
        return router.createUrlTree(['/catalog_products']);
    }else{
        return true;
    }
}