import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Refund } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-add-refund-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-refund.modal.html',
})
export class AddRefundModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: Refund = {
    payment_id: 0,
    amount: 0,
    reason: '',
    status: 'pending'
  };

  reasons = [
    'Overpayment',
    'Duplicate Payment',
    'Cancelled Service',
    'Course Withdrawal',
    'Student Request',
    'Other'
  ];

  statuses = ['pending', 'approved', 'rejected', 'processed'];

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
      payment_id: 0,
      amount: 0,
      reason: '',
      status: 'pending'
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.createRefund(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Refund request created successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create refund';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.payment_id) {
      this.errorMessage = 'Payment ID is required';
      return false;
    }
    if (this.form.amount <= 0) {
      this.errorMessage = 'Refund amount must be greater than 0';
      return false;
    }
    if (!this.form.reason) {
      this.errorMessage = 'Reason is required';
      return false;
    }
    return true;
  }
}
