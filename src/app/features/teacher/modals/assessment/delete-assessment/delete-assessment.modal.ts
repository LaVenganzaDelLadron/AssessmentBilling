import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../../environments/assessment/environment';
import { TeacherAssessment } from '../../../models/assessment.model';

@Component({
  selector: 'app-teacher-delete-assessment-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-assessment.modal.html',
  styleUrl: './delete-assessment.modal.css',
})
export class TeacherDeleteAssessmentModalComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiRoot = `${environment.apiUrl}/teacher`;

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  assessment: TeacherAssessment | null = null;

  open(assessment: TeacherAssessment): void {
    this.assessment = assessment;
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.assessment = null;
    this.errorMessage = '';
  }

  confirm(): void {
    if (!this.assessment?.id) {
      this.errorMessage = 'Assessment ID is missing.';
      return;
    }

    this.isLoading = true;

    this.http.delete(`${this.teacherApiRoot}/assessments/${this.assessment.id}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.close();
          this.refresh.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Failed to delete assessment.';
        }
      });
  }
}
