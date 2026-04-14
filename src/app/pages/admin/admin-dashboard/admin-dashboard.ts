import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs';
import { DashboardService } from '../../../services/dashboard.service';
import { Billing } from '../../../models/billing.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly cdr = inject(ChangeDetectorRef);

  isLoading = false;
  errorMessage = '';

  stats = {
    programsCount: 0,
    studentsCount: 0,
    teachersCount: 0,
    subjectsCount: 0,
    teacherSubjectsCount: 0,
    assignmentsCount: 0,
    gradesCount: 0,
    feesCount: 0,
    billingsCount: 0,
    paidCount: 0,
    partialCount: 0,
    unpaidCount: 0,
    totalBilled: 0,
    unpaidAmount: 0,
    recentBillings: [] as Billing[]
  };

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.dashboardService.getDashboardData().pipe(
      finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (data) => {
        this.stats = data;
        this.cdr.detectChanges();
      },
      error: (error: Error) => {
        this.errorMessage = error.message;
        this.cdr.detectChanges();
      }
    });
  }

  statusClass(status: string): string {
    const normalized = (status || '').toLowerCase();
    if (normalized === 'paid') {
      return 'bg-emerald-100 text-emerald-700';
    }
    if (normalized === 'partial') {
      return 'bg-amber-100 text-amber-700';
    }
    return 'bg-rose-100 text-rose-700';
  }

  trackByBillingId(_: number, row: Billing): string {
    return row.id;
  }
}
