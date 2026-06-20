import { Routes } from '@angular/router';
import { CatalogProducts } from './pages/catalog_products/catalog_products';
import { Auth } from './pages/auth/auth';
import {authGuard} from './core/guards/auth.guard';
import {userGuard} from './core/guards/user.guard';
import { Cart } from './pages/cart/cart';
import { Orders } from './pages/orders/orders';


export const routes: Routes = [
  {
    path: '',
    component: Auth,
    canActivate: [userGuard],
  },
  {
    path: 'catalog_products',
    component: CatalogProducts,
    canActivate: [authGuard],
  },
  {
    path: 'cart',
    component: Cart,
    canActivate: [authGuard],
  },
  {
    path: 'orders',
    component: Orders,
    canActivate: [authGuard],
  }
];
