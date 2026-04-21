import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { AdminEndpointService } from './admin-resource.service';
import { AdminListResponse, AdminNumericValue } from '../models/admin-api.model';
import {
  DashboardOverview,
  DashboardRevenuePoint,
  DashboardStats,
  DashboardStatusBreakdown
} from '../models/dashboard.model';
import { StudentsService } from './students.service';
import { Student } from '../models/student.model';
import { AssessmentsService } from './assessments.service';
import { Assessment } from '../models/assessment.model';
import { InvoicesService } from './invoices.service';
import { Invoice, InvoiceStatus } from '../models/invoice.model';
import { PaymentsService } from './payments.service';
import { Payment } from '../models/payment.model';

const DASHBOARD_LIST_PARAMS = { per_page: 500 } as const;
const INVOICE_STATUS_ORDER: InvoiceStatus[] = ['paid', 'partial', 'unpaid', 'overdue'];

@Injectable({ providedIn: 'root' })
export class DashboardService extends AdminEndpointService {
  private readonly studentsService = inject(StudentsService);
  private readonly assessmentsService = inject(AssessmentsService);
  private readonly invoicesService = inject(InvoicesService);
  private readonly paymentsService = inject(PaymentsService);
  private readonly statsCacheSegment = 'stats';

  constructor() {
    super('dashboard');
  }

  getOverview(refresh = false): Observable<DashboardOverview> {
    return forkJoin({
      endpointStats: this.getEndpointStats(refresh).pipe(
        catchError((error) => {
          console.warn('Dashboard endpoint unavailable, using computed overview.', error);
          return of<DashboardStats | null>(null);
        })
      ),
      students: this.studentsService.list(DASHBOARD_LIST_PARAMS, { refresh }).pipe(
        map((response) => this.normalizeStudents(response)),
        catchError(() => of<Student[]>([]))
      ),
      assessments: this.assessmentsService.list(DASHBOARD_LIST_PARAMS, { refresh }).pipe(
        map((response) => this.normalizeAssessments(response)),
        catchError(() => of<Assessment[]>([]))
      ),
      invoices: this.invoicesService.list(DASHBOARD_LIST_PARAMS, { refresh }).pipe(
        map((response) => this.normalizeInvoices(response)),
        catchError(() => of<Invoice[]>([]))
      ),
      payments: this.paymentsService.list(DASHBOARD_LIST_PARAMS, { refresh }).pipe(
        map((response) => this.normalizePayments(response)),
        catchError(() => of<Payment[]>([]))
      )
    }).pipe(
      map(({ endpointStats, students, assessments, invoices, payments }) => {
        const computedStats = this.buildStats(students, assessments, invoices, payments);

        return {
          stats: endpointStats ? { ...computedStats, ...endpointStats } : computedStats,
          recentInvoices: this.getRecentInvoices(invoices),
          revenueTrend: this.buildRevenueTrend(payments, invoices),
          paymentDistribution: this.buildPaymentDistribution(invoices),
          lastUpdated: new Date().toISOString()
        };
      })
    );
  }

  private getEndpointStats(refresh = false): Observable<DashboardStats> {
    if (!refresh) {
      const cached = this.getCachedValue<DashboardStats>(this.statsCacheSegment);
      if (cached !== null) {
        return of(cached);
      }
    } else {
      this.clearCachedValue(this.statsCacheSegment);
    }

    return this.http.get<DashboardStats>(this.collectionUrl()).pipe(
      tap((stats) => this.setCachedValue(this.statsCacheSegment, stats))
    );
  }

