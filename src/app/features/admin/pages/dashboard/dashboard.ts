import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/dashboard.model';
import { InvoicesService } from '../../services/invoices.service';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  stats: DashboardStats | null = null;
  recentInvoices: Invoice[] = [];
  isLoading = true;
  errorMessage = '';

  constructor(
    private dashboardService: DashboardService,
    private invoicesService: InvoicesService
  ) {}

  ngOnInit() {
    this.loadDashboard();
  }

  private loadDashboard() {
    this.isLoading = true;
    this.errorMessage = '';

    // Load dashboard stats
    this.dashboardService.getStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (error: any) => {
        console.error('Error loading dashboard stats:', error);
        this.errorMessage = 'Failed to load dashboard statistics';
      }
    });

    // Load recent invoices
    this.invoicesService.list({ per_page: 2 }).subscribe({
      next: (response) => {
        this.recentInvoices = Array.isArray(response) ? response : response.data || [];
      },
      error: (error: any) => {
        console.error('Error loading invoices:', error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  getRevenuePercentage(): string {
    return '↑ 12%';
  }

  getStudentPercentage(): string {
    return '↑ 4%';
  }

  formatCurrency(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
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
}
