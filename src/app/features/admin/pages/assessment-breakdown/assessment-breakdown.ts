import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { AssessmentBreakdown } from '../../models/assessment-breakdown.model';
import { AssessmentBreakdownService } from '../../services/assessment-breakdown.service';
import { AddAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/add-assessment-breakdown/add-assessment-breakdown.modal';
import { UpdateAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/update-assessment-breakdown/update-assessment-breakdown.modal';
import { DeleteAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/delete-assessment-breakdown/delete-assessment-breakdown.modal';
import { AssessmentBreakdownCard } from '../../cards/assessment-breakdown-card/assessment-breakdown-card';

@Component({
  selector: 'app-assessment-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAssessmentBreakdownModalComponent,
    UpdateAssessmentBreakdownModalComponent,
    DeleteAssessmentBreakdownModalComponent,
    AssessmentBreakdownCard
  ],
  templateUrl: './assessment-breakdown.html',
  styleUrl: './assessment-breakdown.css',
})
export class AssessmentBreakdownPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddAssessmentBreakdownModalComponent) addModal!: AddAssessmentBreakdownModalComponent;
  @ViewChild(UpdateAssessmentBreakdownModalComponent) updateModal!: UpdateAssessmentBreakdownModalComponent;
  @ViewChild(DeleteAssessmentBreakdownModalComponent) deleteModal!: DeleteAssessmentBreakdownModalComponent;

  breakdowns: AssessmentBreakdown[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private breakdownService: AssessmentBreakdownService) {}

  ngOnInit() {
    this.loadBreakdowns();
  }

  loadBreakdowns() {
    this.errorMessage = '';
    this.isLoading = true;
    this.breakdownService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        let mapped: AssessmentBreakdown[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.breakdown_id ?? null,
            assessment_id: item.assessment_id ?? null,
            source_type: item.source_type ?? '',
            source_id: item.source_id ?? null,
            description: item.description ?? '',
            units: item.units ?? null,
            rate: item.rate ?? null,
            amount: item.amount ?? 0,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.breakdowns = mapped;
        this.breakdownService.setCachedBreakdowns(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[AssessmentBreakdown] API error:', error);
        if (error?.status === 404) {
          this.breakdowns = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load assessment breakdowns';
        this.isLoading = false;
      }
    });
  }

  getFilteredBreakdowns(): AssessmentBreakdown[] {
    if (!this.searchQuery) return this.breakdowns;

    const query = this.searchQuery.toLowerCase();

    return this.breakdowns.filter(b => JSON.stringify(b).toLowerCase().includes(query));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(breakdown: AssessmentBreakdown) {
    this.updateModal.open(breakdown);
  }

  openDeleteModal(breakdown: AssessmentBreakdown) {
    this.deleteModal.open(breakdown);
  }

  formatNumericValue(value: AdminNumericValue | null): string {
    if (value == null || value === '') {
      return '-';
    }

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

  getSourceDetails(breakdown: AssessmentBreakdown): string {
    if (breakdown.source_id === null || breakdown.source_id === undefined || breakdown.source_id === '') {
      return 'No source ID';
    }

    return String(breakdown.source_id);
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
