import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';
import { UiCardComponent } from '../../../shared/components/ui-card/ui-card.component';
import { TableColumn, UiTableComponent } from '../../../shared/components/ui-table/ui-table.component';

@Component({
selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, UiButtonComponent, UiCardComponent, UiTableComponent],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
})
export class AdminDashboardComponent {
  summaryCards = [
    { title: 'Total Students', value: '1,250', subtitle: 'Enrolled learners' },
    { title: 'Total Billing', value: '$78,450', subtitle: 'Current cycle' },
    { title: 'Pending Payments', value: '$12,300', subtitle: 'Awaiting collection' },
    { title: 'Active Classes', value: '24', subtitle: 'Running this term' }
  ];

  billingColumns: TableColumn[] = [
    { key: 'student', label: 'Student Name' },
    { key: 'amount', label: 'Assessment Amount' },
    { key: 'status', label: 'Status' },
    { key: 'dueDate', label: 'Due Date' }
  ];

  billingRows = [
    { student: 'John Doe', amount: '$1,250', status: 'Paid', dueDate: '2026-04-10' },
    { student: 'Sarah Cruz', amount: '$890', status: 'Pending', dueDate: '2026-04-15' },
    { student: 'Mika Lee', amount: '$1,100', status: 'Unpaid', dueDate: '2026-04-18' },
    { student: 'Emma Reyes', amount: '$950', status: 'Paid', dueDate: '2026-04-20' }
  ];
}
