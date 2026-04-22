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
        path: 'profile',
        loadComponent: () =>
          import('./pages/profile/profile').then(m => m.Profile)
      },
      {
        path: 'subjects',
        loadComponent: () =>
          import('./pages/subjects/subjects').then(m => m.Subjects)
      },
      {
        path: 'academic-terms',
        loadComponent: () =>
          import('./pages/academic-terms/academic-terms').then(m => m.TeacherAcademicTermsPage)
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
      },
      {
        path: 'assessment-breakdown',
        loadComponent: () =>
          import('./pages/assessment-breakdown/assessment-breakdown').then(m => m.TeacherAssessmentBreakdownPage)
      }
    ]
  }
];
