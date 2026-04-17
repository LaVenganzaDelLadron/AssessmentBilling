import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';

@Component({
  selector: 'app-student-layout',
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  templateUrl: './student-layout.html',
  styleUrl: './student-layout.css',
})
export class StudentLayoutComponent {}
