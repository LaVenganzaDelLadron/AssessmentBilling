import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Enrollment } from '../../../models/enrollment.model';
import { EnrollmentsService } from '../../../services/enrollments.service';

@Component({
  selector: 'app-delete-enrollment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-enrollment.modal.html',
})
export class DeleteEnrollmentModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedEnrollment: Enrollment | null = null;

  constructor(private enrollmentsService: EnrollmentsService) {}

  open(enrollment: Enrollment): void {
    this.selectedEnrollment = enrollment;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedEnrollment = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedEnrollment?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.enrollmentsService.delete(this.selectedEnrollment.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete enrollment';
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
