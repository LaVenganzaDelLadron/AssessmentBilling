import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicTermService, AcademicTerm } from '../../../../../shared/services/academic-term.service';

@Component({
  selector: 'app-update-academic-terms-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-academic-terms.modal.html',
})
export class UpdateAcademicTermsModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: AcademicTerm = {
    school_year: '',
    semester: '',
    start_date: '',
    end_date: '',
    is_active: true
  };

  semesters = ['1st Semester', '2nd Semester', 'Summer'];

  constructor(private academicTermService: AcademicTermService) {}

  open(term: AcademicTerm): void {
    this.selectedId = term.id || null;
    this.form = { ...term };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = {
      school_year: '',
      semester: '',
      start_date: '',
      end_date: '',
      is_active: true
    };
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.academicTermService.updateAcademicTerm(this.selectedId, this.form).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Academic term updated successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update academic term';
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
    if (new Date(this.form.start_date) >= new Date(this.form.end_date)) {
      this.errorMessage = 'End date must be after start date';
      return false;
    }
    return true;
  }
}
