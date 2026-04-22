import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../../environments/assessment/environment';
import { TeacherAssessment } from '../../../models/assessment.model';
import {
  TeacherAssessmentBreakdown,
  TeacherAssessmentBreakdownPayload,
  TeacherAssessmentBreakdownSourceType
} from '../../../models/assessment-breakdown.model';
import { TeacherSubject } from '../../../models/subject.model';

@Component({
  selector: 'app-teacher-update-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-assessment-breakdown.modal.html',
  styleUrl: './update-assessment-breakdown.modal.css',
})
export class TeacherUpdateAssessmentBreakdownModalComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiRoot = `${environment.apiUrl}/teacher`;

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingReferenceData = false;
  errorMessage = '';
  selectedBreakdownId: number | null = null;
  assessments: TeacherAssessment[] = [];
  subjects: TeacherSubject[] = [];
  readonly sourceTypes: TeacherAssessmentBreakdownSourceType[] = ['subject', 'fee', 'discount'];
  form: TeacherAssessmentBreakdownPayload = this.createEmptyForm();

  open(breakdown: TeacherAssessmentBreakdown): void {
    this.isOpen = true;
    this.selectedBreakdownId = breakdown.id;
    this.form = {
      assessment_id: breakdown.assessment_id,
      source_type: breakdown.source_type,
      source_id: breakdown.source_id,
      description: breakdown.description,
      units: breakdown.units == null ? null : Number(breakdown.units),
      rate: breakdown.rate == null ? null : Number(breakdown.rate),
      amount: Number(breakdown.amount),
    };
    this.errorMessage = '';
    this.loadReferenceData();
  }

  close(): void {
    this.isOpen = false;
    this.selectedBreakdownId = null;
    this.form = this.createEmptyForm();
    this.errorMessage = '';
  }

  onAssessmentChange(): void {
    if (this.form.source_type === 'subject') {
      this.applySubjectDefaults();
    }
  }

  onSourceTypeChange(): void {
    if (this.form.source_type === 'subject') {
      this.applySubjectDefaults();
    }
  }

  onSubjectChange(): void {
    this.applySubjectDefaults();
  }

  onAmountInputsChange(): void {
    if (this.form.units != null && this.form.rate != null) {
      this.form.amount = Number(this.form.units) * Number(this.form.rate);
    }
  }

  get isSubjectMode(): boolean {
    return this.form.source_type === 'subject';
  }

  submit(): void {
    if (!this.selectedBreakdownId) {
      this.errorMessage = 'Breakdown ID is missing.';
      return;
    }
    if (!this.validate()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.http.put(`${this.teacherApiRoot}/assessment-breakdown/${this.selectedBreakdownId}`, this.form)
      .subscribe({
        next: () => {
          this.isLoading = false;
          this.close();
          this.refresh.emit();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error?.error?.message || 'Failed to update assessment breakdown.';
        }
      });
  }

  private loadReferenceData(): void {
    this.isLoadingReferenceData = true;

    Promise.all([
      this.http.get<any>(`${this.teacherApiRoot}/assessments`).toPromise(),
      this.http.get<any>(`${this.teacherApiRoot}/subjects`).toPromise()
    ]).then(([assessmentsResponse, subjectsResponse]) => {
      const assessmentsData = Array.isArray(assessmentsResponse) ? assessmentsResponse : assessmentsResponse?.data ?? [];
      const subjectsData = Array.isArray(subjectsResponse) ? subjectsResponse : subjectsResponse?.data ?? [];

      this.assessments = Array.isArray(assessmentsData) ? assessmentsData.map((item) => this.mapAssessment(item)) : [];
      this.subjects = Array.isArray(subjectsData) ? subjectsData.map((item) => this.mapSubject(item)) : [];
      this.isLoadingReferenceData = false;
    }).catch((error) => {
      this.errorMessage = error?.error?.message || 'Failed to load assessment breakdown references.';
      this.isLoadingReferenceData = false;
    });
  }

  private applySubjectDefaults(): void {
    const subject = this.subjects.find((item) => item.id === Number(this.form.source_id));
    const assessment = this.assessments.find((item) => item.id === this.form.assessment_id);
    if (!subject || !assessment) {
      return;
    }

    const units = Number(subject.units || 0);
    const rate = Number(assessment.total_units || 0) > 0
      ? Number(assessment.tuition_fee || 0) / Number(assessment.total_units || 1)
      : 0;

    this.form.description = `${subject.code} - ${subject.name}`;
    this.form.units = units;
    this.form.rate = Number(rate.toFixed(2));
    this.form.amount = Number((units * rate).toFixed(2));
  }

  private validate(): boolean {
    if (!this.form.assessment_id) {
      this.errorMessage = 'Assessment is required.';
      return false;
    }
    if (!this.form.description?.trim()) {
      this.errorMessage = 'Description is required.';
      return false;
    }
    if (this.form.amount == null) {
      this.errorMessage = 'Amount is required.';
      return false;
    }
    return true;
  }

  private createEmptyForm(): TeacherAssessmentBreakdownPayload {
    return {
      assessment_id: null,
      source_type: 'subject',
      source_id: null,
      description: '',
      units: null,
      rate: null,
      amount: null,
    };
  }

  private mapAssessment(item: any): TeacherAssessment {
    return {
      id: this.toNumber(item.id),
      student_id: this.toNumber(item.student_id),
      student_name: item.student_name ?? item.student?.name ?? null,
      academic_term_id: this.toNumber(item.academic_term_id),
      semester: item.semester ?? '',
      school_year: item.school_year ?? '',
      total_units: item.total_units ?? 0,
      tuition_fee: item.tuition_fee ?? 0,
      misc_fee: item.misc_fee ?? 0,
      lab_fee: item.lab_fee ?? 0,
      other_fees: item.other_fees ?? 0,
      total_amount: item.total_amount ?? 0,
      discount: item.discount ?? 0,
      net_amount: item.net_amount ?? 0,
      status: item.status ?? 'draft',
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    };
  }

  private mapSubject(item: any): TeacherSubject {
    return {
      id: this.toNumber(item.id),
      code: item.code ?? item.subject_code ?? '',
      name: item.name ?? '',
      units: item.units ?? 0,
      program_id: this.toNumber(item.program_id),
      program_name: item.program_name ?? item.program?.name ?? null,
      type: item.type ?? null,
      status: item.status ?? 'active',
      custom_id: item.custom_id ?? null,
      program: item.program ?? null,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    };
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
