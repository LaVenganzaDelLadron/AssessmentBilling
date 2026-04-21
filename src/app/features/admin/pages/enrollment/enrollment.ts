import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Enrollment as EnrollmentModel,
  EnrollmentStatus
} from '../../models/enrollment.model';
import { EnrollmentsService } from '../../services/enrollments.service';
import { AddEnrollmentModalComponent } from '../../modals/enrollments/add-enrollment/add-enrollment.modal';
import { UpdateEnrollmentModalComponent } from '../../modals/enrollments/update-enrollment/update-enrollment.modal';
import { DeleteEnrollmentModalComponent } from '../../modals/enrollments/delete-enrollment/delete-enrollment.modal';
import { EnrollmentCard } from '../../cards/enrollment-card/enrollment-card';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddEnrollmentModalComponent,
    UpdateEnrollmentModalComponent,
    DeleteEnrollmentModalComponent,
    EnrollmentCard
  ],
  templateUrl: './enrollment.html',
  styleUrl: './enrollment.css',
})
export class Enrollment implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(AddEnrollmentModalComponent) addModal!: AddEnrollmentModalComponent;
  @ViewChild(UpdateEnrollmentModalComponent) updateModal!: UpdateEnrollmentModalComponent;
  @ViewChild(DeleteEnrollmentModalComponent) deleteModal!: DeleteEnrollmentModalComponent;

  enrollments: EnrollmentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter: EnrollmentStatus | '' = '';

  constructor(private enrollmentsService: EnrollmentsService) {}

  ngOnInit() {
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.errorMessage = '';
    this.isLoading = true;
    this.enrollmentsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        let mapped: EnrollmentModel[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.enrollment_id ?? null,
            student_id: item.student_id ?? null,
            subject_id: item.subject_id ?? null,
            academic_term_id: item.academic_term_id ?? null,
            semester: item.semester ?? '',
            school_year: item.school_year ?? '',
            status: item.status ?? 'enrolled',
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.enrollments = mapped;
        this.enrollmentsService.setCachedEnrollments(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.enrollments = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load enrollments';
        console.error('Error:', error);
        this.isLoading = false;
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(enrollment: EnrollmentModel) {
    this.updateModal.open(enrollment);
  }

  openDeleteModal(enrollment: EnrollmentModel) {
    this.deleteModal.open(enrollment);
  }

  getFilteredEnrollments(): EnrollmentModel[] {
    let filtered = this.enrollments;

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.student_id.toString().includes(query) ||
        e.subject_id.toString().includes(query) ||
        e.academic_term_id.toString().includes(query) ||
        e.semester.toLowerCase().includes(query) ||
        e.school_year.toLowerCase().includes(query) ||
        e.status.toLowerCase().includes(query)
      );
    }

    if (this.statusFilter) {
      filtered = filtered.filter(e => e.status === this.statusFilter);
    }

    return filtered;
  }

  getStatusColor(status: EnrollmentStatus): string {
    switch(status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  getTermLabel(enrollment: EnrollmentModel): string {
    return `${enrollment.semester} • ${enrollment.school_year}`;
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
