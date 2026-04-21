import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { Invoice } from '../../models/invoice.model';
import { InvoicesService } from '../../services/invoices.service';
import { AddInvoiceModalComponent } from '../../modals/invoices/add-invoice/add-invoice.modal';
import { UpdateInvoiceModalComponent } from '../../modals/invoices/update-invoice/update-invoice.modal';
import { DeleteInvoiceModalComponent } from '../../modals/invoices/delete-invoice/delete-invoice.modal';
import { InvoicesCard } from '../../cards/invoices-card/invoices-card';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddInvoiceModalComponent,
    UpdateInvoiceModalComponent,
    DeleteInvoiceModalComponent,
    InvoicesCard
  ],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddInvoiceModalComponent) addModal!: AddInvoiceModalComponent;
  @ViewChild(UpdateInvoiceModalComponent) updateModal!: UpdateInvoiceModalComponent;
  @ViewChild(DeleteInvoiceModalComponent) deleteModal!: DeleteInvoiceModalComponent;

  invoices: Invoice[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';
  readonly statuses = ['unpaid', 'partial', 'paid', 'overdue'] as const;

  constructor(private invoicesService: InvoicesService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.errorMessage = '';
    this.isLoading = true;
    this.invoicesService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        console.log('[Invoices] API response:', response);
        const data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          console.log('[Invoices] First invoice:', data[0]);
          // Defensive: filter out any items missing required fields
          this.invoices = data.filter(inv =>
            inv && typeof inv.invoice_number === 'string' && inv.student_id !== undefined && inv.assessment_id !== undefined
          );
        } else {
          this.invoices = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Invoices] API error:', error);
        if (error?.status === 404) {
          this.invoices = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load invoices';
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(invoice: Invoice) {
    this.updateModal.open(invoice);
  }

  openDeleteModal(invoice: Invoice) {
    this.deleteModal.open(invoice);
  }

  trackByInvoiceId(index: number, invoice: Invoice): string | number {
    return invoice && invoice.id !== undefined ? invoice.id : index;
  }

  getFilteredInvoices(): Invoice[] {
    console.log('[Invoices] getFilteredInvoices - searchQuery:', this.searchQuery, 'invoices:', this.invoices);
    // TEMP: Bypass filtering for debug
    return this.invoices;
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-amber-100 text-amber-800';
      case 'unpaid': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatAmount(value: AdminNumericValue): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
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
