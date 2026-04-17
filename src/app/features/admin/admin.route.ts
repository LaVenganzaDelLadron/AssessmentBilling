import { Routes } from '@angular/router';
import { AdminLayoutComponent } from '../../layouts/admin-layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'student',
        loadComponent: () =>
          import('./pages/student/student').then(m => m.Student)
      },
      {
        path: 'assessment',
        loadComponent: () =>
          import('./pages/assessment/assessment').then(m => m.Assessment)
      },
      {
        path: 'enrollment',
        loadComponent: () =>
          import('./pages/enrollment/enrollment').then(m => m.Enrollment)
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./pages/invoices/invoices').then(m => m.Invoices)
      },
      {
        path: 'payment',
        loadComponent: () =>
          import('./pages/payment/payment').then(m => m.Payment)
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./pages/report/report').then(m => m.Report)
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/settings/settings').then(m => m.Settings)
      }
    ]
  }
];
