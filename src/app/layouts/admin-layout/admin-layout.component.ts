import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.componenent';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, LoadingComponent],
  templateUrl: './admin-layout.component.html'
})
export class AdminLayoutComponent {}
