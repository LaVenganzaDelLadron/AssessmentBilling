import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-ui-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-navbar.component.html'
})
export class UiNavbarComponent {
  @Input() title = 'Dashboard';
  @Input() userName = 'Admin';
  @Input() showLogout = true;

  @Output() menuClick = new EventEmitter<void>();
  @Output() logoutClick = new EventEmitter<void>();
}
