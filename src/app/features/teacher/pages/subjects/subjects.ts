import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/assessment/environment';
import { TeacherSubjectCard } from '../../cards/subject-card/subject-card';
import { TeacherSubject } from '../../models/subject.model';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, TeacherSubjectCard],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiUrl = `${environment.apiUrl}/teacher/subjects`;

  subjects: TeacherSubject[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  ngOnInit(): void {
    this.loadSubjects();
  }

  loadSubjects(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.teacherApiUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        this.subjects = Array.isArray(data) ? data.map((item) => this.mapSubject(item)) : [];
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.subjects = [];
          this.isLoading = false;
          return;
        }

        this.errorMessage = error?.error?.message || 'Failed to load subjects.';
        this.isLoading = false;
      }
    });
  }

  get filteredSubjects(): TeacherSubject[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.subjects;
    }

    return this.subjects.filter((subject) => JSON.stringify(subject).toLowerCase().includes(query));
  }

  get totalUnits(): number {
    return this.subjects.reduce((total, subject) => total + Number(subject.units || 0), 0);
  }

  private mapSubject(item: any): TeacherSubject {
    return {
      id: this.toNumber(item.id),
      code: item.code ?? item.subject_code ?? '',
      name: item.name ?? '',
      units: item.units ?? 0,
      program_id: this.toNumber(item.program_id),
      program_name: item.program_name ?? item.program?.name ?? null,
      type: item.type ?? null,
      status: item.status ?? 'active',
      custom_id: item.custom_id ?? null,
      program: item.program ?? null,
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    };
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
