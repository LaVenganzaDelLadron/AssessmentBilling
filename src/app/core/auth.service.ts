import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/assessment/environment';
import { AlertService } from './alert.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private token = signal<string | null>(null);
  private role = signal<string | null>(null);
  private user = signal<any>(null);

  isAuthenticated = signal(false);
  currentRole = signal<string>('');

  constructor(private router: Router, private http: HttpClient, private alertService: AlertService) {
    const storedToken = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (storedToken && storedRole) {
      this.token.set(storedToken);
      this.role.set(storedRole);
      this.isAuthenticated.set(true);
      this.currentRole.set(storedRole);
    }
  }

  login(credentials: {email: string, password: string}) {
    this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).subscribe({
      next: (response) => {
        const token = response?.token ?? response?.access_token ?? null;
        const user = response?.user ?? null;
        const role = (response?.role ?? user?.role ?? '').toString().toLowerCase();

        if (!token || !role) {
          console.error('Login response missing token or role:', response);
          this.alertService.warning('Login response is incomplete. Please contact support.', 'Warning');
          return;
        }

        localStorage.setItem('token', token);
        localStorage.setItem('role', role);

        this.token.set(token);
        this.role.set(role);
        this.user.set(user);
        this.isAuthenticated.set(true);
        this.currentRole.set(role);
        this.alertService.success('Welcome back');

        switch (role) {
          case 'admin':
            this.router.navigate(['/admin/dashboard']);
            break;
          case 'student':
            this.router.navigate(['/student/dashboard']);
            break;
          case 'teacher':
            this.router.navigate(['/teacher/dashboard']);
            break;
          default:
            this.router.navigate(['/auth']);
            break;
        }
      },
      error: (error) => {
        console.error('Login failed:', error);
        const status = error?.status;

        if (status === 401) {
          this.alertService.error('Invalid email or password', 'Sign in failed');
          return;
        }

        if (status === 422) {
          const validationErrors = error?.error?.errors;
          let firstMessage = 'Validation error';

          if (validationErrors && typeof validationErrors === 'object') {
            const firstKey = Object.keys(validationErrors)[0];
            if (firstKey) {
              const value = validationErrors[firstKey];
              if (Array.isArray(value) && value.length > 0) {
                firstMessage = String(value[0]);
              } else if (typeof value === 'string') {
                firstMessage = value;
              }
            }
          } else if (error?.error?.message) {
            firstMessage = String(error.error.message);
          }

          this.alertService.warning(firstMessage, 'Warning');
          return;
        }

        this.alertService.error('Server unavailable, try again', 'Error');
      }
    });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    this.token.set(null);
    this.role.set(null);
    this.isAuthenticated.set(false);
    this.currentRole.set('');
    this.alertService.info('You have been logged out.');
    this.router.navigate(['/auth']);
  }

  getToken(): string | null {
    return this.token();
  }

  hasRole(requiredRole: string): boolean {
    return this.role() === requiredRole;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  isStudent(): boolean {
    return this.hasRole('student');
  }

  isTeacher(): boolean {
    return this.hasRole('teacher');
  }
}
