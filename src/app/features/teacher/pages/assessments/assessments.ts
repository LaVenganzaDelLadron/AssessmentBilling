import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/assessment/environment';
import { TeacherAssessmentCard } from '../../cards/assessment-card/assessment-card';
import { TeacherAssessment } from '../../models/assessment.model';
import { TeacherAddAssessmentModalComponent } from '../../modals/assessment/add-assessment/add-assessment.modal';
import { TeacherDeleteAssessmentModalComponent } from '../../modals/assessment/delete-assessment/delete-assessment.modal';
import { TeacherUpdateAssessmentModalComponent } from '../../modals/assessment/update-assessment/update-assessment.modal';

@Component({
  selector: 'app-assessments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TeacherAssessmentCard,
    TeacherAddAssessmentModalComponent,
    TeacherUpdateAssessmentModalComponent,
    TeacherDeleteAssessmentModalComponent
  ],
  templateUrl: './assessments.html',
  styleUrl: './assessments.css',
})
export class Assessments implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiUrl = `${environment.apiUrl}/teacher/assessments`;

  @ViewChild(TeacherAddAssessmentModalComponent) addModal!: TeacherAddAssessmentModalComponent;
  @ViewChild(TeacherUpdateAssessmentModalComponent) updateModal!: TeacherUpdateAssessmentModalComponent;
  @ViewChild(TeacherDeleteAssessmentModalComponent) deleteModal!: TeacherDeleteAssessmentModalComponent;

  assessments: TeacherAssessment[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  ngOnInit(): void {
    this.loadAssessments();
  }

  loadAssessments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.teacherApiUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        this.assessments = Array.isArray(data) ? data.map((item) => this.mapAssessment(item)) : [];
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.assessments = [];
          this.isLoading = false;
          return;
        }

        this.errorMessage = error?.error?.message || 'Failed to load assessments.';
        this.isLoading = false;
      }
    });
  }

  get filteredAssessments(): TeacherAssessment[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.assessments.filter((assessment) => {
      const matchesQuery = !query || JSON.stringify(assessment).toLowerCase().includes(query);
      const matchesStatus = !this.statusFilter || assessment.status === this.statusFilter;
      return matchesQuery && matchesStatus;
    });
  }

  get finalizedCount(): number {
    return this.assessments.filter((assessment) => assessment.status === 'finalized').length;
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(assessment: TeacherAssessment): void {
    this.updateModal.open(assessment);
  }

  openDeleteModal(assessment: TeacherAssessment): void {
    this.deleteModal.open(assessment);
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

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
