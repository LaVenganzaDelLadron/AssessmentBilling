import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatePaymentAllocationPayload } from '../../../models/payment-allocation.model';
import { PaymentAllocationsService } from '../../../services/payment-allocations.service';

@Component({
  selector: 'app-add-payment-allocations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payment-allocations.modal.html'
})
export class AddPaymentAllocationsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: CreatePaymentAllocationPayload = this.createEmptyForm();

  constructor(private paymentAllocationsService: PaymentAllocationsService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentAllocationsService.create(this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to create payment allocation';
        console.error('Error:', error);
      }
    });
  }

  private validate(): boolean {
    if (!this.form.payment_id) {
      this.errorMessage = 'Payment ID is required';
      return false;
    }
    if (!this.form.invoice_id) {
      this.errorMessage = 'Invoice ID is required';
      return false;
    }
    if (Number(this.form.amount_applied) <= 0) {
      this.errorMessage = 'Amount applied must be greater than 0';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
  }

  private createEmptyForm(): CreatePaymentAllocationPayload {
    return {
      payment_id: 0,
      invoice_id: 0,
      amount_applied: 0
    };
  }

  private buildPayload(): CreatePaymentAllocationPayload {
    return {
      payment_id: Number(this.form.payment_id),
      invoice_id: Number(this.form.invoice_id),
      amount_applied: Number(this.form.amount_applied)
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
