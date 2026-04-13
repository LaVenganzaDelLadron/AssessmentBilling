import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard/auth-guard';
import { RoleGuard } from './guards/role-guard/role-guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/landing/landing').then(m => m.LandingComponent) },
  { path: 'auth', loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent) },
  { path: 'login', redirectTo: 'auth', pathMatch: 'full' },
  { path: 'landing', redirectTo: '', pathMatch: 'full' },
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./pages/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'student',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['student'] },
    loadChildren: () => import('./pages/student/student.routes').then(m => m.STUDENT_ROUTES)
  },
  {
    path: 'teacher',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['teacher'] },
    loadChildren: () => import('./pages/teacher-admin/teacher.routes').then(m => m.TEACHER_ROUTES)
  },
  { path: '**', redirectTo: '' }
];
