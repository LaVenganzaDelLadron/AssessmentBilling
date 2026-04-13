import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
  import { UiCardComponent } from '../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, UiCardComponent],
  templateUrl: './teacher-dashboard.html',
  styleUrl: './teacher-dashboard.css',
})
export class TeacherDashboardComponent {
  summaryCards = [
    { title: 'My Assignments', value: '8', subtitle: 'Active assignments' },
    { title: 'My Classes', value: '5', subtitle: 'This semester' },
    { title: 'Pending Grades', value: '23', subtitle: 'Need grading' }
  ];
}
