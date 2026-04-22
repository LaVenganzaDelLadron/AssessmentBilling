import { Component, Output, EventEmitter, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AssessmentBreakdown,
  AssessmentBreakdownSourceType,
  UpdateAssessmentBreakdownPayload
} from '../../../models/assessment-breakdown.model';
import { AssessmentBreakdownService } from '../../../services/assessment-breakdown.service';
import { Assessment } from '../../../models/assessment.model';
import { Subject } from '../../../models/subject.model';
import { FeeStructure } from '../../../models/fee-structure.model';
import { Student } from '../../../models/student.model';
import { AssessmentsService } from '../../../services/assessments.service';
import { SubjectsService } from '../../../services/subjects.service';
import { FeeStructuresService } from '../../../services/fee-structures.service';
import { StudentsService } from '../../../services/students.service';

interface AssessmentBreakdownForm {
  assessment_id: number | null;
  source_type: AssessmentBreakdownSourceType;
  source_id: string;
  description: string;
  units: number | null;
  rate: number | null;
  amount: number | null;
}

interface SourceOption {
  id: number;
  label: string;
  description: string;
  units: number | null;
  rate: number | null;
  amount: number | null;
}

@Component({
  selector: 'app-update-assessment-breakdown-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-assessment-breakdown.modal.html',
  styleUrl: './update-assessment-breakdown.modal.css'
})
export class UpdateAssessmentBreakdownModalComponent {
  private readonly destroyRef = inject(DestroyRef);

  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  isLoadingReferenceData = false;
  errorMessage = '';
  currentEntity: AssessmentBreakdown | null = null;
  readonly sourceTypes: AssessmentBreakdownSourceType[] = ['subject', 'fee', 'discount'];

  form: AssessmentBreakdownForm = this.createEmptyForm();
  assessments: Assessment[] = [];
  subjects: Subject[] = [];
  fees: FeeStructure[] = [];
  studentsById = new Map<number, Student>();
  private pendingReferenceLoads = 0;

  constructor(
    private service: AssessmentBreakdownService,
    private assessmentsService: AssessmentsService,
    private subjectsService: SubjectsService,
    private feeStructuresService: FeeStructuresService,
    private studentsService: StudentsService
  ) {}

  open(entity: AssessmentBreakdown) {
    this.isOpen = true;
    this.currentEntity = entity;
    this.form = {
      assessment_id: entity.assessment_id,
      source_type: entity.source_type,
      source_id: entity.source_id == null ? '' : String(entity.source_id),
      description: entity.description,
      units: this.toNumberOrNull(entity.units),
      rate: this.toNumberOrNull(entity.rate),
      amount: this.toNumberOrNull(entity.amount)
    };
    this.errorMessage = '';
    this.loadReferenceData();
  }

  close() {
    this.isOpen = false;
    this.resetForm();
  }

