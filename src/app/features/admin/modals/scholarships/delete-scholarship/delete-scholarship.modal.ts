import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { Scholarship } from '../../../models/scholarship.model';
import { ScholarshipsService } from '../../../services/scholarships.service';

@Component({
  selector: 'app-delete-scholarship-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-scholarship.modal.html'
})
export class DeleteScholarshipModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: Scholarship | null = null;

  constructor(private scholarshipsService: ScholarshipsService) {}

  open(entity: Scholarship): void {
    this.currentEntity = entity;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    const currentEntity = this.currentEntity;
    if (!currentEntity) {
      this.errorMessage = 'No scholarship selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.scholarshipsService.delete(currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete scholarship';
      }
    });
  }

  private resetForm(): void {
    this.currentEntity = null;
    this.errorMessage = '';
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
