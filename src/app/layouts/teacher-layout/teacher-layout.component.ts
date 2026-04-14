import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SidebarItem, UiSidebarComponent } from '../../shared/components/ui-sidebar/ui-sidebar.component';
import { UiNavbarComponent } from '../../shared/components/ui-navbar/ui-navbar.component';

@Component({
  selector: 'app-teacher-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UiSidebarComponent, UiNavbarComponent],
  templateUrl: './teacher-layout.component.html',
  styleUrl: './teacher-layout.component.css'
})
export class TeacherLayoutComponent {
  get userName(): string {
    return this.authService.getUserDisplayName('Teacher');
  }

  sidebarOpen = signal(false);
  title = 'Teacher Portal';
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/teacher/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m1 0h6a1 1 0 0 0 1-1'},
    { label: 'Assignment', route: '/teacher/assignment', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8l4 4v12a2 2 0 0 1-2 2Z' },
    { label: 'Grade', route: '/teacher/grade', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { label: 'Subject', route: '/teacher/subject', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' }
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
