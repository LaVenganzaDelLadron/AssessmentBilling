import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CreateScholarshipPayload } from '../../../models/scholarship.model';
import { ScholarshipsService } from '../../../services/scholarships.service';

@Component({
  selector: 'app-add-scholarship-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-scholarship.modal.html'
})
export class AddScholarshipModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: CreateScholarshipPayload = this.createEmptyForm();

  constructor(private scholarshipsService: ScholarshipsService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.scholarshipsService.create({
      name: this.form.name.trim(),
      description: this.form.description?.trim() || null,
      discount_type: this.form.discount_type,
      discount_value: Number(this.form.discount_value),
      is_active: this.form.is_active ?? true
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to create scholarship';
      }
    });
  }

  private validate(): boolean {
    if (!this.form.name.trim()) {
      this.errorMessage = 'Scholarship name is required';
      return false;
    }

    const discountValue = Number(this.form.discount_value);
    if (Number.isNaN(discountValue) || discountValue < 0) {
      this.errorMessage = 'Discount value must be 0 or greater';
      return false;
    }

    if (this.form.discount_type === 'percent' && discountValue > 100) {
      this.errorMessage = 'Percent discount may not be greater than 100';
      return false;
    }

    return true;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
  }

  private createEmptyForm(): CreateScholarshipPayload {
    return {
      name: '',
      description: '',
      discount_type: 'percent',
      discount_value: 0,
      is_active: true
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
