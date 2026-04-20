import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { AssessmentBreakdown } from '../../models/assessment-breakdown.model';
import { AssessmentBreakdownService } from '../../services/assessment-breakdown.service';
import { AddAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/add-assessment-breakdown/add-assessment-breakdown.modal';
import { UpdateAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/update-assessment-breakdown/update-assessment-breakdown.modal';
import { DeleteAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/delete-assessment-breakdown/delete-assessment-breakdown.modal';

@Component({
  selector: 'app-assessment-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAssessmentBreakdownModalComponent,
    UpdateAssessmentBreakdownModalComponent,
    DeleteAssessmentBreakdownModalComponent
  ],
  templateUrl: './assessment-breakdown.html',
  styleUrl: './assessment-breakdown.css',
})
export class AssessmentBreakdownPage implements OnInit {
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
    this.isLoading = true;
    this.errorMessage = '';

    this.breakdownService.list().subscribe({
      next: (response) => {
        this.breakdowns = Array.isArray(response) ? response : response.data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 404) {
          this.breakdowns = [];
          return;
        }

        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to load assessment breakdowns';
        console.error('Error:', error);
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
    return breakdown.source_id?.trim() || 'No source ID';
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
