import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService, Invoice } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-delete-invoice-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-invoice.modal.html',
})
export class DeleteInvoiceModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedInvoice: Invoice | null = null;

  constructor(private adminDataService: AdminDataService) {}

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

    this.adminDataService.deleteInvoice(this.selectedInvoice.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Invoice deleted successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete invoice';
        console.error('Error:', error);
      }
    });
  }
}
