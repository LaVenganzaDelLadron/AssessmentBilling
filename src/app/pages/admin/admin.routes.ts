import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'school', loadComponent: () => import('./school/school').then(m => m.School) },
      { path: 'billing', loadComponent: () => import('./billing/billing').then(m => m.Billing) },
      { path: 'classes', loadComponent: () => import('./classes/classes').then(m => m.Classes) },
      { path: 'enrollment', loadComponent: () => import('./enrollment/enrollment').then(m => m.Enrollment) },
      { path: 'fees', loadComponent: () => import('./fees/fees').then(m => m.Fees) },
      { path: 'subject', loadComponent: () => import('./subject/subject').then(m => m.Subject) },
      { path: 'year', loadComponent: () => import('./year/year').then(m => m.Year) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
