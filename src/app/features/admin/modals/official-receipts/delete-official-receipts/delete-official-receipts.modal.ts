import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { OfficialReceipt } from '../../../models/official-receipt.model';
import { OfficialReceiptsService } from '../../../services/official-receipts.service';

@Component({
  selector: 'app-delete-official-receipts-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-official-receipts.modal.html'
})
export class DeleteOfficialReceiptsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  selectedReceipt: OfficialReceipt | null = null;

  constructor(private officialReceiptsService: OfficialReceiptsService) {}

  open(receipt: OfficialReceipt): void {
    this.selectedReceipt = receipt;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedReceipt = null;
    this.errorMessage = '';
  }

  submit(): void {
    if (!this.selectedReceipt?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.officialReceiptsService.delete(this.selectedReceipt.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete receipt';
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
