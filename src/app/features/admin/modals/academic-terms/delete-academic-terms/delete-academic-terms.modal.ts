import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AcademicTermService, AcademicTerm } from '../../../../../shared/services/academic-term.service';

@Component({
  selector: 'app-delete-academic-terms-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-academic-terms.modal.html',
})
export class DeleteAcademicTermsModalComponent {
  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  selectedTerm: AcademicTerm | null = null;

  constructor(private academicTermService: AcademicTermService) {}

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

    this.academicTermService.deleteAcademicTerm(this.selectedTerm.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Academic term deleted successfully!';
        setTimeout(() => {
          this.close();
          window.location.reload();
        }, 1500);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete academic term';
        console.error('Error deleting academic term:', error);
      }
    });
  }
}
