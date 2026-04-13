import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SidebarItem {
  label: string;
  route: string;
  icon?: string;
}

@Component({
  selector: 'app-ui-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './ui-sidebar.component.html'
})
export class UiSidebarComponent {
  @Input() logo = 'EduBill';
  @Input() items: SidebarItem[] = [];
  @Input() compact = false;
}
