import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentBreakdown } from '../../../models/assessment-breakdown.model';
import { AssessmentBreakdownService } from '../../../services/assessment-breakdown.service';

@Component({
  selector: 'app-delete-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-assessment-breakdown.modal.html',
  styleUrl: './delete-assessment-breakdown.modal.css'
})
export class DeleteAssessmentBreakdownModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: AssessmentBreakdown | null = null;

  constructor(private service: AssessmentBreakdownService) {}

  open(entity: AssessmentBreakdown) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
    this.currentEntity = null;
  }

  confirmDelete() {
    if (!this.currentEntity?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.service.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete';
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
