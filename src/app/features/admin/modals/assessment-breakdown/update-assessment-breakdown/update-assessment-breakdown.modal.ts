import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AssessmentBreakdown,
  AssessmentBreakdownSourceType,
  UpdateAssessmentBreakdownPayload
} from '../../../models/assessment-breakdown.model';
import { AssessmentBreakdownService } from '../../../services/assessment-breakdown.service';

interface AssessmentBreakdownForm {
  assessment_id: number | null;
  source_type: AssessmentBreakdownSourceType;
  source_id: string;
  description: string;
  units: number | null;
  rate: number | null;
  amount: number | null;
}

@Component({
  selector: 'app-update-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-assessment-breakdown.modal.html',
  styleUrl: './update-assessment-breakdown.modal.css'
})
export class UpdateAssessmentBreakdownModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: AssessmentBreakdown | null = null;
  readonly sourceTypes: AssessmentBreakdownSourceType[] = ['subject', 'fee', 'discount'];

  form: AssessmentBreakdownForm = this.createEmptyForm();

  constructor(private service: AssessmentBreakdownService) {}

  open(entity: AssessmentBreakdown) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = {
      assessment_id: entity.assessment_id,
      source_type: entity.source_type,
      source_id: entity.source_id ?? '',
      description: entity.description,
      units: this.toNumberOrNull(entity.units),
      rate: this.toNumberOrNull(entity.rate),
      amount: this.toNumberOrNull(entity.amount)
    };
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
    this.resetForm();
  }

  submit() {
    if (!this.currentEntity?.id || !this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.service.update(this.currentEntity.id, this.toPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to update assessment breakdown';
      }
    });
  }

  validate(): boolean {
    if (!this.form.assessment_id) {
      this.errorMessage = 'Assessment ID is required';
      return false;
    }
    if (!this.form.source_type) {
      this.errorMessage = 'Source type is required';
      return false;
    }
    if (this.requiresSourceId() && !this.form.source_id.trim()) {
      this.errorMessage = 'Source ID is required when the source type is subject or fee';
      return false;
    }
    if (!this.form.description.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }
    if (this.form.units != null && this.form.units < 0) {
      this.errorMessage = 'Units must be at least 0';
      return false;
    }
    if (this.form.rate != null && this.form.rate < 0) {
      this.errorMessage = 'Rate must be at least 0';
      return false;
    }
    if (this.form.amount == null) {
      this.errorMessage = 'Amount is required';
      return false;
    }

    return true;
  }

  onSourceTypeChange(): void {
    if (!this.requiresSourceId()) {
      this.form.source_id = '';
    }
  }

  requiresSourceId(): boolean {
    return this.form.source_type === 'subject' || this.form.source_type === 'fee';
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.currentEntity = null;
    this.errorMessage = '';
  }

  private createEmptyForm(): AssessmentBreakdownForm {
    return {
      assessment_id: null,
      source_type: 'subject',
      source_id: '',
      description: '',
      units: null,
      rate: null,
      amount: null
    };
  }

  private toPayload(): UpdateAssessmentBreakdownPayload {
    return {
      assessment_id: this.form.assessment_id ?? 0,
      source_type: this.form.source_type,
      source_id: this.requiresSourceId() ? this.form.source_id.trim() : null,
      description: this.form.description.trim(),
      units: this.form.units,
      rate: this.form.rate,
      amount: this.form.amount ?? 0
    };
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value == null || value === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? null : numericValue;
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
