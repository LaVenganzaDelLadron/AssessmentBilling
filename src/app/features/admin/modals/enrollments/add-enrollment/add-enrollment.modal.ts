import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Enrollment } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-add-enrollment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-enrollment.modal.html',
})
export class AddEnrollmentModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: Enrollment = {
    student_id: 0,
    subject_id: 0,
    academic_term_id: 0,
    status: 'enrolled'
  };

  statuses = ['enrolled', 'dropped', 'completed', 'pending'];

  constructor(private adminDataService: AdminDataService) {}

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
      student_id: 0,
      subject_id: 0,
      academic_term_id: 0,
      status: 'enrolled'
    };
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.createEnrollment(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Enrollment added successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to add enrollment';
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
    if (!this.form.status) {
      this.errorMessage = 'Status is required';
      return false;
    }
    return true;
  }
}
