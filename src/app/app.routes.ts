import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then(m => m.LandingComponent)
  },

  { path: 'auth', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then(m => m.Register)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.route').then(m => m.adminRoutes)
  },

  { path: '**', redirectTo: '' }
];
