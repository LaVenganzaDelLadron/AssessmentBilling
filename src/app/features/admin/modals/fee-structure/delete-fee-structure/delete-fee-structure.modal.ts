import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeeStructure } from '../../../models/fee-structure.model';
import { FeeStructuresService } from '../../../services/fee-structures.service';

@Component({
  selector: 'app-delete-fee-structure-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-fee-structure.modal.html',
})
export class DeleteFeeStructureModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedFee: FeeStructure | null = null;

  constructor(private feeStructuresService: FeeStructuresService) {}

  open(fee: FeeStructure): void {
    this.selectedFee = fee;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedFee = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedFee?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.feeStructuresService.delete(this.selectedFee.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete fee structure';
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
