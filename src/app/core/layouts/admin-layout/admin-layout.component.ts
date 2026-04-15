import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth.service';
import { SidebarItem, UiSidebarComponent } from '../../../shared/components/ui-sidebar/ui-sidebar.component';
import { UiNavbarComponent } from '../../../shared/components/ui-navbar/ui-navbar.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, UiSidebarComponent, UiNavbarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  get userName(): string {
    return this.authService.getUserDisplayName('Admin');
  }

  sidebarOpen = signal(false);
  title = 'Admin Dashboard';
  sidebarItems: SidebarItem[] = [
    { label: 'Dashboard', route: '/admin/dashboard', icon: 'M3 13h8V3H3v10Zm10 8h8V3h-8v18Zm-10 0h8v-6H3v6Z' },
    { label: 'Programs', route: '/admin/classes', icon: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z' },
    { label: 'Teachers', route: '/admin/teacher', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m16-10a4 4 0 1 0 0-8a4 4 0 0 0 0 8Zm6 10v-2a4 4 0 0 0-3-3.87' },
    { label: 'Enrollment', route: '/admin/enrollment', icon: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m18 0v-2a4 4 0 0 0-3-3.87M15 7a4 4 0 1 1-8 0a4 4 0 0 1 8 0Z' },
    { label: 'Teacher Subjects', route: '/admin/teacher-subject', icon: 'M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01' },
    { label: 'Subjects', route: '/admin/subject', icon: 'M12 20h9M12 4h9M4 9h16M4 15h16M8 4v16' },
    { label: 'Fees', route: '/admin/fees', icon: 'M12 1v22M17 5H9a3 3 0 1 0 0 6h6a3 3 0 1 1 0 6H6' },
    { label: 'Billing', route: '/admin/billing', icon: 'M3 3h18v4H3Zm2 6h14v12H5Zm3 3h8m-8 4h5' },
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
