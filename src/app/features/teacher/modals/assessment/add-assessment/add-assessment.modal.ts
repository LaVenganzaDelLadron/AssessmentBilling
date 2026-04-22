import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../../environments/assessment/environment';
import { TeacherAssessmentPayload, TeacherAssessmentStatus } from '../../../models/assessment.model';
import { TeacherEnrollment } from '../../../models/enrollment.model';

interface TeacherStudentOption {
  id: number;
  label: string;
}

interface EnrollmentBundle {
  student_id: number;
  student_name: string;
  academic_term_id: number;
  school_year: string;
  semester: string;
  subject_names: string[];
  total_units: number;
}

@Component({
  selector: 'app-teacher-add-assessment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-assessment.modal.html',
  styleUrl: './add-assessment.modal.css',
})
export class TeacherAddAssessmentModalComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiRoot = `${environment.apiUrl}/teacher`;

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingReferenceData = false;
  errorMessage = '';
  students: TeacherStudentOption[] = [];
  enrollmentBundles: EnrollmentBundle[] = [];
  selectedSubjectNames: string[] = [];
  form: TeacherAssessmentPayload = this.createEmptyForm();

  open(): void {
    this.isOpen = true;
    this.resetForm();
    this.loadEnrollments();
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
    this.selectedSubjectNames = [];
  }

  onAcademicTermChange(): void {
    const bundle = this.availableTerms.find((item) => item.academic_term_id === this.form.academic_term_id);
    if (!bundle) {
      return;
    }

    this.form.semester = bundle.semester;
    this.form.school_year = bundle.school_year;
    this.form.total_units = bundle.total_units;
    this.selectedSubjectNames = bundle.subject_names;
  }

  get availableTerms(): EnrollmentBundle[] {
    if (!this.form.student_id) {
      return [];
    }

    return this.enrollmentBundles.filter((bundle) => bundle.student_id === this.form.student_id);
  }

  get computedTotalAmount(): number {
    return Number(this.form.tuition_fee || 0) +
      Number(this.form.misc_fee || 0) +
      Number(this.form.lab_fee || 0) +
      Number(this.form.other_fees || 0);
  }

  get computedNetAmount(): number {
    return this.computedTotalAmount - Number(this.form.discount || 0);
  }

  submit(): void {
    if (!this.validate()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.post(`${this.teacherApiRoot}/assessments`, this.form)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.close();
          this.refresh.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Failed to create assessment.';
        }
      });
  }

  private loadEnrollments(): void {
    this.isLoadingReferenceData = true;

    this.http.get<any>(`${this.teacherApiRoot}/enrollments`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const data = Array.isArray(response) ? response : response?.data ?? [];
          const enrollments = Array.isArray(data) ? data.map((item) => this.mapEnrollment(item)) : [];
          this.enrollmentBundles = this.buildBundles(enrollments);
          this.students = Array.from(new Map(
            this.enrollmentBundles.map((bundle) => [bundle.student_id, { id: bundle.student_id, label: bundle.student_name }])
          ).values()).sort((left, right) => left.label.localeCompare(right.label));
          this.isLoadingReferenceData = false;
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Failed to load enrollment references.';
          this.isLoadingReferenceData = false;
        }
      });
  }

  private buildBundles(enrollments: TeacherEnrollment[]): EnrollmentBundle[] {
    const grouped = new Map<string, EnrollmentBundle>();

    for (const enrollment of enrollments) {
      const studentId = Number(enrollment.student_id);
      const termId = Number(enrollment.academic_term_id);
      if (!studentId || !termId) {
        continue;
      }

      const key = `${studentId}:${termId}`;
      const existing = grouped.get(key);
      const subjectNames = (enrollment.subjects ?? [])
        .map((subject) => subject.name?.trim())
        .filter((name): name is string => Boolean(name));
      const firstSubject = enrollment.subject?.name?.trim() || enrollment.subject_name?.trim();
      const units = Number((enrollment.subject?.units ?? enrollment.subjects?.[0]?.units) || 0);

      if (!existing) {
        grouped.set(key, {
          student_id: studentId,
          student_name: this.getStudentLabel(enrollment),
          academic_term_id: termId,
          school_year: enrollment.school_year,
          semester: enrollment.semester,
          subject_names: [...subjectNames, ...(firstSubject && !subjectNames.includes(firstSubject) ? [firstSubject] : [])],
          total_units: units
        });
        continue;
      }

      existing.total_units += units;
      for (const subjectName of [...subjectNames, ...(firstSubject && !subjectNames.includes(firstSubject) ? [firstSubject] : [])]) {
        if (!existing.subject_names.includes(subjectName)) {
          existing.subject_names.push(subjectName);
        }
      }
    }

    return Array.from(grouped.values()).sort((left, right) => left.student_name.localeCompare(right.student_name));
  }

  private getStudentLabel(enrollment: TeacherEnrollment): string {
    const student = enrollment.student;
    const name = [student?.first_name, student?.middle_name, student?.last_name]
      .filter(Boolean)
      .join(' ')
      .trim();

    return name || student?.name?.trim() || `Student #${enrollment.student_id}`;
  }

  private mapEnrollment(item: any): TeacherEnrollment {
    return {
      id: this.toNumber(item.id),
      student_id: this.toNumber(item.student_id),
      subject_id: this.toNumber(item.subject_id),
      academic_term_id: this.toNumber(item.academic_term_id),
      semester: item.semester ?? item.academic_term?.semester ?? '',
      school_year: item.school_year ?? item.academic_term?.school_year ?? '',
      status: item.status ?? 'enrolled',
      student: item.student ?? null,
      subject: item.subject ?? null,
      subjects: Array.isArray(item.subjects) ? item.subjects : [],
      academic_term: item.academic_term ?? null,
      subject_name: item.subject_name ?? item.subject?.name ?? null,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    };
  }

  private validate(): boolean {
    if (!this.form.student_id) {
      this.errorMessage = 'Student is required.';
      return false;
    }
    if (!this.form.academic_term_id) {
      this.errorMessage = 'Academic term is required.';
      return false;
    }
    if (!this.form.semester || !this.form.school_year) {
      this.errorMessage = 'Term details are incomplete.';
      return false;
    }
    if (this.computedNetAmount < 0) {
      this.errorMessage = 'Discount cannot be greater than the total amount.';
      return false;
    }
    return true;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.selectedSubjectNames = [];
    this.errorMessage = '';
  }

  private createEmptyForm(): TeacherAssessmentPayload {
    return {
      student_id: null,
      academic_term_id: null,
      semester: '',
      school_year: '',
      total_units: 0,
      tuition_fee: 0,
      misc_fee: 0,
      lab_fee: 0,
      other_fees: 0,
      discount: 0,
      status: 'draft'
    };
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
