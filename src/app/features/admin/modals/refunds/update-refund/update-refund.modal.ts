import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Refund } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-update-refund-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-refund.modal.html',
})
export class UpdateRefundModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

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

  open(refund: Refund): void {
    this.selectedId = refund.id || null;
    this.form = { ...refund };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
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
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.updateRefund(this.selectedId, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Refund updated successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update refund';
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
