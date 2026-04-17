import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService, Payment } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-delete-payment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-payment.modal.html',
})
export class DeletePaymentModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedPayment: Payment | null = null;

  constructor(private adminDataService: AdminDataService) {}

  open(payment: Payment): void {
    this.selectedPayment = payment;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedPayment = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedPayment?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.deletePayment(this.selectedPayment.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Payment deleted successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete payment';
        console.error('Error:', error);
      }
    });
  }
}
