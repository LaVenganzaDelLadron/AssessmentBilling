import { Component, ViewChild, Output, EventEmitter, OnInit, DestroyRef, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  Assessment as AssessmentModel,
  AssessmentStatus,
  UpdateAssessmentPayload
} from '../../../models/assessment.model';
import { AssessmentsService } from '../../../services/assessments.service';
import { EnrollmentsService } from '../../../services/enrollments.service';
import { SubjectsService } from '../../../services/subjects.service';
import { StudentsService } from '../../../services/students.service';
import { AcademicTermsService } from '../../../services/academic-terms.service';
import { Student } from '../../../models/student.model';
import { Subject } from '../../../models/subject.model';
import { AcademicTerm } from '../../../models/academic-term.model';

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

interface EnrollmentBundle {
  student_id: number;
  student_name: string;
  academic_term_id: number;
  school_year: string;
  semester: string;
  subject_ids: number[];
}

@Component({
  selector: 'app-update-assessment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-assessment.modal.html',
  styleUrl: './update-assessment.modal.css'
})
export class UpdateAssessmentModalComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingReferenceData = false;
  errorMessage = '';

  currentEntity: AssessmentModel | null = null;
  form: AssessmentForm = this.createEmptyForm();
  students: Student[] = [];
  subjectsById = new Map<number, Subject>();
  termsById = new Map<number, AcademicTerm>();
  enrollmentBundles: EnrollmentBundle[] = [];
  availableTerms: EnrollmentBundle[] = [];
  selectedSubjectNames: string[] = [];

  constructor(
    private assessmentsService: AssessmentsService,
    private enrollmentsService: EnrollmentsService,
    private subjectsService: SubjectsService,
    private studentsService: StudentsService,
    private academicTermsService: AcademicTermsService
  ) {}

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
    this.availableTerms = this.buildAvailableTerms();
    this.errorMessage = '';
    this.isOpen = true;
    this.loadReferenceData();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  onStudentChange(): void {
    this.form.academic_term_id = null;
    this.form.semester = '';
    this.form.school_year = '';
    this.form.total_units = 0;
    this.availableTerms = this.buildAvailableTerms();
    this.selectedSubjectNames = [];
  }

  onAcademicTermChange(): void {
    this.recomputeFromEnrollment();
  }

  private buildAvailableTerms(): EnrollmentBundle[] {
    if (!this.form.student_id) {
      return [];
    }

    return this.enrollmentBundles
      .filter((bundle) => bundle.student_id === this.form.student_id)
      .sort((a, b) => this.getTermLabel(a).localeCompare(this.getTermLabel(b)));
  }

  getStudentLabel(student: Student): string {
    const fullName = [student.first_name, student.middle_name, student.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return fullName || `Student #${student.id}`;
  }

  getTermLabel(bundle: EnrollmentBundle): string {
    return `${bundle.school_year} • ${bundle.semester}`;
  }

  validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student is required';
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

  private loadReferenceData(): void {
    this.isLoadingReferenceData = true;

    this.loadStudents();
    this.loadSubjects();
    this.loadTerms();
    this.loadEnrollmentBundles();
  }

  private loadStudents(): void {
    const cached = this.studentsService.getCachedStudents();
    if (cached?.length) {
      this.students = [...cached].sort((a, b) =>
        this.getStudentLabel(a).localeCompare(this.getStudentLabel(b))
      );
      this.availableTerms = this.buildAvailableTerms();
      return;
    }

    this.studentsService
      .list({ page: 1, per_page: 200 })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          if (!Array.isArray(data)) {
            this.students = [];
            return;
          }

          this.students = data
            .map((item: any) => ({
              id: this.normalizeNumber(item.id ?? item.student_id) ?? 0,
              student_no: item.student_no ?? '',
              first_name: item.first_name ?? '',
              middle_name: item.middle_name ?? null,
              last_name: item.last_name ?? '',
              email: item.email ?? null,
              program_id: this.normalizeNumber(item.program_id) ?? 0,
              year_level: this.normalizeNumber(item.year_level) ?? 0,
              status: item.status ?? 'inactive',
              user_id: this.normalizeNumber(item.user_id),
              program: item.program ?? null,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
            .filter((student: Student) => !!student.id)
            .sort((a: Student, b: Student) =>
              this.getStudentLabel(a).localeCompare(this.getStudentLabel(b))
            );

          this.studentsService.setCachedStudents(this.students);
          this.availableTerms = this.buildAvailableTerms();
        },
        error: () => {
          this.students = [];
          this.availableTerms = this.buildAvailableTerms();
        }
      });
  }

  private loadSubjects(): void {
    const cached = this.subjectsService.getCachedSubjects();
    if (cached?.length) {
      this.subjectsById = new Map(cached.map((subject) => [subject.id, subject]));
      this.recomputeFromEnrollment();
      return;
    }

    this.subjectsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          if (!Array.isArray(data)) {
            this.subjectsById = new Map();
            return;
          }

          const mapped: Subject[] = data
            .map((item: any) => ({
              id: this.normalizeNumber(item.id ?? item.subject_id) ?? 0,
              code: item.code ?? item.subject_code ?? '',
              subject_code: item.subject_code ?? null,
              name: item.name ?? item.subject_name ?? 'N/A',
              units: item.units ?? 0,
              program_id: this.normalizeNumber(item.program_id),
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
            .filter((subject: Subject) => !!subject.id);

          this.subjectsById = new Map(mapped.map((subject) => [subject.id, subject]));
          this.subjectsService.setCachedSubjects(mapped);
          this.recomputeFromEnrollment();
        },
        error: () => {
          this.subjectsById = new Map();
          this.recomputeFromEnrollment();
        }
      });
  }

  private loadTerms(): void {
    const cached = this.academicTermsService.getCachedTerms();
    if (cached?.length) {
      this.termsById = new Map(cached.map((term) => [term.id, term]));
      this.availableTerms = this.buildAvailableTerms();
      return;
    }

    this.academicTermsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          if (!Array.isArray(data)) {
            this.termsById = new Map();
            return;
          }

          const mapped: AcademicTerm[] = data
            .map((item: any) => ({
              id: this.normalizeNumber(item.id ?? item.term_id) ?? 0,
              school_year: item.school_year ?? '',
              semester: item.semester ?? '',
              start_date: item.start_date ?? '',
              end_date: item.end_date ?? '',
              is_active: !!item.is_active,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
            .filter((term: AcademicTerm) => !!term.id);

          this.termsById = new Map(mapped.map((term) => [term.id, term]));
          this.academicTermsService.setCachedTerms(mapped);
          this.availableTerms = this.buildAvailableTerms();
        },
        error: () => {
          this.termsById = new Map();
          this.availableTerms = this.buildAvailableTerms();
        }
      });
  }

  private loadEnrollmentBundles(): void {
    this.enrollmentsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          this.enrollmentBundles = this.mapEnrollmentBundles(data);
          this.availableTerms = this.buildAvailableTerms();
          this.isLoadingReferenceData = false;
          this.recomputeFromEnrollment();
        },
        error: () => {
          this.enrollmentBundles = [];
          this.availableTerms = this.buildAvailableTerms();
          this.isLoadingReferenceData = false;
          this.recomputeFromEnrollment();
        }
      });
  }

  private recomputeFromEnrollment(): void {
    const bundle = this.enrollmentBundles.find(
      (row) =>
        row.student_id === this.form.student_id &&
        row.academic_term_id === this.form.academic_term_id
    );

    if (!bundle) {
      this.form.semester = '';
      this.form.school_year = '';
      this.form.total_units = 0;
      this.selectedSubjectNames = [];
      return;
    }

    this.form.semester = bundle.semester;
    this.form.school_year = bundle.school_year;
    this.form.total_units = this.computeTotalUnits(bundle.subject_ids);
    this.selectedSubjectNames = this.getSubjectNames(bundle.subject_ids);
  }

  private computeTotalUnits(subjectIds: number[]): number {
    return subjectIds.reduce((sum, subjectId) => {
      const subject = this.subjectsById.get(subjectId);
      const units = Number(subject?.units ?? 0);
      return sum + (Number.isNaN(units) ? 0 : units);
    }, 0);
  }

  private getSubjectNames(subjectIds: number[]): string[] {
    return subjectIds.map((subjectId) => {
      const subject = this.subjectsById.get(subjectId);
      if (subject) {
        return `${subject.code || subject.subject_code || `#${subject.id}`} - ${subject.name}`;
      }
      return `Subject #${subjectId}`;
    });
  }

  private mapEnrollmentBundles(data: unknown): EnrollmentBundle[] {
    if (!Array.isArray(data)) {
      return [];
    }

    const grouped = new Map<string, EnrollmentBundle>();

    for (const item of data as any[]) {
      const studentId = this.normalizeNumber(item.student_id ?? item.student?.id);
      const termId = this.normalizeNumber(item.academic_term_id ?? item.academic_term?.id);

      if (!studentId || !termId) {
        continue;
      }

      const key = `${studentId}:${termId}`;
      const schoolYear = this.safeText(item.school_year ?? item.academic_term?.school_year);
      const semester = this.safeText(item.semester ?? item.academic_term?.semester);
      const studentName = this.safeText(item.student?.name) || this.getStudentNameById(studentId);

      if (!grouped.has(key)) {
        grouped.set(key, {
          student_id: studentId,
          student_name: studentName,
          academic_term_id: termId,
          school_year: schoolYear || this.termsById.get(termId)?.school_year || '',
          semester: semester || this.termsById.get(termId)?.semester || '',
          subject_ids: []
        });
      }

      const target = grouped.get(key)!;
      const subjectIds = this.extractSubjectIds(item);
      for (const subjectId of subjectIds) {
        if (!target.subject_ids.includes(subjectId)) {
          target.subject_ids.push(subjectId);
        }
      }
    }

    return Array.from(grouped.values())
      .filter((bundle) => bundle.subject_ids.length > 0)
      .sort((a, b) => {
        if (a.student_name !== b.student_name) {
          return a.student_name.localeCompare(b.student_name);
        }
        return this.getTermLabel(a).localeCompare(this.getTermLabel(b));
      });
  }

  private extractSubjectIds(item: any): number[] {
    if (Array.isArray(item.subjects)) {
      return item.subjects
        .filter((subject: any) => this.safeText(subject?.status).toLowerCase() !== 'dropped')
        .map((subject: any) => this.normalizeNumber(subject?.id))
        .filter((id: number | null): id is number => !!id);
    }

    const status = this.safeText(item.status).toLowerCase();
    if (status === 'dropped') {
      return [];
    }

    const subjectId = this.normalizeNumber(item.subject_id ?? item.subject?.id);
    return subjectId ? [subjectId] : [];
  }

  private getStudentNameById(studentId: number): string {
    const student = this.students.find((entry) => entry.id === studentId);
    return student ? this.getStudentLabel(student) : `Student #${studentId}`;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.currentEntity = null;
    this.availableTerms = [];
    this.selectedSubjectNames = [];
  }

  private createEmptyForm(): AssessmentForm {
    return {
      student_id: null,
      academic_term_id: null,
      semester: '',
      school_year: '',
      total_units: 0,
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

  private normalizeNumber(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
  }

  private safeText(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
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
