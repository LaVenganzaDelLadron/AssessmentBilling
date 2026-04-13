import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../../shared/components/ui-card/ui-card.component';
import { TableColumn, UiTableComponent } from '../../../shared/components/ui-table/ui-table.component';

@Component({
selector: 'app-assessment',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiCardComponent, UiTableComponent],
  templateUrl: './assessment.html',
  styleUrl: './assessment.css',
})
export class AssessmentComponent {
  feeColumns: TableColumn[] = [
    { key: 'type', label: 'Fee Type' },
    { key: 'amount', label: 'Amount' },
    { key: 'dueDate', label: 'Due Date' },
    { key: 'status', label: 'Status' }
  ];

  feeRows = [
    { type: 'Tuition Fee', amount: '$2,500', dueDate: '2026-08-01', status: 'Paid' },
    { type: 'Misc Fee', amount: '$450', dueDate: '2026-09-01', status: 'Paid' },
    { type: 'Laboratory Fee', amount: '$350', dueDate: '2026-09-15', status: 'Pending' }
  ];
}
