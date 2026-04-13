import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SidebarItem, UiSidebarComponent } from '../../shared/components/ui-sidebar/ui-sidebar.component';
import { UiNavbarComponent } from '../../shared/components/ui-navbar/ui-navbar.component';

@Component({
  selector: 'app-student-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UiSidebarComponent, UiNavbarComponent],
  templateUrl: './student-layout.component.html',
  styleUrl: './student-layout.component.css'
})
export class StudentLayoutComponent {
  sidebarOpen = signal(false);
  title = 'Student Portal';
  sidebarItems: SidebarItem[] = [
    { label: 'Assessment', route: '/student/assessment', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0a9 9 0 0 1 18 0Z' },
    { label: 'Payment', route: '/student/payment', icon: 'M12 1v22M17 5H9a3 3 0 1 0 0 6h6a3 3 0 1 1 0 6H6' },
    { label: 'Submission', route: '/student/submission', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6' }
  ];

  constructor(private authService: AuthService) {}

  toggleSidebar() {
    this.sidebarOpen.update(open => !open);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }

  logout() {
    this.authService.logout();
  }
}
