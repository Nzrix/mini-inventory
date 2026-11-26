import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login.component';
import { DashboardComponent } from './components/dashboard.component';
import { ProductsComponent } from './components/products.component';
import { authGuard, adminGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'products', component: ProductsComponent, canActivate: [authGuard] },
  { 
    path: 'categories', 
    loadComponent: () => import('./components/categories.component').then(m => m.CategoriesComponent),
    canActivate: [authGuard, adminGuard]
  },
  { 
    path: 'stock-transactions', 
    loadComponent: () => import('./components/stock-transactions.component').then(m => m.StockTransactionsComponent),
    canActivate: [authGuard]
  },
  { 
    path: 'reports', 
    loadComponent: () => import('./components/reports.component').then(m => m.ReportsComponent),
    canActivate: [authGuard]
  },
  { path: '**', redirectTo: '' }
];
