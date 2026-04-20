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
      },
      {
        path: 'academic-terms',
        loadComponent: () =>
          import('./pages/academic-terms/academic-terms').then(m => m.AcademicTerms)
      },
      {
        path: 'programs',
        loadComponent: () =>
          import('./pages/programs/programs').then(m => m.Programs)
      },
      {
        path: 'fee-structures',
        loadComponent: () =>
          import('./pages/fee-structures/fee-structures').then(m => m.FeeStructures)
      },
      {
        path: 'teachers',
        loadComponent: () =>
          import('./pages/teachers/teachers').then(m => m.Teachers)
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./pages/subjects/subjects').then(m => m.Subjects)
      },
      {
        path: 'official-receipts',
        loadComponent: () =>
          import('./pages/official-receipts/official-receipts').then(m => m.OfficialReceipts)
      },
      {
        path: 'refunds',
        loadComponent: () =>
          import('./pages/refunds/refunds').then(m => m.Refunds)
      },
      {
        path: 'audit-logs',
        loadComponent: () =>
          import('./pages/audit-logs/audit-logs').then(m => m.AuditLogs)
      },
      {
        path: 'assessment-breakdown',
        loadComponent: () =>
          import('./pages/assessment-breakdown/assessment-breakdown').then(m => m.AssessmentBreakdownPage)
      },
      {
        path: 'invoice-lines',
        loadComponent: () =>
          import('./pages/invoice-lines/invoice-lines').then(m => m.InvoiceLines)
      },
      {
        path: 'payment-allocations',
        loadComponent: () =>
          import('./pages/payment-allocations/payment-allocations').then(m => m.PaymentAllocations)
      },
      {
        path: 'payment-methods',
        loadComponent: () =>
          import('./pages/payment-methods/payment-methods').then(m => m.PaymentMethods)
      }
    ]
  }
];
