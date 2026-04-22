import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { Assessment as AssessmentModel, AssessmentStatus } from '../../models/assessment.model';
import { AssessmentsService } from '../../services/assessments.service';
import { AssessmentCard } from '../../cards/assessment-card/assessment-card';
import { UpdateAssessmentModalComponent } from '../../modals/assessment/update-assessment/update-assessment.modal';
import { DeleteAssessmentModalComponent } from '../../modals/assessment/delete-assessment/delete-assessment.modal';
import { AddAssessmentModalComponent } from '../../modals/assessment/add-assessment/add-assessment.modal';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAssessmentModalComponent,
    UpdateAssessmentModalComponent,
    DeleteAssessmentModalComponent,
    AssessmentCard
  ],
  templateUrl: './assessment.html',
  styleUrl: './assessment.css',
})
export class Assessment implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddAssessmentModalComponent) addModal!: AddAssessmentModalComponent;
  @ViewChild(UpdateAssessmentModalComponent) updateModal!: UpdateAssessmentModalComponent;
  @ViewChild(DeleteAssessmentModalComponent) deleteModal!: DeleteAssessmentModalComponent;

  assessments: AssessmentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter: AssessmentStatus | '' = '';

  constructor(private assessmentService: AssessmentsService) {}

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.errorMessage = '';
    this.isLoading = true;
    this.assessmentService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        let mapped: AssessmentModel[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.assessment_id ?? null,
            student_id: item.student_id ?? null,
            student_name: this.resolveStudentName(item),
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
          }));
        }
        this.assessments = mapped;
        this.assessmentService.setCachedAssessments(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[Assessments] API error:', error);
        if (error?.status === 404) {
          this.assessments = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load assessments';
        this.isLoading = false;
      }
    });
  }

  getFilteredAssessments(): AssessmentModel[] {
    let filtered = this.assessments;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => JSON.stringify(a).toLowerCase().includes(query));
    }

    if (this.statusFilter) {
      filtered = filtered.filter(a => a.status === this.statusFilter);
    }

    return filtered;
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(assessment: AssessmentModel) {
    this.updateModal.open(assessment);
  }

  openDeleteModal(assessment: AssessmentModel) {
    this.deleteModal.open(assessment);
  }

  getStatusBadge(status: AssessmentStatus): string {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-bold';

    switch(status) {
      case 'finalized': return `${baseClass} bg-green-100 text-green-800`;
      case 'draft': return `${baseClass} bg-slate-100 text-slate-800`;
      default: return `${baseClass} bg-blue-100 text-blue-800`;
    }
  }

  formatNumericValue(value: AdminNumericValue): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  formatAmount(value: AdminNumericValue): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  getTermLabel(assessment: AssessmentModel): string {
    return `${assessment.semester} • ${assessment.school_year}`;
  }

  private resolveStudentName(item: any): string | null {
    const directName = this.cleanText(
      item.student_name ??
      item.studentName ??
      item.student?.name ??
      item.student?.full_name
    );
    if (directName) {
      return directName;
    }

    const fromNestedParts = this.composeName(
      item.student?.first_name ?? item.student?.firstname ?? item.student?.given_name,
      item.student?.last_name ?? item.student?.lastname ?? item.student?.surname
    );
    if (fromNestedParts) {
      return fromNestedParts;
    }

    return this.composeName(
      item.first_name ?? item.firstname ?? item.given_name,
      item.last_name ?? item.lastname ?? item.surname
    );
  }

  private composeName(first: unknown, last: unknown): string | null {
    const joined = [this.cleanText(first), this.cleanText(last)]
      .filter((part): part is string => Boolean(part))
      .join(' ')
      .trim();
    return joined || null;
  }

  private cleanText(value: unknown): string | null {
    if (typeof value !== 'string') {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
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
