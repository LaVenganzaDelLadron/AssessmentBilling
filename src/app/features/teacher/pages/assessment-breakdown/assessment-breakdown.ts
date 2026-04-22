import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/assessment/environment';
import { TeacherAssessmentBreakdownCard } from '../../cards/assessment-breakdown-card/assessment-breakdown-card';
import { TeacherAssessmentBreakdown } from '../../models/assessment-breakdown.model';
import { TeacherAddAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/add-assessment-breakdown/add-assessment-breakdown.modal';
import { TeacherDeleteAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/delete-assessment-breakdown/delete-assessment-breakdown.modal';
import { TeacherUpdateAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/update-assessment-breakdown/update-assessment-breakdown.modal';

@Component({
  selector: 'app-teacher-assessment-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TeacherAssessmentBreakdownCard,
    TeacherAddAssessmentBreakdownModalComponent,
    TeacherUpdateAssessmentBreakdownModalComponent,
    TeacherDeleteAssessmentBreakdownModalComponent
  ],
  templateUrl: './assessment-breakdown.html',
  styleUrl: './assessment-breakdown.css',
})
export class TeacherAssessmentBreakdownPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiUrl = `${environment.apiUrl}/teacher/assessment-breakdown`;

  @ViewChild(TeacherAddAssessmentBreakdownModalComponent) addModal!: TeacherAddAssessmentBreakdownModalComponent;
  @ViewChild(TeacherUpdateAssessmentBreakdownModalComponent) updateModal!: TeacherUpdateAssessmentBreakdownModalComponent;
  @ViewChild(TeacherDeleteAssessmentBreakdownModalComponent) deleteModal!: TeacherDeleteAssessmentBreakdownModalComponent;

  breakdowns: TeacherAssessmentBreakdown[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  sourceFilter = '';

  ngOnInit(): void {
    this.loadBreakdowns();
  }

  loadBreakdowns(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.teacherApiUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        this.breakdowns = Array.isArray(data) ? data.map((item) => this.mapBreakdown(item)) : [];
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.breakdowns = [];
          this.isLoading = false;
          return;
        }

        this.errorMessage = error?.error?.message || 'Failed to load assessment breakdowns.';
        this.isLoading = false;
      }
    });
  }

  get filteredBreakdowns(): TeacherAssessmentBreakdown[] {
    const query = this.searchQuery.trim().toLowerCase();

    return this.breakdowns.filter((breakdown) => {
      const matchesQuery = !query || JSON.stringify(breakdown).toLowerCase().includes(query);
      const matchesType = !this.sourceFilter || breakdown.source_type === this.sourceFilter;
      return matchesQuery && matchesType;
    });
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(breakdown: TeacherAssessmentBreakdown): void {
    this.updateModal.open(breakdown);
  }

  openDeleteModal(breakdown: TeacherAssessmentBreakdown): void {
    this.deleteModal.open(breakdown);
  }

  private mapBreakdown(item: any): TeacherAssessmentBreakdown {
    return {
      id: this.toNumber(item.id),
      assessment_id: this.toNumber(item.assessment_id),
      source_type: item.source_type ?? 'subject',
      source_id: item.source_id ?? null,
      description: item.description ?? '',
      units: item.units ?? null,
      rate: item.rate ?? null,
      amount: item.amount ?? 0,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    };
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
