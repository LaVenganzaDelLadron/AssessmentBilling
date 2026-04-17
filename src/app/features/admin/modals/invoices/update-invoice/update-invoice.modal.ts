import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Invoice } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-update-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-invoice.modal.html',
})
export class UpdateInvoiceModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: Invoice = {
    student_id: 0,
    assessment_id: 0,
    invoice_number: '',
    total_amount: 0,
    balance: 0,
    due_date: '',
    status: 'pending'
  };

  statuses = ['pending', 'paid', 'overdue', 'cancelled'];

  constructor(private adminDataService: AdminDataService) {}

  open(invoice: Invoice): void {
    this.selectedId = invoice.id || null;
    this.form = { ...invoice };
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
      student_id: 0,
      assessment_id: 0,
      invoice_number: '',
      total_amount: 0,
      balance: 0,
      due_date: '',
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

    this.adminDataService.updateInvoice(this.selectedId, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Invoice updated successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update invoice';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student ID is required';
      return false;
    }
    if (!this.form.assessment_id) {
      this.errorMessage = 'Assessment ID is required';
      return false;
    }
    if (!this.form.invoice_number) {
      this.errorMessage = 'Invoice number is required';
      return false;
    }
    if (this.form.total_amount <= 0) {
      this.errorMessage = 'Total amount must be greater than 0';
      return false;
    }
    if (!this.form.due_date) {
      this.errorMessage = 'Due date is required';
      return false;
    }
    return true;
  }
}
