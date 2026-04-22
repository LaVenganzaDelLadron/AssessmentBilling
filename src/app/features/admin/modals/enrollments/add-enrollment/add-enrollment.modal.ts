import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import {
  CreateEnrollmentPayload,
  EnrollmentStatus
} from '../../../models/enrollment.model';
import { EnrollmentsService } from '../../../services/enrollments.service';
import { Subject } from '../../../models/subject.model';
import { Student } from '../../../models/student.model';
import { AcademicTerm } from '../../../models/academic-term.model';
import { SubjectsService } from '../../../services/subjects.service';
import { StudentsService } from '../../../services/students.service';
import { AcademicTermsService } from '../../../services/academic-terms.service';

interface EnrollmentForm {
  student_id: number | null;
  subject_ids: number[];
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  status: EnrollmentStatus;
}

@Component({
  selector: 'app-add-enrollment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-enrollment.modal.html',
})
export class AddEnrollmentModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingStudents = false;
  isLoadingSubjects = false;
  isLoadingTerms = false;
  errorMessage = '';
  successMessage = '';

  form: EnrollmentForm = this.createEmptyForm();
  studentOptions: Student[] = [];
  subjectOptions: Subject[] = [];
  termOptions: AcademicTerm[] = [];

  statuses: EnrollmentStatus[] = ['enrolled', 'dropped'];

  constructor(
    private enrollmentsService: EnrollmentsService,
    private studentsService: StudentsService,
    private subjectsService: SubjectsService,
    private academicTermsService: AcademicTermsService
  ) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
    this.loadStudents();
    this.loadSubjects();
    this.loadTerms();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const selectedSubjectIds = this.getUniqueSubjectIds();
    const requests = selectedSubjectIds.map((subjectId) =>
      this.enrollmentsService.create(this.toPayload(subjectId))
    );

    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.refresh.emit();
          this.close();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = this.getErrorMessage(error) || 'Failed to add enrollment';
          console.error('Error:', error);
        }
      });
  }

  validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student is required';
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

  private toPayload(subjectId: number): CreateEnrollmentPayload {
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

  getStudentName(student: Student): string {
    const fullName = [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();
    return fullName || `Student #${student.id}`;
  }

  getSubjectLabel(subject: Subject): string {
    const code = subject.code || subject.subject_code || `#${subject.id}`;
    return `${code} - ${subject.name}`;
  }

  getTermLabel(term: AcademicTerm): string {
    return `${term.school_year} • ${term.semester}`;
  }

  onTermChange(): void {
    const selectedTerm = this.termOptions.find((term) => term.id === this.form.academic_term_id);
    if (!selectedTerm) {
      this.form.school_year = '';
      this.form.semester = '';
      return;
    }

    this.form.school_year = selectedTerm.school_year ?? '';
    this.form.semester = selectedTerm.semester ?? '';
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

  private loadStudents(): void {
    const cached = this.studentsService.getCachedStudents();
    if (cached && cached.length > 0) {
      this.studentOptions = [...cached].sort((a, b) =>
        this.getStudentName(a).localeCompare(this.getStudentName(b))
      );
      return;
    }

    this.isLoadingStudents = true;
    this.studentsService
      .list({ page: 1, per_page: 100 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          if (!Array.isArray(data)) {
            this.studentOptions = [];
            this.isLoadingStudents = false;
            return;
          }

          this.studentOptions = data
            .map((item: any) => ({
              id: item.id ?? item.student_id ?? 0,
              student_no: item.student_no ?? '',
              first_name: item.first_name ?? '',
              middle_name: item.middle_name ?? null,
              last_name: item.last_name ?? '',
              email: item.email ?? null,
              program_id: item.program_id ?? 0,
              year_level: item.year_level ?? 0,
              status: item.status ?? 'inactive',
              user_id: item.user_id ?? null,
              program: item.program ?? null,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
            .filter((student: Student) => !!student.id)
            .sort((a: Student, b: Student) =>
              this.getStudentName(a).localeCompare(this.getStudentName(b))
            );

          this.studentsService.setCachedStudents(this.studentOptions);
          this.isLoadingStudents = false;
        },
        error: () => {
          this.studentOptions = [];
          this.isLoadingStudents = false;
        }
      });
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

  private loadTerms(): void {
    const cached = this.academicTermsService.getCachedTerms();
    if (cached && cached.length > 0) {
      this.termOptions = [...cached].sort((a, b) =>
        this.getTermLabel(a).localeCompare(this.getTermLabel(b))
      );
      return;
    }

    this.isLoadingTerms = true;
    this.academicTermsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          if (!Array.isArray(data)) {
            this.termOptions = [];
            this.isLoadingTerms = false;
            return;
          }

          this.termOptions = data
            .map((item: any) => ({
              id: item.id ?? item.term_id ?? 0,
              school_year: item.school_year ?? '',
              semester: item.semester ?? '',
              start_date: item.start_date ?? '',
              end_date: item.end_date ?? '',
              is_active: !!item.is_active,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
            .filter((term: AcademicTerm) => !!term.id)
            .sort((a: AcademicTerm, b: AcademicTerm) =>
              this.getTermLabel(a).localeCompare(this.getTermLabel(b))
            );

          this.academicTermsService.setCachedTerms(this.termOptions);
          this.isLoadingTerms = false;
        },
        error: () => {
          this.termOptions = [];
          this.isLoadingTerms = false;
        }
      });
  }
}
