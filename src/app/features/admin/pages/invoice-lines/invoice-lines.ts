import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of } from 'rxjs';
import { AdminNumericValue } from '../../models/admin-api.model';
import { InvoiceLine, InvoiceLineGroupView } from '../../models/invoice-line.model';
import { Invoice } from '../../models/invoice.model';
import { Subject } from '../../models/subject.model';
import { InvoiceLinesService } from '../../services/invoice-lines.service';
import { InvoicesService } from '../../services/invoices.service';
import { SubjectsService } from '../../services/subjects.service';
import { AddInvoiceLinesModalComponent } from '../../modals/invoice-lines/add-invoice-lines/add-invoice-lines.modal';
import { UpdateInvoiceLinesModalComponent } from '../../modals/invoice-lines/update-invoice-lines/update-invoice-lines.modal';
import { DeleteInvoiceLinesModalComponent } from '../../modals/invoice-lines/delete-invoice-lines/delete-invoice-lines.modal';
import { InvoiceLineCard } from '../../cards/invoice-line-card/invoice-line-card';

@Component({
  selector: 'app-invoice-lines',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddInvoiceLinesModalComponent,
    UpdateInvoiceLinesModalComponent,
    DeleteInvoiceLinesModalComponent,
    InvoiceLineCard
  ],
  templateUrl: './invoice-lines.html',
  styleUrl: './invoice-lines.css',
})
export class InvoiceLines implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddInvoiceLinesModalComponent) addModal!: AddInvoiceLinesModalComponent;
  @ViewChild(UpdateInvoiceLinesModalComponent) updateModal!: UpdateInvoiceLinesModalComponent;
  @ViewChild(DeleteInvoiceLinesModalComponent) deleteModal!: DeleteInvoiceLinesModalComponent;

  lines: InvoiceLine[] = [];
  groupedLines: InvoiceLineGroupView[] = [];
  private invoicesById = new Map<number, Invoice>();
  private subjectsById = new Map<number, Subject>();
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(
    private invoiceLinesService: InvoiceLinesService,
    private invoicesService: InvoicesService,
    private subjectsService: SubjectsService
  ) {}

  ngOnInit() {
    this.loadLines();
  }

  loadLines() {
    this.errorMessage = '';
    this.isLoading = true;
    forkJoin({
      lines: this.invoiceLinesService.list(),
      invoices: this.invoicesService
        .list()
        .pipe(catchError(() => of([]))),
      subjects: this.subjectsService
        .list()
        .pipe(catchError(() => of([])))
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        console.log('[InvoiceLines] API response:', response);
        const lineData = this.extractListData<InvoiceLine>(response.lines);
        const invoices = this.extractListData<Invoice>(response.invoices);
        const subjects = this.extractListData<Subject>(response.subjects);

        this.invoicesById = new Map(
          invoices
            .filter((invoice) => Number.isFinite(Number(invoice?.id)))
            .map((invoice) => [Number(invoice.id), invoice])
        );
        this.subjectsById = new Map(
          subjects
            .filter((subject) => Number.isFinite(Number(subject?.id)))
            .map((subject) => [Number(subject.id), subject])
        );

        this.lines = lineData.map((line) => this.withResolvedRelations(line));
        this.groupedLines = this.buildGroupedLines(this.lines);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[InvoiceLines] API error:', error);
        if (error?.status === 404) {
          this.lines = [];
          this.groupedLines = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load invoice lines';
        this.isLoading = false;
      }
    });
  }

  getFilteredLines(): InvoiceLineGroupView[] {
    if (!this.searchQuery) return this.groupedLines;

    const query = this.searchQuery.toLowerCase();

    return this.groupedLines.filter(group => {
      const searchable = [
        group.invoice_label,
        group.subject_labels.join(' '),
        ...group.lines.map(line => this.getLineTypeLabel(line.line_type)),
        ...group.lines.map(line => line.description),
        String(group.totals.overall)
      ]
        .join(' ')
        .toLowerCase();

      return searchable.includes(query);
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(line: InvoiceLine) {
    this.updateModal.open(line);
  }

  openDeleteModal(line: InvoiceLine) {
    this.deleteModal.open(line);
  }

  getInvoiceLabel(line: InvoiceLine): string {
    return (
      line.invoice?.invoice_number?.trim() ||
      this.invoicesById.get(line.invoice_id)?.invoice_number?.trim() ||
      `#${line.invoice_id}`
    );
  }

  getSubjectLabel(line: InvoiceLine): string {
    if (!line.subject_id) {
      return 'None';
    }

    const subject = this.subjectsById.get(line.subject_id);

    return (
      line.subject?.name?.trim() ||
      subject?.name?.trim() ||
      line.subject?.subject_code?.trim() ||
      line.subject?.code?.trim() ||
      subject?.subject_code?.trim() ||
      subject?.code?.trim() ||
      `#${line.subject_id}`
    );
  }

  getLineTypeLabel(type: InvoiceLine['line_type']): string {
    return type
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  formatAmount(value: AdminNumericValue | null): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value ?? '');
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  private buildGroupedLines(lines: InvoiceLine[]): InvoiceLineGroupView[] {
    const grouped = new Map<number, InvoiceLineGroupView>();

    for (const line of lines) {
      const invoiceId = line.invoice_id;

      if (!grouped.has(invoiceId)) {
        grouped.set(invoiceId, {
          invoice_id: invoiceId,
          invoice_label: this.getInvoiceLabel(line),
          lines: [],
          line_count: 0,
          subject_labels: [],
          totals: {
            overall: 0,
            tuition: 0,
            lab_fee: 0,
            misc_fee: 0,
            discount: 0,
            other: 0
          }
        });
      }

      const target = grouped.get(invoiceId)!;
      target.lines.push(line);
      target.line_count += 1;

      const lineAmount = this.toNumber(line.amount);
      target.totals.overall += lineAmount;
      target.totals[line.line_type] += lineAmount;

      const subjectLabel = this.getSubjectLabel(line);
      if (subjectLabel !== 'None' && !target.subject_labels.includes(subjectLabel)) {
        target.subject_labels.push(subjectLabel);
      }
    }

    return Array.from(grouped.values()).sort((a, b) => b.invoice_id - a.invoice_id);
  }

  private toNumber(value: AdminNumericValue | null): number {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  private extractListData<T>(response: unknown): T[] {
    if (Array.isArray(response)) {
      return response as T[];
    }

    const data = (response as { data?: unknown } | null)?.data;
    return Array.isArray(data) ? (data as T[]) : [];
  }

  private withResolvedRelations(line: InvoiceLine): InvoiceLine {
    const fallbackInvoice = this.invoicesById.get(line.invoice_id);
    const fallbackSubject = line.subject_id
      ? this.subjectsById.get(line.subject_id)
      : null;

    return {
      ...line,
      invoice: line.invoice ?? (fallbackInvoice
        ? {
            id: fallbackInvoice.id,
            invoice_number: fallbackInvoice.invoice_number
          }
        : null),
      subject: line.subject ?? (fallbackSubject
        ? {
            id: fallbackSubject.id,
            subject_code: fallbackSubject.subject_code ?? fallbackSubject.code,
            code: fallbackSubject.code,
            name: fallbackSubject.name
          }
        : null)
    };
  }

  private getErrorMessage(error: unknown): string | null {
    const apiError = error as {
      error?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    const validationErrors = apiError?.error?.errors;

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') {
          return messages[0];
        }
      }
    }

    return apiError?.error?.message ?? null;
  }
}
