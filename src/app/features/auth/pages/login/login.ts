import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TutorialService } from '../../../../shared/services/tutorial.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private router = inject(Router);
  private authService = inject(AuthService);
  private tutorialService = inject(TutorialService);

  loginForm = {
    email: '',
    password: '',
    remember: false
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  onSubmit() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';

    console.log('Login form submitted');

    // Validate form
    if (!this.loginForm.email || !this.loginForm.password) {
      this.errorMessage = 'Email and password are required';
      console.warn('Validation failed: missing fields');
      return;
    }

    if (this.loginForm.password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters';
      console.warn('Validation failed: password too short');
      return;
    }

    console.log('Form validation passed, sending login request...');
    this.isLoading = true;

    this.authService.login({
      email: this.loginForm.email,
      password: this.loginForm.password,
      remember: this.loginForm.remember
    }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.successMessage = 'Login successful! Redirecting...';
        this.isLoading = false;

        // Get user role from the response and redirect
        const userId = response.user?.id || 0;
        const role = response.user?.role || 'student';
        const routeMap: Record<string, string> = {
          admin: '/admin',
          teacher: '/teacher',
          student: '/student'
        };

        // Check if first login and show tutorial
        this.tutorialService.checkFirstLogin(userId, role as any);

        console.time('login-redirect');
        this.router.navigate([`${routeMap[role] || '/student'}/dashboard`]);
        console.timeEnd('login-redirect');
      },
      error: (error) => {
        console.error('Login error:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Login failed. Please try again.';
      }
    });
  }
}
