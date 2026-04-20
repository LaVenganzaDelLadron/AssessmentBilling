import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Invoice,
  InvoiceStatus,
  UpdateInvoicePayload
} from '../../../models/invoice.model';
import { InvoicesService } from '../../../services/invoices.service';

@Component({
  selector: 'app-update-invoice-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-invoice.modal.html',
})
export class UpdateInvoiceModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: UpdateInvoicePayload = this.createEmptyForm();

  readonly statuses: InvoiceStatus[] = ['unpaid', 'partial', 'paid', 'overdue'];

  constructor(private invoicesService: InvoicesService) {}

  open(invoice: Invoice): void {
    this.selectedId = invoice.id || null;
    this.form = {
      student_id: invoice.student_id,
      assessment_id: invoice.assessment_id,
      invoice_number: invoice.invoice_number,
      total_amount: Number(invoice.total_amount),
      balance: Number(invoice.balance),
      due_date: this.normalizeDateInput(invoice.due_date),
      status: invoice.status
    };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  setBalanceToTotalAmount(): void {
    this.form.balance = Number(this.form.total_amount ?? 0);
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.invoicesService.update(this.selectedId, this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update invoice';
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

  private createEmptyForm(): UpdateInvoicePayload {
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

  private buildPayload(): UpdateInvoicePayload {
    return {
      student_id: Number(this.form.student_id),
      assessment_id: Number(this.form.assessment_id),
      invoice_number: this.form.invoice_number?.trim(),
      total_amount: Number(this.form.total_amount),
      balance: Number(this.form.balance),
      due_date: this.form.due_date,
      status: this.form.status
    };
  }

  private normalizeDateInput(value: string): string {
    return value ? value.slice(0, 10) : '';
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
