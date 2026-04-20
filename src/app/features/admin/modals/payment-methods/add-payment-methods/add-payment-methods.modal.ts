import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreatePaymentMethodPayload } from '../../../models/payment-method.model';
import { PaymentMethodsService } from '../../../services/payment-methods.service';

@Component({
  selector: 'app-add-payment-methods-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payment-methods.modal.html'
})
export class AddPaymentMethodsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: CreatePaymentMethodPayload = { name: '' };

  constructor(private paymentMethodsService: PaymentMethodsService) {}

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

    this.paymentMethodsService
      .create({ name: this.form.name.trim() })
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.close();
          this.refresh.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage =
            this.getErrorMessage(error) || 'Failed to create payment method';
          console.error('Error:', error);
        }
      });
  }

  private validate(): boolean {
    if (!this.form.name.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    if (this.form.name.trim().length > 255) {
      this.errorMessage = 'Name may not be greater than 255 characters';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.form = { name: '' };
    this.errorMessage = '';
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
