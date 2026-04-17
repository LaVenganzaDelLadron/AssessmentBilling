import { Routes } from '@angular/router';
import { AdminGuard, TeacherGuard, StudentGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing').then(m => m.LandingComponent)
  },

  { path: 'auth', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'signup',
    loadComponent: () =>
      import('./features/auth/pages/register/register').then(m => m.Register)
  },

  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(m => m.LoginComponent)
  },

  {
    path: 'admin',
    canActivate: [AdminGuard],
    loadChildren: () =>
      import('./features/admin/admin.route').then(m => m.adminRoutes)
  },

  {
    path: 'teacher',
    canActivate: [TeacherGuard],
    loadChildren: () =>
      import('./features/teacher/teacher.route').then(m => m.teacherRoutes)
  },

  {
    path: 'student',
    canActivate: [StudentGuard],
    loadChildren: () =>
      import('./features/student/student.route').then(m => m.studentRoutes)
  },

  { path: '**', redirectTo: '' }
];
