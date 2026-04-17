import { Component } from '@angular/core';
import { SidebarComponent } from '../../../../layouts/admin-layout/sidebar/sidebar.componenent';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {}
