import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { environment } from '../../../../../../environments/assessment/environment';
import { TeacherAssessmentBreakdown } from '../../../models/assessment-breakdown.model';

@Component({
  selector: 'app-teacher-delete-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-assessment-breakdown.modal.html',
  styleUrl: './delete-assessment-breakdown.modal.css',
})
export class TeacherDeleteAssessmentBreakdownModalComponent {
  private readonly http = inject(HttpClient);
  private readonly teacherApiRoot = `${environment.apiUrl}/teacher`;

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  breakdown: TeacherAssessmentBreakdown | null = null;

  open(breakdown: TeacherAssessmentBreakdown): void {
    this.breakdown = breakdown;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.breakdown = null;
    this.isOpen = false;
    this.errorMessage = '';
  }

  confirm(): void {
    if (!this.breakdown?.id) {
      this.errorMessage = 'Breakdown ID is missing.';
      return;
    }

    this.isLoading = true;

    this.http.delete(`${this.teacherApiRoot}/assessment-breakdown/${this.breakdown.id}`).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error?.error?.message || 'Failed to delete assessment breakdown.';
      }
    });
  }
}
