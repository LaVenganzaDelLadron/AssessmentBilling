import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AssessmentBreakdownSourceType,
  CreateAssessmentBreakdownPayload
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
  selector: 'app-add-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-assessment-breakdown.modal.html',
  styleUrl: './add-assessment-breakdown.modal.css'
})
export class AddAssessmentBreakdownModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  readonly sourceTypes: AssessmentBreakdownSourceType[] = ['subject', 'fee', 'discount'];
  form: AssessmentBreakdownForm = this.createEmptyForm();

  constructor(private service: AssessmentBreakdownService) {}

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  close() {
    this.isOpen = false;
  }

  resetForm() {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.service.create(this.toPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to create assessment breakdown';
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

  private toPayload(): CreateAssessmentBreakdownPayload {
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
