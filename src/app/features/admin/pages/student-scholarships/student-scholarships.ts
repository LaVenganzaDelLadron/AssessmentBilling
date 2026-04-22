import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { StudentScholarship } from '../../models/scholarship.model';
import { StudentScholarshipsService } from '../../services/student-scholarships.service';
import { StudentScholarshipsCard } from '../../cards/student-scholarships-card/student-scholarships-card';
import { AddStudentScholarshipModalComponent } from '../../modals/student-scholarships/add-student-scholarship/add-student-scholarship.modal';
import { UpdateStudentScholarshipModalComponent } from '../../modals/student-scholarships/update-student-scholarship/update-student-scholarship.modal';
import { DeleteStudentScholarshipModalComponent } from '../../modals/student-scholarships/delete-student-scholarship/delete-student-schoalrship.modal';

@Component({
  selector: 'app-student-scholarships',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    StudentScholarshipsCard,
    AddStudentScholarshipModalComponent,
    UpdateStudentScholarshipModalComponent,
    DeleteStudentScholarshipModalComponent
  ],
  templateUrl: './student-scholarships.html',
  styleUrl: './student-scholarships.css',
})
export class StudentScholarships implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddStudentScholarshipModalComponent) addModal!: AddStudentScholarshipModalComponent;
  @ViewChild(UpdateStudentScholarshipModalComponent) updateModal!: UpdateStudentScholarshipModalComponent;
  @ViewChild(DeleteStudentScholarshipModalComponent) deleteModal!: DeleteStudentScholarshipModalComponent;

  records: StudentScholarship[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private studentScholarshipsService: StudentScholarshipsService) {}

  ngOnInit(): void {
    this.loadStudentScholarships();
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(record: StudentScholarship): void {
    this.updateModal.open(record);
  }

  openDeleteModal(record: StudentScholarship): void {
    this.deleteModal.open(record);
  }

  loadStudentScholarships(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.studentScholarshipsService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: any) => {
          const data = Array.isArray(response) ? response : response.data ?? [];
          let mapped: StudentScholarship[] = [];

          if (Array.isArray(data)) {
            mapped = data.map((item: any) => this.mapRecord(item));
          }

          this.records = mapped;
          this.studentScholarshipsService.setCachedStudentScholarships(mapped);
          this.isLoading = false;
        },
        error: (error) => {
          if (error?.status === 404) {
            this.records = [];
            this.isLoading = false;
            return;
          }

          this.errorMessage = this.getErrorMessage(error) || 'Failed to load student scholarships';
          this.isLoading = false;
        }
      });
  }

  refreshRecords(): void {
    this.loadStudentScholarships();
  }

  getFilteredRecords(): StudentScholarship[] {
    if (!this.searchQuery) {
      return this.records;
    }

    const query = this.searchQuery.toLowerCase();
    return this.records.filter((record) =>
      [
        record.id,
        record.student_id,
        record.scholarship_id,
        record.discount_type,
        record.discount_value,
        record.original_amount,
        record.discount_amount,
        record.final_amount,
        record.student?.student_no ?? '',
        record.student?.first_name ?? '',
        record.student?.middle_name ?? '',
        record.student?.last_name ?? '',
        record.scholarship?.name ?? ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  getTotalAssignments(): number {
    return this.records.length;
  }

  getUniqueStudentsCount(): number {
    return new Set(
      this.records
        .map((record) => record.student_id)
        .filter((value): value is number => value !== null)
    ).size;
  }

  getTotalDiscountAmount(): string {
    const total = this.records.reduce(
      (sum, record) => sum + this.toNumber(record.discount_amount),
      0
    );

    return this.formatCurrency(total);
  }

  trackByRecordId(_: number, record: StudentScholarship): number {
    return record.id;
  }

  private mapRecord(item: any): StudentScholarship {
    return {
      id: this.normalizeNumber(item.id ?? item.student_scholarship_id) ?? 0,
      student_id: this.normalizeNumber(item.student_id),
      scholarship_id: this.normalizeNumber(item.scholarship_id),
      discount_type: item.discount_type === 'amount' ? 'amount' : 'percent',
      discount_value: item.discount_value ?? 0,
      original_amount: item.original_amount ?? null,
      discount_amount: item.discount_amount ?? null,
      final_amount: item.final_amount ?? null,
      applied_at: item.applied_at ?? null,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
      student: item.student
        ? {
            id: this.normalizeNumber(item.student.id ?? item.student_id),
            student_no: item.student.student_no ?? null,
            first_name: item.student.first_name ?? null,
            middle_name: item.student.middle_name ?? null,
            last_name: item.student.last_name ?? null,
            email: item.student.email ?? null
          }
        : null,
      scholarship: item.scholarship
        ? {
            id: this.normalizeNumber(item.scholarship.id ?? item.scholarship_id),
            name: item.scholarship.name ?? null,
            description: item.scholarship.description ?? null
          }
        : null
    };
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

  private toNumber(value: unknown): number {
    const parsed = Number(value ?? 0);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
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
