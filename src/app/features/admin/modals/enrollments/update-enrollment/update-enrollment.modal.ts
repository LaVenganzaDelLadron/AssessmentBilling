import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Enrollment } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-update-enrollment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-enrollment.modal.html',
})
export class UpdateEnrollmentModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: Enrollment = {
    student_id: 0,
    subject_id: 0,
    academic_term_id: 0,
    status: 'enrolled'
  };

  statuses = ['enrolled', 'dropped', 'completed', 'pending'];

  constructor(private adminDataService: AdminDataService) {}

  open(enrollment: Enrollment): void {
    this.selectedId = enrollment.id || null;
    this.form = { ...enrollment };
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
      student_id: 0,
      subject_id: 0,
      academic_term_id: 0,
      status: 'enrolled'
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

    this.adminDataService.updateEnrollment(this.selectedId, this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Enrollment updated successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update enrollment';
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
