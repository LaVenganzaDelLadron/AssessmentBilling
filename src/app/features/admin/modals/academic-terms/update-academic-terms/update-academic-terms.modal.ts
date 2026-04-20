import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AcademicTerm,
  UpdateAcademicTermPayload
} from '../../../models/academic-term.model';
import { AcademicTermsService } from '../../../services/academic-terms.service';

@Component({
  selector: 'app-update-academic-terms-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-academic-terms.modal.html',
})
export class UpdateAcademicTermsModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: UpdateAcademicTermPayload = this.createEmptyForm();

  semesters = ['1st Semester', '2nd Semester', 'Summer'];

  constructor(private academicTermsService: AcademicTermsService) {}

  open(term: AcademicTerm): void {
    this.selectedId = term.id || null;
    this.form = {
      school_year: term.school_year,
      semester: term.semester,
      start_date: this.normalizeDate(term.start_date),
      end_date: this.normalizeDate(term.end_date),
      is_active: term.is_active
    };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.academicTermsService.update(this.selectedId, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update academic term';
        console.error('Error updating academic term:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.school_year) {
      this.errorMessage = 'School year is required';
      return false;
    }
    if (!this.form.semester) {
      this.errorMessage = 'Semester is required';
      return false;
    }
    if (!this.form.start_date) {
      this.errorMessage = 'Start date is required';
      return false;
    }
    if (!this.form.end_date) {
      this.errorMessage = 'End date is required';
      return false;
    }
    if (new Date(this.form.start_date) > new Date(this.form.end_date)) {
      this.errorMessage = 'End date must be after or equal to start date';
      return false;
    }
    return true;
  }

  private createEmptyForm(): UpdateAcademicTermPayload {
    return {
      school_year: '',
      semester: '',
      start_date: '',
      end_date: '',
      is_active: true
    };
  }

  private normalizeDate(date: string): string {
    return date.includes('T') ? date.split('T')[0] : date;
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
