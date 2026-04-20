import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { Invoice } from '../../models/invoice.model';
import { InvoicesService } from '../../services/invoices.service';
import { AddInvoiceModalComponent } from '../../modals/invoices/add-invoice/add-invoice.modal';
import { UpdateInvoiceModalComponent } from '../../modals/invoices/update-invoice/update-invoice.modal';
import { DeleteInvoiceModalComponent } from '../../modals/invoices/delete-invoice/delete-invoice.modal';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddInvoiceModalComponent,
    UpdateInvoiceModalComponent,
    DeleteInvoiceModalComponent
  ],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices implements OnInit {
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
    this.isLoading = true;
    this.errorMessage = '';

    this.invoicesService.list().subscribe({
      next: (response) => {
        this.invoices = Array.isArray(response) ? response : response.data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 404) {
          this.invoices = [];
          return;
        }

        this.errorMessage = this.getErrorMessage(error) || 'Failed to load invoices';
        console.error('Error:', error);
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

  getFilteredInvoices(): Invoice[] {
    let filtered = this.invoices;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();

      filtered = filtered.filter(invoice =>
        invoice.invoice_number.toLowerCase().includes(query) ||
        invoice.student_id.toString().includes(query) ||
        invoice.assessment_id.toString().includes(query) ||
        String(invoice.total_amount).toLowerCase().includes(query) ||
        String(invoice.balance).toLowerCase().includes(query) ||
        invoice.due_date.toLowerCase().includes(query) ||
        invoice.status.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(invoice => invoice.status === this.statusFilter);
    }

    return filtered;
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
