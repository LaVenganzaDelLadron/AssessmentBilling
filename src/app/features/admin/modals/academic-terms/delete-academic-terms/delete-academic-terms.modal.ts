import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicTerm } from '../../../models/academic-term.model';
import { AcademicTermsService } from '../../../services/academic-terms.service';

@Component({
  selector: 'app-delete-academic-terms-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-academic-terms.modal.html',
})
export class DeleteAcademicTermsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedTerm: AcademicTerm | null = null;

  constructor(private academicTermsService: AcademicTermsService) {}

  open(term: AcademicTerm): void {
    this.selectedTerm = term;
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.selectedTerm = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  confirm(): void {
    if (!this.selectedTerm?.id) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.academicTermsService.delete(this.selectedTerm.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete academic term';
        console.error('Error deleting academic term:', error);
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
