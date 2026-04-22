import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/assessment/environment';
import { TeacherEnrollmentCard } from '../../cards/enrollment-card/enrollment-card';
import { TeacherEnrollment } from '../../models/enrollment.model';

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [CommonModule, FormsModule, TeacherEnrollmentCard],
  templateUrl: './enrollments.html',
  styleUrl: './enrollments.css',
})
export class Enrollments implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiUrl = `${environment.apiUrl}/teacher/enrollments`;

  enrollments: TeacherEnrollment[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  ngOnInit(): void {
    this.loadEnrollments();
  }

  loadEnrollments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.teacherApiUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        this.enrollments = Array.isArray(data) ? data.map((item) => this.mapEnrollment(item)) : [];
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.enrollments = [];
          this.isLoading = false;
          return;
        }

        this.errorMessage = error?.error?.message || 'Failed to load enrollments.';
        this.isLoading = false;
      }
    });
  }

  get filteredEnrollments(): TeacherEnrollment[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.enrollments;
    }

    return this.enrollments.filter((item) => JSON.stringify(item).toLowerCase().includes(query));
  }

  get activeCount(): number {
    return this.enrollments.filter((enrollment) => enrollment.status?.toLowerCase() === 'enrolled').length;
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

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
