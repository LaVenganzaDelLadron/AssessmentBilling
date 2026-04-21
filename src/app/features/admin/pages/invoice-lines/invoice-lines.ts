import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { InvoiceLine } from '../../models/invoice-line.model';
import { InvoiceLinesService } from '../../services/invoice-lines.service';
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
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private invoiceLinesService: InvoiceLinesService) {}

  ngOnInit() {
    this.loadLines();
  }

  loadLines() {
    this.errorMessage = '';
    this.isLoading = true;
    this.invoiceLinesService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        console.log('[InvoiceLines] API response:', response);
        const data = Array.isArray(response) ? response : response.data ?? [];
        this.lines = Array.isArray(data) ? data : [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[InvoiceLines] API error:', error);
        if (error?.status === 404) {
          this.lines = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load invoice lines';
        this.isLoading = false;
      }
    });
  }

  getFilteredLines(): InvoiceLine[] {
    if (!this.searchQuery) return this.lines;

    const query = this.searchQuery.toLowerCase();

    return this.lines.filter(line =>
      this.getInvoiceLabel(line).toLowerCase().includes(query) ||
      this.getLineTypeLabel(line.line_type).toLowerCase().includes(query) ||
      this.getSubjectLabel(line).toLowerCase().includes(query) ||
      line.description.toLowerCase().includes(query) ||
      String(line.quantity ?? '').toLowerCase().includes(query) ||
      String(line.unit_price).toLowerCase().includes(query) ||
      String(line.amount).toLowerCase().includes(query)
    );
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
    return line.invoice?.invoice_number?.trim() || `#${line.invoice_id}`;
  }

  getSubjectLabel(line: InvoiceLine): string {
    if (!line.subject_id) {
      return 'None';
    }

    return (
      line.subject?.subject_code?.trim() ||
      line.subject?.code?.trim() ||
      line.subject?.name?.trim() ||
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
