import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { StudentScholarship } from '../../../models/scholarship.model';
import { StudentScholarshipsService } from '../../../services/student-scholarships.service';

@Component({
  selector: 'app-delete-student-scholarship-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-student-scholarship.modal.html'
})
export class DeleteStudentScholarshipModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: StudentScholarship | null = null;

  constructor(private studentScholarshipsService: StudentScholarshipsService) {}

  open(entity: StudentScholarship): void {
    this.currentEntity = entity;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.currentEntity = null;
    this.errorMessage = '';
  }

  submit(): void {
    if (!this.currentEntity) {
      this.errorMessage = 'No student scholarship selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.studentScholarshipsService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to delete student scholarship';
      }
    });
  }

  get studentLabel(): string {
    const student = this.currentEntity?.student;
    if (student?.first_name || student?.last_name) {
      return [student.first_name, student.last_name].filter(Boolean).join(' ');
    }

    return this.currentEntity?.student_id ? `Student #${this.currentEntity.student_id}` : 'Unknown student';
  }

  get scholarshipLabel(): string {
    return this.currentEntity?.scholarship?.name
      || (this.currentEntity?.scholarship_id ? `Scholarship #${this.currentEntity.scholarship_id}` : 'Unknown scholarship');
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
