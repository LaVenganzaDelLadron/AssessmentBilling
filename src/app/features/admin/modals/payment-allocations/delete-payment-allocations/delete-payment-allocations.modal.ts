import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { PaymentAllocation } from '../../../models/payment-allocation.model';
import { PaymentAllocationsService } from '../../../services/payment-allocations.service';

@Component({
  selector: 'app-delete-payment-allocations-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-payment-allocations.modal.html'
})
export class DeletePaymentAllocationsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  selectedAllocation: PaymentAllocation | null = null;

  constructor(private paymentAllocationsService: PaymentAllocationsService) {}

  open(allocation: PaymentAllocation): void {
    this.selectedAllocation = allocation;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedAllocation = null;
    this.errorMessage = '';
  }

  submit(): void {
    if (!this.selectedAllocation?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentAllocationsService.delete(this.selectedAllocation.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to delete payment allocation';
        console.error('Error:', error);
      }
    });
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
