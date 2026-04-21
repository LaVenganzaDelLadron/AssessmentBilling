import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  Observable,
  Subject,
  catchError,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardOverview,
  DashboardRevenuePoint,
  DashboardStats,
  DashboardStatusBreakdown
} from '../../models/dashboard.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private readonly refreshRequests = new Subject<boolean>();
  private latestOverview = this.createEmptyOverview();

  readonly overview$: Observable<DashboardOverview> = this.refreshRequests.pipe(
    startWith(false),
    tap(() => {
      this.errorMessage = '';
    }),
    switchMap((refresh) =>
      this.dashboardService.getOverview(refresh).pipe(
        tap((overview) => {
          this.latestOverview = overview;
        }),
        startWith(this.latestOverview),
        catchError((error: any) => {
          console.error('Error loading dashboard overview:', error);
          this.errorMessage = 'Failed to load dashboard data';
          return of(this.latestOverview);
        })
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  errorMessage = '';

  constructor(private dashboardService: DashboardService) {}

  loadDashboard(refresh = false): void {
    this.refreshRequests.next(refresh);
  }

  getRevenuePercentage(revenueTrend: DashboardRevenuePoint[]): string {
    if (revenueTrend.length < 2) {
      return 'No trend';
    }

    const current = revenueTrend[revenueTrend.length - 1]?.amount ?? 0;
    const previous = revenueTrend[revenueTrend.length - 2]?.amount ?? 0;

    if (current === 0 && previous === 0) {
      return 'No trend';
    }

    if (previous === 0) {
      return current > 0 ? 'New activity' : 'No trend';
    }

    const change = ((current - previous) / previous) * 100;
    const icon = change >= 0 ? '↑' : '↓';
    return `${icon} ${Math.round(Math.abs(change))}%`;
  }

  getStudentPercentage(stats: DashboardStats): string {
    const newStudents = stats.newStudents;

    if (newStudents === 0) {
      return 'No new';
    }

    return `+${newStudents} new`;
  }

  formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  }

  formatCompactCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(num);
  }

  getLastUpdatedLabel(lastUpdated: string): string {
    if (!lastUpdated) {
      return 'Not synced yet';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(lastUpdated));
  }

  getAssessmentShare(count: number, totalAssessments: number): number {
    if (totalAssessments === 0) {
      return 0;
    }

    return (count / totalAssessments) * 100;
  }

  getPendingInvoiceLabel(stats: DashboardStats): string {
    const count = stats.pendingInvoices;
    return count === 1 ? '1 open invoice' : `${count} open invoices`;
  }

  getOverdueInvoiceLabel(paymentDistribution: DashboardStatusBreakdown[]): string {
    const overdueCount = paymentDistribution.find(
      (item) => item.status === 'overdue'
    )?.count ?? 0;

    if (overdueCount === 0) {
      return 'No overdue';
    }

    return overdueCount === 1 ? '1 overdue invoice' : `${overdueCount} overdue invoices`;
  }

  getRevenueBarHeight(point: DashboardRevenuePoint): number {
    if (point.amount <= 0) {
      return 8;
    }

    return Math.max(point.percentage, 16);
  }

  getStatusBadgeClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'paid': 'bg-green-50 text-green-700 border-green-100',
      'unpaid': 'bg-red-50 text-red-700 border-red-100',
      'partial': 'bg-amber-50 text-amber-700 border-amber-100',
      'pending': 'bg-amber-50 text-amber-700 border-amber-100',
      'overdue': 'bg-red-50 text-red-700 border-red-100'
    };
    return statusMap[status.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-100';
  }

  getDistributionFillClass(status: string): string {
    const classMap: Record<string, string> = {
      paid: 'bg-emerald-500',
      partial: 'bg-amber-500',
      unpaid: 'bg-slate-400',
      overdue: 'bg-rose-500'
    };

    return classMap[status] || 'bg-slate-300';
  }

  exportDashboardSnapshot(overview: DashboardOverview): void {
    const snapshot = {
      exported_at: new Date().toISOString(),
      stats: overview.stats,
      revenue_trend: overview.revenueTrend,
      payment_distribution: overview.paymentDistribution,
      recent_invoices: overview.recentInvoices
    };

    const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);

    anchor.href = url;
    anchor.download = `admin-dashboard-${dateStamp}.json`;
    anchor.click();

    URL.revokeObjectURL(url);
  }

  private createEmptyOverview(): DashboardOverview {
    return {
      stats: this.createEmptyStats(),
      recentInvoices: [],
      revenueTrend: [],
      paymentDistribution: [],
      lastUpdated: ''
    };
  }

  private createEmptyStats(): DashboardStats {
    return {
      totalRevenue: 0,
      pendingPayments: 0,
      overdueAmount: 0,
      paidThisMonth: 0,
      totalStudents: 0,
      activeStudents: 0,
      newStudents: 0,
      assessments: 0,
      upcomingAssessments: 0,
      pendingAssessments: 0,
      invoices: 0,
      paidInvoices: 0,
      pendingInvoices: 0
    };
  }
}
