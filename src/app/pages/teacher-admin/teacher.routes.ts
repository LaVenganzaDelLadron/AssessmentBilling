import { Routes } from '@angular/router';
import { TeacherLayoutComponent } from '../../layouts/teacher-layout/teacher-layout.component';

export const TEACHER_ROUTES: Routes = [
  {
    path: '',
    component: TeacherLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./teacher-dashboard/teacher-dashboard').then(m => m.TeacherDashboardComponent) },
      { path: 'assignment', loadComponent: () => import('./assignment/assignment').then(m => m.AssignmentComponent) },
      { path: 'grade', loadComponent: () => import('./grade/grade').then(m => m.GradeComponent) },
      { path: 'subject', loadComponent: () => import('./teacher-subject/teacher-subject').then(m => m.TeacherSubjectComponent) },
{ path: 'dashboard', loadComponent: () => import('./teacher-dashboard/teacher-dashboard').then(m => m.TeacherDashboardComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

