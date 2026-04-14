import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./admin-dashboard/admin-dashboard').then(m => m.AdminDashboardComponent) },
      { path: 'billing', loadComponent: () => import('./billing/billing').then(m => m.Billing) },
      { path: 'classes', loadComponent: () => import('./classes/classes').then(m => m.Classes) },
      { path: 'enrollment', loadComponent: () => import('./enrollment/enrollment').then(m => m.Enrollment) },
      { path: 'fees', loadComponent: () => import('./fees/fees').then(m => m.Fees) },
      { path: 'subject', loadComponent: () => import('./subject/subject').then(m => m.Subject) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
