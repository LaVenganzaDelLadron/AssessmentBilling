import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private router = inject(Router);

  loginForm = {
    identifier: '',
    password: ''
  };

  onSubmit() {
    if (this.loginForm.identifier && this.loginForm.password) {
      this.router.navigate(['/admin']);
    }
  }
}
