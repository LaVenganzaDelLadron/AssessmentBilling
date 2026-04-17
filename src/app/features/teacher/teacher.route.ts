import { Routes } from '@angular/router';
import { TeacherLayoutComponent } from '../../layouts/teacher-layout/teacher-layout';

export const teacherRoutes: Routes = [
  {
    path: '',
    component: TeacherLayoutComponent,
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
        path: 'subjects',
        loadComponent: () =>
          import('./pages/subjects/subjects').then(m => m.Subjects)
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./pages/enrollments/enrollments').then(m => m.Enrollments)
      },
      {
        path: 'assessments',
        loadComponent: () =>
          import('./pages/assessments/assessments').then(m => m.Assessments)
      }
    ]
  }
];
