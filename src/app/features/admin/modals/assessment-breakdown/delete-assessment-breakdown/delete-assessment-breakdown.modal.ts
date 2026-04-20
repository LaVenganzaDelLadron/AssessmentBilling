import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AssessmentBreakdown, AssessmentBreakdownService } from '../../../../../shared/services/assessment-breakdown.service';

@Component({
  selector: 'app-delete-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-assessment-breakdown.modal.html',
  styleUrl: './delete-assessment-breakdown.modal.css'
})
export class DeleteAssessmentBreakdownModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  entityId: number | null = null;

  constructor(private service: AssessmentBreakdownService) {}

  open(entity: AssessmentBreakdown) {
    this.isOpen = true;
    this.entityId = entity.id || null;
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
  }

  confirmDelete() {
    if (!this.entityId) return;

    this.isLoading = true;
    this.service.delete(this.entityId).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to delete';
      }
    });
  }
}
