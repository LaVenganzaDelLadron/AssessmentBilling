import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  FeeStructure,
  UpdateFeeStructurePayload
} from '../../../models/fee-structure.model';
import { FeeStructuresService } from '../../../services/fee-structures.service';

@Component({
  selector: 'app-update-fee-structure-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-fee-structure.modal.html',
})
export class UpdateFeeStructureModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: UpdateFeeStructurePayload = this.createEmptyForm();

  feeTypes = ['Tuition', 'Laboratory', 'Library', 'Technology', 'Registration', 'Other'];

  constructor(private feeStructuresService: FeeStructuresService) {}

  open(fee: FeeStructure): void {
    this.selectedId = fee.id || null;
    this.form = {
      program_id: fee.program_id,
      fee_type: fee.fee_type,
      amount: Number(fee.amount),
      per_unit: fee.per_unit
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

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.feeStructuresService.update(this.selectedId, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update fee structure';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.program_id) {
      this.errorMessage = 'Program is required';
      return false;
    }
    if (!this.form.fee_type) {
      this.errorMessage = 'Fee type is required';
      return false;
    }
    if (this.form.fee_type.trim().length > 255) {
      this.errorMessage = 'Fee type may not be greater than 255 characters';
      return false;
    }
    if (Number(this.form.amount) < 0) {
      this.errorMessage = 'Amount must be at least 0';
      return false;
    }
    return true;
  }

  private createEmptyForm(): UpdateFeeStructurePayload {
    return {
      program_id: 0,
      fee_type: '',
      amount: 0,
      per_unit: false
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
