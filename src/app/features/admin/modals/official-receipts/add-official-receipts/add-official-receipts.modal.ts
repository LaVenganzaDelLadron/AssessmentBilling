import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateOfficialReceiptPayload } from '../../../models/official-receipt.model';
import { OfficialReceiptsService } from '../../../services/official-receipts.service';

@Component({
  selector: 'app-add-official-receipts-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-official-receipts.modal.html'
})
export class AddOfficialReceiptsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: CreateOfficialReceiptPayload = this.createEmptyForm();

  constructor(private officialReceiptsService: OfficialReceiptsService) {}

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

    this.officialReceiptsService.create(this.buildPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to create receipt';
        console.error('Error:', error);
      }
    });
  }

  private validate(): boolean {
    if (!this.form.payment_id) {
      this.errorMessage = 'Payment ID is required';
      return false;
    }
    if (!this.form.or_number.trim()) {
      this.errorMessage = 'Official receipt number is required';
      return false;
    }
    if (this.form.or_number.trim().length > 255) {
      this.errorMessage = 'Official receipt number may not be greater than 255 characters';
      return false;
    }
    if (!this.form.issued_by.trim()) {
      this.errorMessage = 'Issued by is required';
      return false;
    }
    if (!this.form.issued_at) {
      this.errorMessage = 'Issued at is required';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
  }

  private createEmptyForm(): CreateOfficialReceiptPayload {
    return {
      payment_id: 0,
      or_number: '',
      issued_by: '',
      issued_at: ''
    };
  }

  private buildPayload(): CreateOfficialReceiptPayload {
    return {
      payment_id: Number(this.form.payment_id),
      or_number: this.form.or_number.trim(),
      issued_by: this.form.issued_by.trim(),
      issued_at: this.form.issued_at
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
