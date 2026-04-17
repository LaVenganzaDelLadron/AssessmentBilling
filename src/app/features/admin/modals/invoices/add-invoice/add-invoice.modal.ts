import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Invoice } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-add-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice.modal.html',
})
export class AddInvoiceModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

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
      student_id: 0,
      assessment_id: 0,
      invoice_number: '',
      total_amount: 0,
      balance: 0,
      due_date: '',
      status: 'pending'
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.createInvoice(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Invoice created successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create invoice';
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