  submit() {
    if (!this.currentEntity?.id || !this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    this.service.update(this.currentEntity.id, this.toPayload()).subscribe({
      next: () => {
        this.isLoading = false;
        this.refresh.emit();
        this.close();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to update assessment breakdown';
      }
    });
  }

  validate(): boolean {
    if (!this.form.assessment_id) {
      this.errorMessage = 'Assessment is required';
      return false;
    }
    if (!this.form.source_type) {
      this.errorMessage = 'Source type is required';
      return false;
    }
    if (this.requiresSourceId() && !this.form.source_id.trim()) {
      this.errorMessage = 'Please choose a source record';
      return false;
    }
    if (!this.form.description.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }
    if (this.form.units != null && this.form.units < 0) {
      this.errorMessage = 'Units must be at least 0';
      return false;
    }
    if (this.form.rate != null && this.form.rate < 0) {
      this.errorMessage = 'Rate must be at least 0';
      return false;
    }
    if (this.form.amount == null) {
      this.errorMessage = 'Amount is required';
      return false;
    }

    return true;
  }

  onAssessmentChange(): void {
    this.form.source_id = '';
    this.syncAutomaticFields();
  }

  onSourceTypeChange(): void {
    this.form.source_id = '';

    if (this.form.source_type === 'discount') {
      this.form.description = '';
      this.form.units = null;
      this.form.rate = null;
      this.form.amount = null;
      return;
    }

    this.syncAutomaticFields();
  }

  onSourceChange(): void {
    this.syncAutomaticFields();
  }

  requiresSourceId(): boolean {
    return this.form.source_type === 'subject' || this.form.source_type === 'fee';
  }

  get isAutomaticMode(): boolean {
    return this.form.source_type === 'subject' || this.form.source_type === 'fee';
  }

  getAssessmentLabel(assessment: Assessment): string {
    const studentLabel = assessment.student_name?.trim() || `Student #${assessment.student_id}`;
    return `#${assessment.id} • ${studentLabel} • ${assessment.semester} • ${assessment.school_year}`;
  }

  get availableSourceOptions(): SourceOption[] {
    if (this.form.source_type === 'discount') {
      return [];
    }

    const programId = this.selectedProgramId;
    if (!programId) {
      return [];
    }

    if (this.form.source_type === 'subject') {
      return this.subjects
        .filter((subject) => subject.program_id === programId)
        .map((subject) => this.toSubjectOption(subject));
    }

    return this.fees
      .filter((fee) => fee.program_id === programId)
      .map((fee) => this.toFeeOption(fee));
  }

  private get selectedAssessment(): Assessment | null {
    return this.assessments.find((assessment) => assessment.id === this.form.assessment_id) ?? null;
  }

  private get selectedProgramId(): number | null {
    const assessment = this.selectedAssessment;
    if (!assessment) {
      return null;
    }

    return this.studentsById.get(assessment.student_id)?.program_id ?? null;
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.currentEntity = null;
    this.errorMessage = '';
  }

  private createEmptyForm(): AssessmentBreakdownForm {
    return {
      assessment_id: null,
      source_type: 'subject',
      source_id: '',
      description: '',
      units: null,
      rate: null,
      amount: null
    };
  }

  private loadReferenceData(): void {
    this.pendingReferenceLoads = 4;
    this.isLoadingReferenceData = true;

    this.loadStudents();
    this.loadAssessments();
    this.loadSubjects();
    this.loadFees();
  }

  private loadAssessments(): void {
    const cached = this.assessmentsService.getCachedAssessments();
    if (cached?.length) {
      this.assessments = [...cached];
      this.markReferenceLoaded();
      this.syncAutomaticFields();
      return;
    }

    this.assessmentsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data ?? [];
        this.assessments = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id ?? item.assessment_id ?? null,
              student_id: item.student_id ?? null,
              student_name: item.student_name ?? item.student?.name ?? null,
              academic_term_id: item.academic_term_id ?? null,
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
              updated_at: item.updated_at ?? null
            }))
          : [];
        this.assessmentsService.setCachedAssessments(this.assessments);
        this.markReferenceLoaded();
        this.syncAutomaticFields();
      },
      error: () => this.markReferenceLoaded()
    });
  }

  private loadSubjects(): void {
    const cached = this.subjectsService.getCachedSubjects();
    if (cached?.length) {
      this.subjects = [...cached];
      this.markReferenceLoaded();
      this.syncAutomaticFields();
      return;
    }

    this.subjectsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data ?? [];
        this.subjects = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id ?? item.subject_id ?? null,
              code: item.code ?? item.subject_code ?? '',
              name: item.name ?? '',
              units: item.units ?? 0,
              program_id: item.program_id ?? null,
              subject_code: item.subject_code ?? null,
              type: item.type ?? null,
              status: item.status ?? null,
              external_id: item.external_id ?? null,
              custom_id: item.custom_id ?? null,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
          : [];
        this.subjectsService.setCachedSubjects(this.subjects);
        this.markReferenceLoaded();
        this.syncAutomaticFields();
      },
      error: () => this.markReferenceLoaded()
    });
  }

  private loadFees(): void {
    const cached = this.feeStructuresService.getCachedFees();
    if (cached?.length) {
      this.fees = [...cached];
      this.markReferenceLoaded();
      this.syncAutomaticFields();
      return;
    }

    this.feeStructuresService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data ?? [];
        this.fees = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id ?? item.fee_structure_id ?? null,
              program_id: item.program_id ?? null,
              program_name: item.program_name ?? item.program?.name ?? null,
              program: item.program
                ? {
                    id: item.program.id ?? item.program_id ?? 0,
                    name: item.program.name ?? null
                  }
                : null,
              fee_type: item.fee_type ?? '',
              amount: item.amount ?? 0,
              per_unit: !!item.per_unit,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
          : [];
        this.feeStructuresService.setCachedFees(this.fees);
        this.markReferenceLoaded();
        this.syncAutomaticFields();
      },
      error: () => this.markReferenceLoaded()
    });
  }

  private loadStudents(): void {
    const cached = this.studentsService.getCachedStudents();
    if (cached?.length) {
      this.studentsById = new Map(cached.map((student) => [student.id, student]));
      this.markReferenceLoaded();
      this.syncAutomaticFields();
      return;
    }

    this.studentsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : response.data ?? [];
        const students = Array.isArray(data)
          ? data.map((item: any) => ({
              id: item.id ?? item.student_id ?? null,
              student_no: item.student_no ?? '',
              first_name: item.first_name ?? '',
              middle_name: item.middle_name ?? null,
              last_name: item.last_name ?? '',
              email: item.email ?? null,
              program_id: item.program_id ?? 0,
              year_level: item.year_level ?? 0,
              status: item.status ?? 'active',
              user_id: item.user_id ?? null,
              program: item.program ?? null,
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null
            }))
          : [];
        this.studentsById = new Map(students.map((student: Student) => [student.id, student]));
        this.studentsService.setCachedStudents(students);
        this.markReferenceLoaded();
        this.syncAutomaticFields();
      },
      error: () => this.markReferenceLoaded()
    });
  }

  private markReferenceLoaded(): void {
    this.pendingReferenceLoads -= 1;
    if (this.pendingReferenceLoads <= 0) {
      this.isLoadingReferenceData = false;
      this.pendingReferenceLoads = 0;
    }
  }

  private syncAutomaticFields(): void {
    const selected = this.availableSourceOptions.find(
      (option) => String(option.id) === this.form.source_id
    );

    if (!selected) {
      if (this.isAutomaticMode) {
        this.form.description = '';
        this.form.units = null;
        this.form.rate = null;
        this.form.amount = null;
      }
      return;
    }

    this.form.source_id = String(selected.id);
    this.form.description = selected.description;
    this.form.units = selected.units;
    this.form.rate = selected.rate;
    this.form.amount = selected.amount;
  }

  private toSubjectOption(subject: Subject): SourceOption {
    const assessment = this.selectedAssessment;
    const units = this.toNumber(subject.units);
    const totalUnits = this.toNumber(assessment?.total_units);
    const tuitionFee = this.toNumber(assessment?.tuition_fee);
    const rate = totalUnits > 0 ? Number((tuitionFee / totalUnits).toFixed(2)) : 0;

    return {
      id: subject.id,
      label: `${subject.code} • ${subject.name}`,
      description: `Tuition: ${subject.code} (${units.toFixed(2)} units)`,
      units,
      rate,
      amount: Number((units * rate).toFixed(2))
    };
  }

  private toFeeOption(fee: FeeStructure): SourceOption {
    const feeLabel = fee.fee_type
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
    const amount = this.toNumber(fee.amount);

    return {
      id: fee.id,
      label: feeLabel,
      description: feeLabel,
      units: fee.per_unit ? 1 : null,
      rate: amount,
      amount
    };
  }

  private toPayload(): UpdateAssessmentBreakdownPayload {
    return {
      assessment_id: this.form.assessment_id ?? 0,
      source_type: this.form.source_type,
      source_id: this.requiresSourceId() ? this.form.source_id.trim() : null,
      description: this.form.description.trim(),
      units: this.form.units,
      rate: this.form.rate,
      amount: this.form.amount ?? 0
    };
  }

  private toNumber(value: unknown): number {
    const numericValue = Number(value ?? 0);
    return Number.isNaN(numericValue) ? 0 : numericValue;
  }

  private toNumberOrNull(value: unknown): number | null {
    if (value == null || value === '') {
      return null;
    }

    const numericValue = Number(value);
    return Number.isNaN(numericValue) ? null : numericValue;
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
