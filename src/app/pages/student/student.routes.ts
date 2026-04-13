import { Routes } from '@angular/router';
import { StudentLayoutComponent } from '../../layouts/student-layout/student-layout.component';

export const STUDENT_ROUTES: Routes = [
  {
    path: '',
    component: StudentLayoutComponent,
    children: [
      { path: 'assessment', loadComponent: () => import('./assessment/assessment').then(m => m.AssessmentComponent) },
      { path: 'payment', loadComponent: () => import('./payment/payment').then(m => m.PaymentComponent) },
      { path: 'submission', loadComponent: () => import('./submission/submission').then(m => m.SubmissionComponent) },
{ path: 'dashboard', loadComponent: () => import('./student-dashboard/student-dashboard').then(m => m.StudentDashboardComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

