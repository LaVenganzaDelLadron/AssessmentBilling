import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentBreakdown, AssessmentBreakdownService } from '../../../../../shared/services/assessment-breakdown.service';

@Component({
  selector: 'app-update-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-assessment-breakdown.modal.html',
  styleUrl: './update-assessment-breakdown.modal.css'
})
export class UpdateAssessmentBreakdownModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  currentEntity: AssessmentBreakdown | null = null;

  form: Partial<AssessmentBreakdown> = {};

  constructor(private service: AssessmentBreakdownService) {}

  open(entity: AssessmentBreakdown) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = { ...entity };
    this.errorMessage = '';
  }

  close() {
    this.isOpen = false;
  }

  submit() {
    if (!this.currentEntity?.id || !this.validate()) return;

    this.isLoading = true;
    this.service.update(this.currentEntity.id, this.form as AssessmentBreakdown).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update assessment breakdown';
      }
    });
  }

  validate(): boolean {
    if (!this.form.breakdown_name || this.form.percentage === undefined) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    if (this.form.percentage < 0 || this.form.percentage > 100) {
      this.errorMessage = 'Percentage must be between 0 and 100';
      return false;
    }
    return true;
  }
}
