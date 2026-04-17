import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Payment } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-add-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payment.modal.html',
})
export class AddPaymentModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: Payment = {
    invoice_id: 0,
    amount_paid: 0,
    reference_number: '',
    paid_at: '',
    payment_method_id: 0
  };

  paymentMethods = [
    { id: 1, name: 'Cash' },
    { id: 2, name: 'Credit/Debit Card' },
    { id: 3, name: 'Check' },
    { id: 4, name: 'Bank Transfer' },
    { id: 5, name: 'Online Payment' },
    { id: 6, name: 'Other' }
  ];

  constructor(private adminDataService: AdminDataService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      invoice_id: 0,
      amount_paid: 0,
      reference_number: '',
      paid_at: '',
      payment_method_id: 0
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.createPayment(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Payment recorded successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to record payment';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.invoice_id) {
      this.errorMessage = 'Invoice ID is required';
      return false;
    }
    if (this.form.amount_paid <= 0) {
      this.errorMessage = 'Amount paid must be greater than 0';
      return false;
    }
    if (!this.form.reference_number) {
      this.errorMessage = 'Reference number is required';
      return false;
    }
    if (!this.form.paid_at) {
      this.errorMessage = 'Payment date is required';
      return false;
    }
    if (!this.form.payment_method_id) {
      this.errorMessage = 'Payment method is required';
      return false;
    }
    return true;
  }
}
