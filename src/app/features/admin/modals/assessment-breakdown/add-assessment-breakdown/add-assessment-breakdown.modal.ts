import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentBreakdown, AssessmentBreakdownService } from '../../../../../shared/services/assessment-breakdown.service';

@Component({
  selector: 'app-add-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-assessment-breakdown.modal.html',
  styleUrl: './add-assessment-breakdown.modal.css'
})
export class AddAssessmentBreakdownModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  form: Partial<AssessmentBreakdown> = {
    assessment_id: undefined,
    breakdown_name: '',
    percentage: 0
  };

  constructor(private service: AssessmentBreakdownService) {}

  open() {
    this.isOpen = true;
    this.resetForm();
  }

  close() {
    this.isOpen = false;
  }

  resetForm() {
    this.form = {
      assessment_id: undefined,
      breakdown_name: '',
      percentage: 0
    };
    this.errorMessage = '';
  }

  submit() {
    if (!this.validate()) return;

    this.isLoading = true;
    this.service.create(this.form as AssessmentBreakdown).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to create assessment breakdown';
      }
    });
  }

  validate(): boolean {
    if (!this.form.assessment_id || !this.form.breakdown_name || this.form.percentage === undefined) {
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
