import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { InvoiceLine } from '../../../models/invoice-line.model';
import { InvoiceLinesService } from '../../../services/invoice-lines.service';

@Component({
  selector: 'app-delete-invoice-lines-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-invoice-lines.modal.html'
})
export class DeleteInvoiceLinesModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  selectedLine: InvoiceLine | null = null;

  constructor(private invoiceLinesService: InvoiceLinesService) {}

  open(entity: InvoiceLine): void {
    this.selectedLine = entity;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    if (!this.selectedLine?.id) {
      this.isLoading = false;
      return;
    }

    this.invoiceLinesService.delete(this.selectedLine.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete invoice line';
        console.error('Error:', error);
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.selectedLine = null;
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
