import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminDataService, Enrollment } from '../../../../../shared/services/admin-data.service';

@Component({
  selector: 'app-delete-enrollment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-enrollment.modal.html',
})
export class DeleteEnrollmentModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedEnrollment: Enrollment | null = null;

  constructor(private adminDataService: AdminDataService) {}

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

    this.adminDataService.deleteEnrollment(this.selectedEnrollment.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Enrollment deleted successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete enrollment';
        console.error('Error:', error);
      }
    });
  }
}
