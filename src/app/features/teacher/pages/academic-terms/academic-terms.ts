import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/assessment/environment';
import { TeacherAcademicTermCard } from '../../cards/academic-term-card/academic-term-card';
import { TeacherAcademicTerm } from '../../models/academic-term.model';

@Component({
  selector: 'app-teacher-academic-terms',
  standalone: true,
  imports: [CommonModule, FormsModule, TeacherAcademicTermCard],
  templateUrl: './academic-terms.html',
  styleUrl: './academic-terms.css',
})
export class TeacherAcademicTermsPage implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly teacherApiUrl = `${environment.apiUrl}/teacher/academic-terms`;

  terms: TeacherAcademicTerm[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  ngOnInit(): void {
    this.loadTerms();
  }

  loadTerms(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.http.get<any>(this.teacherApiUrl).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response) => {
        const data = Array.isArray(response) ? response : response?.data ?? [];
        this.terms = Array.isArray(data) ? data.map((item) => this.mapTerm(item)) : [];
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.terms = [];
          this.isLoading = false;
          return;
        }

        this.errorMessage = error?.error?.message || 'Failed to load academic terms.';
        this.isLoading = false;
      }
    });
  }

  get filteredTerms(): TeacherAcademicTerm[] {
    const query = this.searchQuery.trim().toLowerCase();
    if (!query) {
      return this.terms;
    }

    return this.terms.filter((term) => JSON.stringify(term).toLowerCase().includes(query));
  }

  get activeCount(): number {
    return this.terms.filter((term) => term.is_active).length;
  }

  private mapTerm(item: any): TeacherAcademicTerm {
    return {
      id: this.toNumber(item.id),
      school_year: item.school_year ?? '',
      semester: item.semester ?? '',
      start_date: item.start_date ?? null,
      end_date: item.end_date ?? null,
      is_active: Boolean(item.is_active),
      created_at: item.created_at ?? null,
      updated_at: item.updated_at ?? null,
    };
  }

  private toNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
}
