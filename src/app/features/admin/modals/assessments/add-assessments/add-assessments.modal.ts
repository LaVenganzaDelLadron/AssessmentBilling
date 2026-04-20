import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AssessmentsService, AssessmentModel } from '../../../../../shared/services/assessments.service';

@Component({
  selector: 'app-add-assessments-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-assessments.modal.html',
  styleUrl: './add-assessments.modal.css'
})
export class AddAssessmentsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  subject_id: number = 0;
  academic_term_id: number = 0;
  assessment_name = '';
  assessment_date = '';
  total_marks: number = 0;
  status = '';

  constructor(private assessmentsService: AssessmentsService) {}

  ngOnInit(): void {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (
      !this.subject_id ||
      !this.academic_term_id ||
      !this.assessment_name ||
      !this.assessment_date ||
      !this.total_marks ||
      !this.status
    ) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const data = {
      subject_id: this.subject_id,
      academic_term_id: this.academic_term_id,
      assessment_name: this.assessment_name,
      assessment_date: this.assessment_date,
      total_marks: this.total_marks,
      status: this.status
    };

    this.assessmentsService.create(data as AssessmentModel).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to create assessment';
      }
    });
  }

  private resetForm(): void {
    this.subject_id = 0;
    this.academic_term_id = 0;
    this.assessment_name = '';
    this.assessment_date = '';
    this.total_marks = 0;
    this.status = '';
    this.errorMessage = '';
  }
}
