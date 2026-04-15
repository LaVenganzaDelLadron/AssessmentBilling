import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/features/landing/landing').then(m => m.LandingComponent) },
  { path: 'auth', redirectTo: 'login', pathMatch: 'full' },
  { path: 'signup', loadComponent: () => import('./pages/features/auth/pages/register/register').then(m => m.Register) },
  { path: 'login', loadComponent: () => import('./pages/features/auth/pages/login/login').then(m => m.LoginComponent) },
  { path: 'landing', redirectTo: '', pathMatch: 'full' },
  { path: '**', redirectTo: '' }
];
