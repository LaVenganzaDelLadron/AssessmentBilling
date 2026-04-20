import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CreateInvoicePayload,
  InvoiceStatus
} from '../../../models/invoice.model';
import { InvoicesService } from '../../../services/invoices.service';

@Component({
  selector: 'app-add-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice.modal.html',
})
export class AddInvoiceModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: CreateInvoicePayload = this.createEmptyForm();

  readonly statuses: InvoiceStatus[] = ['unpaid', 'partial', 'paid', 'overdue'];

  constructor(private invoicesService: InvoicesService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  setBalanceToTotalAmount(): void {
    this.form.balance = Number(this.form.total_amount);
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.invoicesService.create(this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to create invoice';
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
    if (this.form.invoice_number.trim().length > 255) {
      this.errorMessage = 'Invoice number may not be greater than 255 characters';
      return false;
    }
    if (Number(this.form.total_amount) < 0) {
      this.errorMessage = 'Total amount must be at least 0';
      return false;
    }
    if (Number(this.form.balance) < 0) {
      this.errorMessage = 'Balance must be at least 0';
      return false;
    }
    if (!this.form.due_date) {
      this.errorMessage = 'Due date is required';
      return false;
    }
    return true;
  }

  private createEmptyForm(): CreateInvoicePayload {
    return {
      student_id: 0,
      assessment_id: 0,
      invoice_number: '',
      total_amount: 0,
      balance: 0,
      due_date: '',
      status: 'unpaid'
    };
  }

  private buildPayload(): CreateInvoicePayload {
    return {
      student_id: Number(this.form.student_id),
      assessment_id: Number(this.form.assessment_id),
      invoice_number: this.form.invoice_number.trim(),
      total_amount: Number(this.form.total_amount),
      balance: Number(this.form.balance),
      due_date: this.form.due_date,
      status: this.form.status
    };
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
