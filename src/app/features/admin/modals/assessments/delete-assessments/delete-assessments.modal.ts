import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Assessment as AssessmentModel } from '../../../models/assessment.model';
import { AssessmentsService } from '../../../services/assessments.service';

@Component({
  selector: 'app-delete-assessments-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-assessments.modal.html',
  styleUrl: './delete-assessments.modal.css'
})
export class DeleteAssessmentsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: AssessmentModel | null = null;

  constructor(private assessmentsService: AssessmentsService) {}

  ngOnInit(): void {}

  open(entity: AssessmentModel): void {
    this.currentEntity = entity;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    if (!this.currentEntity?.id) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.assessmentsService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete assessment';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
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