  private getDefaultStats(): DashboardStats {
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
      pendingInvoices: 0,
    };
  }

  private buildStats(
    students: Student[],
    assessments: Assessment[],
    invoices: Invoice[],
    payments: Payment[]
  ): DashboardStats {
    const paidInvoices = invoices.filter((invoice) => invoice.status === 'paid');
    const openInvoices = invoices.filter((invoice) => invoice.status !== 'paid');
    const overdueInvoices = invoices.filter(
      (invoice) =>
        invoice.status === 'overdue' ||
        (invoice.status !== 'paid' &&
          this.isDateInPast(invoice.due_date) &&
          this.normalizeNumber(invoice.balance) > 0)
    );

    const totalRevenueFromPayments = this.sumNumbers(
      payments.map((payment) => payment.amount_paid)
    );
    const paidThisMonthFromPayments = this.sumNumbers(
      payments
        .filter((payment) => this.isInCurrentMonth(payment.paid_at))
        .map((payment) => payment.amount_paid)
    );

    const totalRevenue =
      totalRevenueFromPayments > 0
        ? totalRevenueFromPayments
        : this.sumNumbers(paidInvoices.map((invoice) => invoice.total_amount));

    const paidThisMonth =
      paidThisMonthFromPayments > 0
        ? paidThisMonthFromPayments
        : this.sumNumbers(
            paidInvoices
              .filter((invoice) => this.isInCurrentMonth(invoice.updated_at ?? invoice.created_at))
              .map((invoice) => invoice.total_amount)
          );

    return {
      totalRevenue,
      pendingPayments: this.sumNumbers(openInvoices.map((invoice) => invoice.balance)),
      overdueAmount: this.sumNumbers(overdueInvoices.map((invoice) => invoice.balance)),
      paidThisMonth,
      totalStudents: students.length,
      activeStudents: students.filter((student) => student.status === 'active').length,
      newStudents: students.filter((student) => this.isInCurrentMonth(student.created_at)).length,
      assessments: assessments.length,
      upcomingAssessments: assessments.filter((assessment) => assessment.status === 'finalized').length,
      pendingAssessments: assessments.filter((assessment) => assessment.status === 'draft').length,
      invoices: invoices.length,
      paidInvoices: paidInvoices.length,
      pendingInvoices: openInvoices.length
    };
  }

  private buildRevenueTrend(
    payments: Payment[],
    invoices: Invoice[]
  ): DashboardRevenuePoint[] {
    const months = this.getTrailingMonths(6);
    const totals = new Map<string, number>();
    const paymentTotal = this.sumNumbers(payments.map((payment) => payment.amount_paid));

    if (paymentTotal > 0) {
      for (const payment of payments) {
        const date = this.parseDate(payment.paid_at);
        if (!date) {
          continue;
        }

        const key = this.getMonthKey(date);
        totals.set(key, (totals.get(key) ?? 0) + this.normalizeNumber(payment.amount_paid));
      }
    } else {
      for (const invoice of invoices.filter((item) => item.status === 'paid')) {
        const date = this.parseDate(invoice.updated_at ?? invoice.created_at ?? invoice.due_date);
        if (!date) {
          continue;
        }

        const key = this.getMonthKey(date);
        totals.set(key, (totals.get(key) ?? 0) + this.normalizeNumber(invoice.total_amount));
      }
    }

    const peakAmount = Math.max(...months.map(({ key }) => totals.get(key) ?? 0), 0);

    return months.map(({ key, label }, index) => {
      const amount = totals.get(key) ?? 0;

      return {
        label,
        amount,
        percentage: peakAmount > 0 ? (amount / peakAmount) * 100 : 0,
        isCurrentMonth: index === months.length - 1
      };
    });
  }

  private buildPaymentDistribution(invoices: Invoice[]): DashboardStatusBreakdown[] {
    const totalInvoices = invoices.length;

    return INVOICE_STATUS_ORDER.map((status) => {
      const matchingInvoices = invoices.filter((invoice) => invoice.status === status);
      const amount = this.sumNumbers(
        matchingInvoices.map((invoice) =>
          status === 'paid' ? invoice.total_amount : invoice.balance
        )
      );

      return {
        status,
        label: this.getInvoiceStatusLabel(status),
        count: matchingInvoices.length,
        amount,
        percentage: totalInvoices > 0 ? (matchingInvoices.length / totalInvoices) * 100 : 0
      };
    });
  }

  private getRecentInvoices(invoices: Invoice[]): Invoice[] {
    return [...invoices]
      .sort((left, right) => this.getInvoiceSortValue(right) - this.getInvoiceSortValue(left))
      .slice(0, 5);
  }

  private extractListItems<T>(response: AdminListResponse<T>): unknown[] {
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response.data)) {
      return response.data;
    }

    return [];
  }

  private normalizeStudents(response: AdminListResponse<Student>): Student[] {
    return this.extractListItems(response)
      .map((item: any) => ({
        id: Number(item.id ?? item.student_id ?? 0),
        student_no: String(item.student_no ?? ''),
        first_name: String(item.first_name ?? ''),
        middle_name: item.middle_name ?? null,
        last_name: String(item.last_name ?? ''),
        email: item.email ?? null,
        program_id: Number(item.program_id ?? 0),
        year_level: Number(item.year_level ?? 0),
        status: (item.status === 'active' ? 'active' : 'inactive') as Student['status'],
        user_id: item.user_id ?? null,
        program: item.program ?? null,
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null
      }))
      .filter((student) => student.id > 0);
  }

  private normalizeAssessments(response: AdminListResponse<Assessment>): Assessment[] {
    return this.extractListItems(response)
      .map((item: any) => ({
        id: Number(item.id ?? item.assessment_id ?? 0),
        student_id: Number(item.student_id ?? 0),
        academic_term_id: Number(item.academic_term_id ?? 0),
        semester: String(item.semester ?? ''),
        school_year: String(item.school_year ?? ''),
        total_units: item.total_units ?? 0,
        tuition_fee: item.tuition_fee ?? 0,
        misc_fee: item.misc_fee ?? 0,
        lab_fee: item.lab_fee ?? 0,
        other_fees: item.other_fees ?? 0,
        total_amount: item.total_amount ?? 0,
        discount: item.discount ?? 0,
        net_amount: item.net_amount ?? 0,
        status: (item.status === 'finalized' ? 'finalized' : 'draft') as Assessment['status'],
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null
      }))
      .filter((assessment) => assessment.id > 0);
  }

  private normalizeInvoices(response: AdminListResponse<Invoice>): Invoice[] {
    return this.extractListItems(response)
      .map((item: any) => ({
        id: Number(item.id ?? item.invoice_id ?? 0),
        student_id: Number(item.student_id ?? 0),
        assessment_id: Number(item.assessment_id ?? 0),
        invoice_number: String(item.invoice_number ?? `INV-${item.id ?? 'NA'}`),
        total_amount: item.total_amount ?? 0,
        balance: item.balance ?? item.total_amount ?? 0,
        due_date: String(item.due_date ?? item.created_at ?? ''),
        status: this.normalizeInvoiceStatus(item.status),
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null
      }))
      .filter((invoice) => invoice.id > 0);
  }

  private normalizePayments(response: AdminListResponse<Payment>): Payment[] {
    return this.extractListItems(response)
      .map((item: any) => ({
        id: Number(item.id ?? item.payment_id ?? 0),
        invoice_id: Number(item.invoice_id ?? 0),
        amount_paid: item.amount_paid ?? 0,
        reference_number: item.reference_number ?? null,
        paid_at: item.paid_at ?? item.created_at ?? '',
        payment_method:
          typeof item.payment_method === 'string'
            ? item.payment_method
            : item.payment_method?.name ?? '',
        created_at: item.created_at ?? null,
        updated_at: item.updated_at ?? null
      }))
      .filter((payment) => payment.id > 0);
  }

  private normalizeInvoiceStatus(status: unknown): InvoiceStatus {
    switch (String(status).toLowerCase()) {
      case 'paid':
      case 'partial':
      case 'overdue':
        return String(status).toLowerCase() as InvoiceStatus;
      default:
        return 'unpaid';
    }
  }

  private getInvoiceStatusLabel(status: InvoiceStatus): string {
    const statusLabels: Record<InvoiceStatus, string> = {
      paid: 'Paid',
      partial: 'Partial',
      unpaid: 'Unpaid',
      overdue: 'Overdue'
    };

    return statusLabels[status];
  }

  private getInvoiceSortValue(invoice: Invoice): number {
    return (
      this.getTimestamp(invoice.created_at) ||
      this.getTimestamp(invoice.updated_at) ||
      this.getTimestamp(invoice.due_date) ||
      invoice.id
    );
  }

  private getTrailingMonths(count: number): Array<{ key: string; label: string }> {
    const now = new Date();

    return Array.from({ length: count }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (count - 1 - index), 1);

      return {
        key: this.getMonthKey(date),
        label: date.toLocaleString('en-US', { month: 'short' })
      };
    });
  }

  private getMonthKey(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${date.getFullYear()}-${month}`;
  }

  private sumNumbers(values: Array<AdminNumericValue | null | undefined>): number {
    return values.reduce<number>(
      (sum, value) => sum + this.normalizeNumber(value),
      0
    );
  }

  private normalizeNumber(value: AdminNumericValue | null | undefined): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : 0;
  }

  private isDateInPast(value: string | null | undefined): boolean {
    const date = this.parseDate(value);

    if (!date) {
      return false;
    }

    return date.getTime() < Date.now();
  }

  private isInCurrentMonth(value: string | null | undefined): boolean {
    const date = this.parseDate(value);

    if (!date) {
      return false;
    }

    const now = new Date();

    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    );
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);

    return Number.isNaN(date.getTime()) ? null : date;
  }

  private getTimestamp(value: string | null | undefined): number {
    return this.parseDate(value)?.getTime() ?? 0;
  }
}
