import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CreateEnrollmentPayload,
  EnrollmentStatus
} from '../../../models/enrollment.model';
import { EnrollmentsService } from '../../../services/enrollments.service';

interface EnrollmentForm {
  student_id: number | null;
  subject_id: number | null;
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  status: EnrollmentStatus;
}

@Component({
  selector: 'app-add-enrollment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-enrollment.modal.html',
})
export class AddEnrollmentModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: EnrollmentForm = this.createEmptyForm();

  statuses: EnrollmentStatus[] = ['enrolled', 'dropped'];
  semesters = ['1st Semester', '2nd Semester', 'Summer'];

  constructor(private enrollmentsService: EnrollmentsService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.enrollmentsService.create(this.toPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to add enrollment';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student ID is required';
      return false;
    }
    if (!this.form.subject_id) {
      this.errorMessage = 'Subject ID is required';
      return false;
    }
    if (!this.form.academic_term_id) {
      this.errorMessage = 'Academic term is required';
      return false;
    }
    if (!this.form.semester.trim()) {
      this.errorMessage = 'Semester is required';
      return false;
    }
    if (!this.form.school_year.trim()) {
      this.errorMessage = 'School year is required';
      return false;
    }
    if (this.form.semester.trim().length > 20) {
      this.errorMessage = 'Semester may not be greater than 20 characters';
      return false;
    }
    if (this.form.school_year.trim().length > 9) {
      this.errorMessage = 'School year may not be greater than 9 characters';
      return false;
    }
    if (!this.form.status) {
      this.errorMessage = 'Status is required';
      return false;
    }
    return true;
  }

  private createEmptyForm(): EnrollmentForm {
    return {
      student_id: null,
      subject_id: null,
      academic_term_id: null,
      semester: '',
      school_year: '',
      status: 'enrolled'
    };
  }

  private toPayload(): CreateEnrollmentPayload {
    return {
      student_id: this.form.student_id ?? 0,
      subject_id: this.form.subject_id ?? 0,
      academic_term_id: this.form.academic_term_id ?? 0,
      semester: this.form.semester.trim(),
      school_year: this.form.school_year.trim(),
      status: this.form.status
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
