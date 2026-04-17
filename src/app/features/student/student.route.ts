import { Routes } from '@angular/router';
import { StudentLayoutComponent } from '../../layouts/student-layout/student-layout';

export const studentRoutes: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
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
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then(m => m.Profile)
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./pages/enrollments/enrollments').then(m => m.Enrollments)
      },
      {
        path: 'invoices',
        loadComponent: () =>
          import('./pages/invoices/invoices').then(m => m.Invoices)
      },
      {
        path: 'receipts',
        loadComponent: () =>
          import('./pages/receipts/receipts').then(m => m.Receipts)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./pages/payments/payments').then(m => m.Payments)
      },
      {
        path: 'payment-methods',
        loadComponent: () =>
          import('./pages/payment-methods/payment-methods').then(m => m.PaymentMethods)
      }
    ]
  }
];
