import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private router = inject(Router);
  private authService = inject(AuthService);

  registerForm = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  fieldErrors: { [key: string]: string } = {};

  onSignup() {
    // Reset messages
    this.errorMessage = '';
    this.successMessage = '';
    this.fieldErrors = {};

    console.log('Registration form submitted');

    // Client-side validation
    if (!this.registerForm.name.trim()) {
      this.fieldErrors['name'] = 'Name is required';
    }

    if (!this.registerForm.email.trim()) {
      this.fieldErrors['email'] = 'Email is required';
    } else if (!this.isValidEmail(this.registerForm.email)) {
      this.fieldErrors['email'] = 'Email must be a valid email address';
    }

    if (!this.registerForm.password) {
      this.fieldErrors['password'] = 'Password is required';
    } else if (this.registerForm.password.length < 8) {
      this.fieldErrors['password'] = 'Password must be at least 8 characters long';
    }

    if (this.registerForm.password !== this.registerForm.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Passwords do not match';
    }

    if (Object.keys(this.fieldErrors).length > 0) {
      console.warn('Validation failed:', this.fieldErrors);
      return;
    }

    console.log('Form validation passed, sending registration request...');
    this.isLoading = true;

    this.authService.register({
      name: this.registerForm.name.trim(),
      email: this.registerForm.email.trim(),
      password: this.registerForm.password
    }).subscribe({
      next: (response) => {
        console.log('Registration successful:', response);
        this.successMessage = 'Registration successful! Redirecting to dashboard...';
        this.isLoading = false;

        setTimeout(() => {
          // Backend assigns 'student' role, so redirect to student dashboard
          this.router.navigate(['/student']);
        }, 1000);
      },
      error: (error) => {
        console.error('Registration error:', error);
        this.isLoading = false;

        // Parse error message to extract field-specific errors if available
        const message = error.message || 'Registration failed';

        // Check if it's a Laravel validation error with multiple fields
        if (message.includes('Email is already taken')) {
          this.fieldErrors['email'] = 'Email is already taken';
        } else {
          this.errorMessage = message;
        }
      }
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
