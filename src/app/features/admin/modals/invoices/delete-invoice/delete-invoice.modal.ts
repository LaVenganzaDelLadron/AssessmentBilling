import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../../models/invoice.model';
import { InvoicesService } from '../../../services/invoices.service';

@Component({
  selector: 'app-delete-invoice-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-invoice.modal.html',
})
export class DeleteInvoiceModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedInvoice: Invoice | null = null;

  constructor(private invoicesService: InvoicesService) {}

  open(invoice: Invoice): void {
    this.selectedInvoice = invoice;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedInvoice = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedInvoice?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.invoicesService.delete(this.selectedInvoice.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete invoice';
        console.error('Error:', error);
      }
    });
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
