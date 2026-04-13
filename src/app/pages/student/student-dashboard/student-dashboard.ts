import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
  import { UiCardComponent } from '../../../shared/components/ui-card/ui-card.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, UiCardComponent],
  templateUrl: './student-dashboard.html',
  styleUrl: './student-dashboard.css',
})
export class StudentDashboardComponent {
  summaryCards = [
    { title: 'My Assessments', value: '5', subtitle: 'Pending to take' },
    { title: 'My Payments', value: '$1,250', subtitle: 'Current balance' },
    { title: 'My Submissions', value: '12', subtitle: 'Submitted this term' }
  ];
}
