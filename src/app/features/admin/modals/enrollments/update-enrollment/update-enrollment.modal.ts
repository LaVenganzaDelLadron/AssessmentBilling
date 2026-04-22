import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, switchMap } from 'rxjs';
import {
  CreateEnrollmentPayload,
  Enrollment,
  EnrollmentStatus,
  UpdateEnrollmentPayload
} from '../../../models/enrollment.model';
import { EnrollmentsService } from '../../../services/enrollments.service';
import { Subject } from '../../../models/subject.model';
import { SubjectsService } from '../../../services/subjects.service';

interface EnrollmentForm {
  student_id: number | null;
  subject_ids: number[];
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  status: EnrollmentStatus;
}

@Component({
  selector: 'app-update-enrollment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-enrollment.modal.html',
})
export class UpdateEnrollmentModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingSubjects = false;
  errorMessage = '';
  successMessage = '';
  selectedId: number | null = null;

  form: EnrollmentForm = this.createEmptyForm();
  subjectOptions: Subject[] = [];

  statuses: EnrollmentStatus[] = ['enrolled', 'dropped'];
  semesters = ['1st Semester', '2nd Semester', 'Summer'];

  constructor(
    private enrollmentsService: EnrollmentsService,
    private subjectsService: SubjectsService
  ) {}

  open(enrollment: Enrollment): void {
    this.selectedId = enrollment.id || null;
    const subjectIdsFromRelation = (enrollment.subjects ?? [])
      .map((subject) => subject.id)
      .filter((id): id is number => typeof id === 'number' && Number.isFinite(id));
    const fallbackSubjectId =
      typeof enrollment.subject_id === 'number' && Number.isFinite(enrollment.subject_id)
        ? [enrollment.subject_id]
        : [];
    const selectedSubjectIds = Array.from(
      new Set([...subjectIdsFromRelation, ...fallbackSubjectId])
    );

    this.form = {
      student_id: enrollment.student_id,
      subject_ids: selectedSubjectIds,
      academic_term_id: enrollment.academic_term_id,
      semester: enrollment.semester,
      school_year: enrollment.school_year,
      status: this.toEnrollmentStatus(enrollment.status)
    };
    this.isOpen = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.loadSubjects();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.selectedId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;
    if (!this.selectedId) return;

    this.isLoading = true;
    this.errorMessage = '';

    const selectedSubjectIds = this.getUniqueSubjectIds();
    const primarySubjectId = selectedSubjectIds[0]!;
    const additionalSubjectIds = selectedSubjectIds.slice(1);

    this.enrollmentsService
      .update(this.selectedId, this.toPayload(primarySubjectId))
      .pipe(
        switchMap(() => {
          if (additionalSubjectIds.length === 0) {
            return of([]);
          }

          const createRequests = additionalSubjectIds.map((subjectId) =>
            this.enrollmentsService.create(this.toCreatePayload(subjectId))
          );

          return forkJoin(createRequests);
        })
      )
      .subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to update enrollment';
        console.error('Error:', error);
      }
    });
  }

  validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student ID is required';
      return false;
    }
    if (this.getUniqueSubjectIds().length === 0) {
      this.errorMessage = 'Please select at least one subject';
      return false;
    }
    if (!this.form.academic_term_id) {
      this.errorMessage = 'Academic term is required';
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
    if (this.form.semester.trim().length > 20) {
      this.errorMessage = 'Semester may not be greater than 20 characters';
      return false;
    }
    if (this.form.school_year.trim().length > 9) {
      this.errorMessage = 'School year may not be greater than 9 characters';
      return false;
    }
    if (!this.form.status) {
      this.errorMessage = 'Status is required';
      return false;
    }
    return true;
  }

  private createEmptyForm(): EnrollmentForm {
    return {
      student_id: null,
      subject_ids: [],
      academic_term_id: null,
      semester: '',
      school_year: '',
      status: 'enrolled'
    };
  }

  private toPayload(primarySubjectId: number): UpdateEnrollmentPayload {
    return {
      student_id: this.form.student_id ?? 0,
      subject_id: primarySubjectId,
      academic_term_id: this.form.academic_term_id ?? 0,
      semester: this.form.semester.trim(),
      school_year: this.form.school_year.trim(),
      status: this.form.status
    };
  }

  private toCreatePayload(subjectId: number): CreateEnrollmentPayload {
    return {
      student_id: this.form.student_id ?? 0,
      subject_id: subjectId,
      academic_term_id: this.form.academic_term_id ?? 0,
      semester: this.form.semester.trim(),
      school_year: this.form.school_year.trim(),
      status: this.form.status
    };
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

  private toEnrollmentStatus(value: unknown): EnrollmentStatus {
    return value === 'dropped' ? 'dropped' : 'enrolled';
  }

  toggleSubject(subjectId: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.checked) {
      if (!this.form.subject_ids.includes(subjectId)) {
        this.form.subject_ids = [...this.form.subject_ids, subjectId];
      }
      return;
    }

    this.form.subject_ids = this.form.subject_ids.filter((id) => id !== subjectId);
  }

  isSubjectSelected(subjectId: number): boolean {
    return this.form.subject_ids.includes(subjectId);
  }

  private getUniqueSubjectIds(): number[] {
    return Array.from(
      new Set(
        this.form.subject_ids.filter(
          (id): id is number => typeof id === 'number' && Number.isFinite(id)
        )
      )
    );
  }

  private loadSubjects(): void {
    const cached = this.subjectsService.getCachedSubjects();
    if (cached && cached.length > 0) {
      this.subjectOptions = [...cached].sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? '')
      );
      return;
    }

    this.isLoadingSubjects = true;
    this.subjectsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          if (!Array.isArray(data)) {
            this.subjectOptions = [];
            this.isLoadingSubjects = false;
            return;
          }

          this.subjectOptions = data
            .map((item: any) => ({
              id: item.id ?? item.subject_id ?? 0,
              code: item.code ?? item.subject_code ?? '',
              subject_code: item.subject_code ?? null,
              name: item.name ?? item.subject_name ?? 'N/A',
              units: item.units ?? 0,
              program_id: item.program_id ?? null,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
            .filter((subject: Subject) => !!subject.id)
            .sort((a: Subject, b: Subject) => (a.name ?? '').localeCompare(b.name ?? ''));
          this.subjectsService.setCachedSubjects(this.subjectOptions);
          this.isLoadingSubjects = false;
        },
        error: () => {
          this.subjectOptions = [];
          this.isLoadingSubjects = false;
        }
      });
  }
}
