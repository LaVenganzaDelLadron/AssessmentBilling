import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PendingComponent } from '../pending/pending';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, PendingComponent],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  showPendingModal = false;

  onSignup() {
    this.showPendingModal = true;
  }

  closePendingModal() {
    this.showPendingModal = false;
  }
}
