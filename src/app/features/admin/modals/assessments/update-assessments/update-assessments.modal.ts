import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  Assessment as AssessmentModel,
  AssessmentStatus,
  UpdateAssessmentPayload
} from '../../../models/assessment.model';
import { AssessmentsService } from '../../../services/assessments.service';

interface AssessmentForm {
  student_id: number | null;
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  total_units: number | null;
  tuition_fee: number | null;
  misc_fee: number | null;
  lab_fee: number | null;
  other_fees: number | null;
  discount: number | null;
  status: AssessmentStatus;
}

@Component({
  selector: 'app-update-assessments-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-assessments.modal.html',
  styleUrl: './update-assessments.modal.css'
})
export class UpdateAssessmentsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: AssessmentModel | null = null;
  readonly semesters = ['1st Semester', '2nd Semester', 'Summer'];
  form: AssessmentForm = this.createEmptyForm();

  constructor(private assessmentsService: AssessmentsService) {}

  ngOnInit(): void {}

  open(entity: AssessmentModel): void {
    this.currentEntity = entity;
    this.form = {
      student_id: entity.student_id,
      academic_term_id: entity.academic_term_id,
      semester: entity.semester,
      school_year: entity.school_year,
      total_units: this.toNumber(entity.total_units),
      tuition_fee: this.toNumber(entity.tuition_fee),
      misc_fee: this.toNumber(entity.misc_fee),
      lab_fee: this.toNumber(entity.lab_fee),
      other_fees: this.toNumber(entity.other_fees),
      discount: this.toNumber(entity.discount),
      status: entity.status
    };
    this.errorMessage = '';
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student ID is required';
      return false;
    }
    if (!this.form.academic_term_id) {
      this.errorMessage = 'Academic term ID is required';
      return false;
    }
    if (!this.form.semester.trim()) {
      this.errorMessage = 'Semester is required';
      return false;
    }
    if (!this.form.school_year.trim()) {
      this.errorMessage = 'School year is required';
      return false;
    }
    if (this.form.school_year.trim().length > 9) {
      this.errorMessage = 'School year may not be greater than 9 characters';
      return false;
    }
    if (this.form.semester.trim().length > 20) {
      this.errorMessage = 'Semester may not be greater than 20 characters';
      return false;
    }
    if (this.form.total_units == null || this.form.total_units < 0) {
      this.errorMessage = 'Total units must be 0 or greater';
      return false;
    }
    if (this.form.tuition_fee == null || this.form.tuition_fee < 0) {
      this.errorMessage = 'Tuition fee must be 0 or greater';
      return false;
    }
    if (this.form.misc_fee == null || this.form.misc_fee < 0) {
      this.errorMessage = 'Misc fee must be 0 or greater';
      return false;
    }
    if (this.form.lab_fee == null || this.form.lab_fee < 0) {
      this.errorMessage = 'Lab fee must be 0 or greater';
      return false;
    }
    if (this.form.other_fees == null || this.form.other_fees < 0) {
      this.errorMessage = 'Other fees must be 0 or greater';
      return false;
    }
    if (this.form.discount == null || this.form.discount < 0) {
      this.errorMessage = 'Discount must be 0 or greater';
      return false;
    }
    if (this.computedNetAmount < 0) {
      this.errorMessage = 'Discount cannot exceed the total amount';
      return false;
    }

    return true;
  }

  submit(): void {
    if (!this.currentEntity?.id || !this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.assessmentsService.update(this.currentEntity.id, this.toPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update assessment';
      }
    });
  }

  get computedTotalAmount(): number {
    return (
      (this.form.tuition_fee ?? 0) +
      (this.form.misc_fee ?? 0) +
      (this.form.lab_fee ?? 0) +
      (this.form.other_fees ?? 0)
    );
  }

  get computedNetAmount(): number {
    return this.computedTotalAmount - (this.form.discount ?? 0);
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.currentEntity = null;
  }

  private createEmptyForm(): AssessmentForm {
    return {
      student_id: null,
      academic_term_id: null,
      semester: '',
      school_year: '',
      total_units: null,
      tuition_fee: null,
      misc_fee: null,
      lab_fee: null,
      other_fees: null,
      discount: 0,
      status: 'draft'
    };
  }

  private toPayload(): UpdateAssessmentPayload {
    return {
      student_id: this.form.student_id ?? 0,
      academic_term_id: this.form.academic_term_id ?? 0,
      semester: this.form.semester.trim(),
      school_year: this.form.school_year.trim(),
      total_units: this.form.total_units ?? 0,
      tuition_fee: this.form.tuition_fee ?? 0,
      misc_fee: this.form.misc_fee ?? 0,
      lab_fee: this.form.lab_fee ?? 0,
      other_fees: this.form.other_fees ?? 0,
      total_amount: this.computedTotalAmount,
      discount: this.form.discount ?? 0,
      net_amount: this.computedNetAmount,
      status: this.form.status
    };
  }

  private toNumber(value: unknown): number {
    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? 0 : numericValue;
  }

  private getErrorMessage(error: unknown): string | null {
    const apiError = error as {
      error?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    const validationErrors = apiError?.error?.errors;

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') {
          return messages[0];
        }
      }
    }

    return apiError?.error?.message ?? null;
  }
}
