import { Invoice, InvoiceStatus } from './invoice.model';

export interface DashboardStats {
  totalRevenue: number;
  pendingPayments: number;
  overdueAmount: number;
  paidThisMonth: number;

  totalStudents: number;
  activeStudents: number;
  newStudents: number;

  assessments: number;
  upcomingAssessments: number;
  pendingAssessments: number;

  invoices: number;
  paidInvoices: number;
  pendingInvoices: number;
}

export interface DashboardRevenuePoint {
  label: string;
  amount: number;
  percentage: number;
  isCurrentMonth: boolean;
}

export interface DashboardStatusBreakdown {
  status: InvoiceStatus;
  label: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface DashboardOverview {
  stats: DashboardStats;
  recentInvoices: Invoice[];
  revenueTrend: DashboardRevenuePoint[];
  paymentDistribution: DashboardStatusBreakdown[];
  lastUpdated: string;
}
