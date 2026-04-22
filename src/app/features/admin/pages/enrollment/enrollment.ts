import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Enrollment as EnrollmentModel,
  EnrollmentStatus,
  EnrollmentSubject
} from '../../models/enrollment.model';
import { EnrollmentsService } from '../../services/enrollments.service';
import { AddEnrollmentModalComponent } from '../../modals/enrollments/add-enrollment/add-enrollment.modal';
import { UpdateEnrollmentModalComponent } from '../../modals/enrollments/update-enrollment/update-enrollment.modal';
import { DeleteEnrollmentModalComponent } from '../../modals/enrollments/delete-enrollment/delete-enrollment.modal';
import { EnrollmentCard } from '../../cards/enrollment-card/enrollment-card';

interface EnrollmentApiResponse {
  id?: number | string | null;
  enrollment_id?: number | string | null;
  enrollmentId?: number | string | null;
  record_id?: number | string | null;
  recordId?: number | string | null;
  student_id?: number | string | null;
  subject_id?: number | string | null;
  academic_term_id?: number | string | null;
  semester?: string | null;
  school_year?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  student?: {
    id?: number | string | null;
    student_no?: string | null;
    name?: string | null;
  } | null;
  subject?: {
    id?: number | string | null;
    subject_code?: string | null;
    code?: string | null;
    name?: string | null;
  } | null;
  subjects?: Array<{
    id?: number | string | null;
    code?: string | null;
    subject_code?: string | null;
    name?: string | null;
    status?: string | null;
  }> | null;
  academic_term?: {
    id?: number | string | null;
    school_year?: string | null;
    semester?: string | null;
  } | null;
  enrollment?: {
    id?: number | string | null;
  } | null;
  pivot?: {
    id?: number | string | null;
    enrollment_id?: number | string | null;
  } | null;
}

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
        const data = Array.isArray(response) ? response : response.data ?? [];
        console.log('[Enrollment] Raw API response:', response);

        if (Array.isArray(data)) {
          mapped = data.map((item: EnrollmentApiResponse, index: number) => {
            const subjects = this.normalizeSubjects(item);
            const subjectNames = subjects
              .map((subject) => subject.name?.trim())
              .filter((name): name is string => Boolean(name))
              .join(', ');
            const enrollmentId = this.resolveEnrollmentId(item);

            if (enrollmentId == null) {
              console.warn('[Enrollment] Missing enrollment id in API item', {
                index,
                item
              });
            }

            return {
              id: enrollmentId,
              student_id: this.normalizeNumber(item.student_id ?? item.student?.id),
              subject_id: this.normalizeNumber(item.subject_id ?? subjects[0]?.id),
              academic_term_id: this.normalizeNumber(item.academic_term_id ?? item.academic_term?.id),
              semester: (item.academic_term?.semester ?? item.semester ?? '').toString(),
              school_year: (item.academic_term?.school_year ?? item.school_year ?? '').toString(),
              status: (item.status ?? subjects[0]?.status ?? 'enrolled').toString(),
              created_at: item.created_at ?? null,
              updated_at: item.updated_at ?? null,
              student: item.student
                ? {
                    id: this.normalizeNumber(item.student.id),
                    student_no: item.student.student_no ?? null,
                    name: item.student.name ?? null
                  }
                : null,
              subjects,
              academic_term: item.academic_term
                ? {
                    id: this.normalizeNumber(item.academic_term.id),
                    school_year: item.academic_term.school_year ?? null,
                    semester: item.academic_term.semester ?? null
                  }
                : null,
              subject_name: item.subject?.name ?? subjectNames
            };
          });
        }

        console.log('[Enrollment] Mapped enrollments:', mapped);
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
        this.safeText(e.student?.name).includes(query) ||
        this.safeText(e.student_id).includes(query) ||
        this.safeText(e.student?.student_no).includes(query) ||
        this.safeText(e.subject_name).includes(query) ||
        this.safeText(e.subjects?.map(subject => subject.name).join(' ')).includes(query) ||
        this.safeText(e.subject_id).includes(query) ||
        this.safeText(e.academic_term_id).includes(query) ||
        this.safeText(e.semester).includes(query) ||
        this.safeText(e.school_year).includes(query) ||
        this.safeText(e.status).includes(query)
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

  private normalizeSubjects(item: EnrollmentApiResponse): EnrollmentSubject[] {
    if (!Array.isArray(item.subjects)) {
      if (!item.subject) {
        return [];
      }
      return [
        {
          id: this.normalizeNumber(item.subject.id ?? item.subject_id),
          code: item.subject.subject_code ?? item.subject.code ?? null,
          name: item.subject.name ?? null,
          status: item.status ?? null
        }
      ];
    }

    return item.subjects.map((subject: any) => ({
      id: this.normalizeNumber(subject.id),
      code: subject.code ?? subject.subject_code ?? null,
      name: subject.name ?? null,
      status: subject.status ?? item.status ?? null
    }));
  }

  private resolveEnrollmentId(item: EnrollmentApiResponse): number | null {
    const candidates = [
      item?.id,
      item?.enrollment_id,
      item?.enrollmentId,
      item?.record_id,
      item?.recordId,
      item?.enrollment?.id,
      item?.pivot?.enrollment_id,
      item?.pivot?.id
    ];

    for (const candidate of candidates) {
      const parsed = this.normalizeNumber(candidate);
      if (parsed != null && parsed > 0) {
        return parsed;
      }
    }

    return null;
  }

  private safeText(value: unknown): string {
    return value == null ? '' : String(value).toLowerCase();
  }
}
