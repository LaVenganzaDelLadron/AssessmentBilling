import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Scholarship } from '../../models/scholarship.model';
import { ScholarshipsService } from '../../services/scholarships.service';
import { ScholarshipCard } from '../../cards/scholarship-card/scholarship-card';
import { AddScholarshipModalComponent } from '../../modals/scholarships/add-scholarship/add-scholarship.modal';
import { UpdateScholarshipModalComponent } from '../../modals/scholarships/update-scholarship/update-scholarship.modal';
import { DeleteScholarshipModalComponent } from '../../modals/scholarships/delete-scholarship/delete-scholarship.modal';

@Component({
  selector: 'app-scholarships',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ScholarshipCard,
    AddScholarshipModalComponent,
    UpdateScholarshipModalComponent,
    DeleteScholarshipModalComponent
  ],
  templateUrl: './scholarships.html',
  styleUrl: './scholarships.css',
})
export class Scholarships implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddScholarshipModalComponent) addModal!: AddScholarshipModalComponent;
  @ViewChild(UpdateScholarshipModalComponent) updateModal!: UpdateScholarshipModalComponent;
  @ViewChild(DeleteScholarshipModalComponent) deleteModal!: DeleteScholarshipModalComponent;

  scholarships: Scholarship[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private scholarshipsService: ScholarshipsService) {}

  ngOnInit(): void {
    this.loadScholarships();
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(scholarship: Scholarship): void {
    this.updateModal.open(scholarship);
  }

  openDeleteModal(scholarship: Scholarship): void {
    this.deleteModal.open(scholarship);
  }

  loadScholarships(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.scholarshipsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          let mapped: Scholarship[] = [];

          if (Array.isArray(data)) {
            mapped = data.map((item: any) => ({
              id: this.normalizeNumber(item.id ?? item.scholarship_id) ?? 0,
              name: item.name ?? 'Unnamed Scholarship',
              description: item.description ?? null,
              discount_type: item.discount_type === 'amount' ? 'amount' : 'percent',
              discount_value: item.discount_value ?? 0,
              is_active: this.normalizeBoolean(item.is_active ?? true),
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null,
              student_scholarships: Array.isArray(item.student_scholarships)
                ? item.student_scholarships.map((application: any) => ({
                    id: this.normalizeNumber(application.id),
                    student_id: this.normalizeNumber(application.student_id),
                    scholarship_id: this.normalizeNumber(application.scholarship_id),
                    discount_type: application.discount_type === 'amount' ? 'amount' : 'percent',
                    discount_value: application.discount_value ?? 0,
                    original_amount: application.original_amount ?? null,
                    discount_amount: application.discount_amount ?? null,
                    final_amount: application.final_amount ?? null,
                    applied_at: application.applied_at ?? null
                  }))
                : []
            }));
          }

          this.scholarships = mapped;
          this.scholarshipsService.setCachedScholarships(mapped);
          this.isLoading = false;
        },
        error: (error) => {
          if (error?.status === 404) {
            this.scholarships = [];
            this.isLoading = false;
            return;
          }

          this.errorMessage = this.getErrorMessage(error) || 'Failed to load scholarships';
          this.isLoading = false;
        }
      });
  }

  getFilteredScholarships(): Scholarship[] {
    if (!this.searchQuery) {
      return this.scholarships;
    }

    const query = this.searchQuery.toLowerCase();
    return this.scholarships.filter((scholarship) =>
      [
        scholarship.id,
        scholarship.name,
        scholarship.description ?? '',
        scholarship.discount_type,
        scholarship.discount_value,
        scholarship.is_active ? 'active' : 'inactive'
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  getActiveCount(): number {
    return this.scholarships.filter((scholarship) => scholarship.is_active).length;
  }

  getPercentCount(): number {
    return this.scholarships.filter((scholarship) => scholarship.discount_type === 'percent').length;
  }

  getTotalApplications(): number {
    return this.scholarships.reduce(
      (sum, scholarship) => sum + (scholarship.student_scholarships?.length ?? 0),
      0
    );
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

  private normalizeBoolean(value: unknown): boolean {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      return value !== 0;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === '1' || normalized === 'true' || normalized === 'active';
    }

    return false;
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
