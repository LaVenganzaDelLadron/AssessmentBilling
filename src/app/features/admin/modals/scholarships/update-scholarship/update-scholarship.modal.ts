import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Scholarship, UpdateScholarshipPayload } from '../../../models/scholarship.model';
import { ScholarshipsService } from '../../../services/scholarships.service';

@Component({
  selector: 'app-update-scholarship-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-scholarship.modal.html'
})
export class UpdateScholarshipModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: Scholarship | null = null;

  form: UpdateScholarshipPayload = this.createEmptyForm();

  constructor(private scholarshipsService: ScholarshipsService) {}

  open(entity: Scholarship): void {
    this.currentEntity = entity;
    this.form = {
      name: entity.name,
      description: entity.description ?? '',
      discount_type: entity.discount_type,
      discount_value: Number(entity.discount_value),
      is_active: entity.is_active
    };
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    const currentEntity = this.currentEntity;
    if (!currentEntity) {
      this.errorMessage = 'No scholarship selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.scholarshipsService.update(currentEntity.id, {
      name: this.form.name?.trim(),
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
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update scholarship';
      }
    });
  }

  private validate(): boolean {
    if (!this.form.name?.trim()) {
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
    this.currentEntity = null;
    this.errorMessage = '';
  }

  private createEmptyForm(): UpdateScholarshipPayload {
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
