import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { SidebarItem, UiSidebarComponent } from '../../shared/components/ui-sidebar/ui-sidebar.component';
import { UiNavbarComponent } from '../../shared/components/ui-navbar/ui-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UiSidebarComponent, UiNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  sidebarOpen = signal(false);
  title = 'Admin Dashboard';
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'M3 12h7V3H3v9Zm0 9h7v-7H3v7Zm11 0h7v-9h-7v9Zm0-18v7h7V3h-7Z' },
    { label: 'Programs', route: '/admin/classes', icon: 'M4 6h16M4 12h16M4 18h16' },
    { label: 'Enrollment', route: '/admin/enrollment', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M15 7a4 4 0 1 1-8 0a4 4 0 0 1 8 0Z' },
    { label: 'Subjects', route: '/admin/subject', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' },
    { label: 'Fees', route: '/admin/fees', icon: 'M12 1v22M17 5H9a3 3 0 1 0 0 6h6a3 3 0 1 1 0 6H6' },
    { label: 'Billing', route: '/admin/billing', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0a9 0 0 1 18 0Z' },
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
