import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/assessment/environment';

export type UserRole = 'admin' | 'teacher' | 'student' | 'guest';

export interface AuthResponse {
  token?: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
  };
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  private userRole = new BehaviorSubject<UserRole>('guest');
  private currentUser = new BehaviorSubject<User | null>(null);

  isAuthenticated$ = this.isAuthenticated.asObservable();
  userRole$ = this.userRole.asObservable();
  currentUser$ = this.currentUser.asObservable();

  constructor(private http: HttpClient) {
    this.loadAuthState();
  }

  private loadAuthState(): void {
    if (this.hasToken()) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        this.currentUser.next(user);
        this.userRole.next(user.role);
        this.isAuthenticated.next(true);
      }
    }
  }

  register(data: RegisterData): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          if (response.token) {
            this.storeToken(response.token);
            if (response.user) {
              this.currentUser.next(response.user);
              this.userRole.next(response.user.role);
              this.isAuthenticated.next(true);
              localStorage.setItem('user', JSON.stringify(response.user));
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap(response => {
          if (response.token) {
            this.storeToken(response.token);
            if (response.user) {
              this.currentUser.next(response.user);
              this.userRole.next(response.user.role);
              this.isAuthenticated.next(true);
              localStorage.setItem('user', JSON.stringify(response.user));
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    this.removeToken();
    this.currentUser.next(null);
    this.userRole.next('guest');
    this.isAuthenticated.next(false);
    localStorage.removeItem('user');
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/user`)
      .pipe(
        tap(user => {
          this.currentUser.next(user);
          this.userRole.next(user.role);
          localStorage.setItem('user', JSON.stringify(user));
        }),
        catchError(error => {
          // If 401, user is not authenticated
          if (error.status === 401) {
            this.logout();
          }
          return throwError(() => error);
        })
      );
  }

  isLoggedIn(): boolean {
    return this.hasToken() && this.isAuthenticated.value;
  }

  getUserRole(): UserRole {
    return this.userRole.value;
  }

  hasRole(role: UserRole | UserRole[]): boolean {
    const roles = Array.isArray(role) ? role : [role];
    return roles.includes(this.userRole.value);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private storeToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';

    console.error('Auth Error:', error);
    console.error('Error Status:', error.status);
    console.error('Error Message:', error.message);
    console.error('Error Body:', error.error);

    if (error.error instanceof ErrorEvent) {
      // Client-side error (network error, CORS, etc.)
      errorMessage = error.error.message || 'Network error. Is the backend running on http://localhost:8000?';
      console.error('Client-side error:', errorMessage);
    } else if (error.status === 0) {
      // Network error or CORS issue
      errorMessage = 'Cannot connect to backend. Is the server running on http://localhost:8000?';
      console.error('Network/CORS error - backend not reachable');
    } else if (error.status === 422) {
      // Validation errors from Laravel
      const errors = error.error.errors || error.error.message;
      if (typeof errors === 'object') {
        errorMessage = Object.values(errors).flat().join(', ');
      } else {
        errorMessage = errors || 'Validation error';
      }
    } else if (error.status === 401) {
      errorMessage = 'Invalid credentials';
    } else if (error.status === 429) {
      errorMessage = 'Too many login attempts. Please try again later.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error ${error.status}: ${error.statusText || 'Unknown error'}`;
    }

    console.error('Final error message:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
