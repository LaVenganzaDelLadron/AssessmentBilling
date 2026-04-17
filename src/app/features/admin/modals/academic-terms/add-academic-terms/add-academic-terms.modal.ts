import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicTermService, AcademicTerm } from '../../../../../shared/services/academic-term.service';

@Component({
  selector: 'app-add-academic-terms-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-academic-terms.modal.html',
})
export class AddAcademicTermsModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: AcademicTerm = {
    school_year: '',
    semester: '',
    start_date: '',
    end_date: '',
    is_active: true
  };

  semesters = ['1st Semester', '2nd Semester', 'Summer'];

  constructor(private academicTermService: AcademicTermService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
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
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.academicTermService.createAcademicTerm(this.form).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Academic term added successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to add academic term';
        console.error('Error adding academic term:', error);
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
