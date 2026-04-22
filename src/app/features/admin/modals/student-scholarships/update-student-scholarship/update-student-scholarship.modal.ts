import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  Scholarship,
  StudentScholarship,
  UpdateStudentScholarshipPayload
} from '../../../models/scholarship.model';
import { Student } from '../../../models/student.model';
import { ScholarshipsService } from '../../../services/scholarships.service';
import { StudentsService } from '../../../services/students.service';
import { StudentScholarshipsService } from '../../../services/student-scholarships.service';

@Component({
  selector: 'app-update-student-scholarship-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-student-scholarship.modal.html'
})
export class UpdateStudentScholarshipModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isPreparingOptions = false;
  errorMessage = '';
  currentEntity: StudentScholarship | null = null;

  students: Student[] = [];
  scholarships: Scholarship[] = [];
  form: UpdateStudentScholarshipPayload = this.createEmptyForm();

  constructor(
    private studentScholarshipsService: StudentScholarshipsService,
    private studentsService: StudentsService,
    private scholarshipsService: ScholarshipsService
  ) {}

  open(entity: StudentScholarship): void {
    this.currentEntity = entity;
    this.form = {
      student_id: entity.student_id,
      scholarship_id: entity.scholarship_id,
      discount_type: entity.discount_type,
      discount_value: this.toNumber(entity.discount_value),
      original_amount: this.toNumber(entity.original_amount),
      discount_amount: this.toNumber(entity.discount_amount),
      final_amount: this.toNumber(entity.final_amount),
      applied_at: entity.applied_at ? String(entity.applied_at).slice(0, 16) : new Date().toISOString().slice(0, 16)
    };
    this.errorMessage = '';
    this.isOpen = true;
    this.loadOptions();
  }

  close(): void {
    this.isOpen = false;
    this.isLoading = false;
    this.currentEntity = null;
    this.form = this.createEmptyForm();
    this.errorMessage = '';
  }

  submit(): void {
    if (!this.currentEntity) {
      this.errorMessage = 'No student scholarship selected';
      return;
    }

    if (!this.validate()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.recalculateAmounts();

    this.studentScholarshipsService.update(this.currentEntity.id, {
      ...this.form,
      student_id: Number(this.form.student_id),
      scholarship_id: Number(this.form.scholarship_id),
      discount_value: this.toNumber(this.form.discount_value),
      original_amount: this.toNumber(this.form.original_amount),
      discount_amount: this.toNumber(this.form.discount_amount),
      final_amount: this.toNumber(this.form.final_amount),
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update student scholarship';
      }
    });
  }

  onScholarshipChange(): void {
    const selectedId = this.toNumber(this.form.scholarship_id);
    const selected = this.scholarships.find((scholarship) => scholarship.id === selectedId);
    if (!selected) {
      return;
    }

    this.form.discount_type = selected.discount_type;
    this.form.discount_value = this.toNumber(selected.discount_value);
    this.recalculateAmounts();
  }

  recalculateAmounts(): void {
    const originalAmount = Math.max(0, this.toNumber(this.form.original_amount));
    const discountValue = Math.max(0, this.toNumber(this.form.discount_value));
    let discountAmount = this.form.discount_type === 'percent'
      ? originalAmount * (discountValue / 100)
      : discountValue;

    discountAmount = Math.min(discountAmount, originalAmount);

    this.form.original_amount = originalAmount;
    this.form.discount_amount = Number(discountAmount.toFixed(2));
    this.form.final_amount = Number((originalAmount - discountAmount).toFixed(2));
  }

  getStudentLabel(student: Student): string {
    return `${student.student_no} • ${student.first_name} ${student.last_name}`;
  }

  getScholarshipLabel(scholarship: Scholarship): string {
    return scholarship.name;
  }

  private loadOptions(): void {
    this.isPreparingOptions = true;

    this.studentsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data ?? [];
        this.students = Array.isArray(data) ? data : [];
        this.loadScholarships();
      },
      error: (error) => {
        this.isPreparingOptions = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load students';
      }
    });
  }

  private loadScholarships(): void {
    this.scholarshipsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data ?? [];
        this.scholarships = Array.isArray(data) ? data : [];
        this.isPreparingOptions = false;
      },
      error: (error) => {
        this.isPreparingOptions = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load scholarships';
      }
    });
  }

  private validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student is required';
      return false;
    }

    if (!this.form.scholarship_id) {
      this.errorMessage = 'Scholarship is required';
      return false;
    }

    const discountValue = this.toNumber(this.form.discount_value);
    if (discountValue < 0) {
      this.errorMessage = 'Discount value must be 0 or greater';
      return false;
    }

    if (this.form.discount_type === 'percent' && discountValue > 100) {
      this.errorMessage = 'Percent discount may not be greater than 100';
      return false;
    }

    return true;
  }

  private createEmptyForm(): UpdateStudentScholarshipPayload {
    return {
      student_id: null,
      scholarship_id: null,
      discount_type: 'percent',
      discount_value: 0,
      original_amount: 0,
      discount_amount: 0,
      final_amount: 0,
      applied_at: new Date().toISOString().slice(0, 16)
    };
  }

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
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
