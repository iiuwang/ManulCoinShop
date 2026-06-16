import { Routes } from '@angular/router';
import { CatalogProducts } from './pages/catalog_products/catalog_products';
import { Auth } from './pages/auth/auth';

export const routes: Routes = [
  {
    path: '',
    component: Auth,
  },
  {
    path: 'catalog_products',
    component: CatalogProducts,
  }
];
