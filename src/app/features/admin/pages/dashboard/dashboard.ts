import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardOverview,
  DashboardRevenuePoint,
  DashboardStats,
  DashboardStatusBreakdown
} from '../../models/dashboard.model';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  stats: DashboardStats = this.createEmptyStats();
  recentInvoices: Invoice[] = [];
  revenueTrend: DashboardRevenuePoint[] = [];
  paymentDistribution: DashboardStatusBreakdown[] = [];
  lastUpdated = '';
  errorMessage = '';

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboard();
  }

  loadDashboard(refresh = false) {
    this.errorMessage = '';

    this.dashboardService.getOverview(refresh).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (overview: DashboardOverview) => {
        this.stats = overview.stats;
        this.recentInvoices = overview.recentInvoices;
        this.revenueTrend = overview.revenueTrend;
        this.paymentDistribution = overview.paymentDistribution;
        this.lastUpdated = overview.lastUpdated;
      },
      error: (error: any) => {
        console.error('Error loading dashboard overview:', error);
        this.errorMessage = 'Failed to load dashboard data';
      }
    });
  }

  getRevenuePercentage(): string {
    if (this.revenueTrend.length < 2) {
      return 'No trend';
    }

    const current = this.revenueTrend[this.revenueTrend.length - 1]?.amount ?? 0;
    const previous = this.revenueTrend[this.revenueTrend.length - 2]?.amount ?? 0;

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

  getStudentPercentage(): string {
    const newStudents = this.stats.newStudents;

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

  getLastUpdatedLabel(): string {
    if (!this.lastUpdated) {
      return 'Not synced yet';
    }

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(new Date(this.lastUpdated));
  }

  getAssessmentShare(count: number): number {
    const totalAssessments = this.stats.assessments;

    if (totalAssessments === 0) {
      return 0;
    }

    return (count / totalAssessments) * 100;
  }

  getPendingInvoiceLabel(): string {
    const count = this.stats.pendingInvoices;
    return count === 1 ? '1 open invoice' : `${count} open invoices`;
  }

  getOverdueInvoiceLabel(): string {
    const overdueCount = this.paymentDistribution.find(
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

  exportDashboardSnapshot(): void {
    const snapshot = {
      exported_at: new Date().toISOString(),
      stats: this.stats,
      revenue_trend: this.revenueTrend,
      payment_distribution: this.paymentDistribution,
      recent_invoices: this.recentInvoices
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
