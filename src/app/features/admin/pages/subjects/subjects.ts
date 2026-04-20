import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from '../../models/subject.model';
import { SubjectsService } from '../../services/subjects.service';
import { SubjectCard } from '../../cards/subject-card/subject-card';

@Component({
  selector: 'app-subjects',
  standalone: true,
  imports: [CommonModule, FormsModule, SubjectCard],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class Subjects implements OnInit {
  subjects: Subject[] = [];
  // isLoading removed
  errorMessage = '';
  searchQuery = '';


  constructor(private subjectService: SubjectsService) {}

  ngOnInit() {
    const cached = this.subjectService.getCachedSubjects();
    if (cached && cached.length > 0) {
      this.subjects = cached;
    } else {
      this.loadSubjects();
    }
  }
  // Program department lookup removed

  loadSubjects() {
    this.errorMessage = '';
    this.subjectService.list().subscribe({
      next: (response: any) => {
        console.log('[Subjects] API response:', response);
        let mapped: Subject[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.subject_id ?? null,
            code: item.code ?? item.subject_code ?? '',
            subject_code: item.subject_code ?? null,
            name: item.name ?? item.subject_name ?? 'N/A',
            units: item.units ?? null,
            program_id: item.program_id ?? null,
            type: item.type ?? null,
            status: item.status ?? null,
            external_id: item.external_id ?? null,
            custom_id: item.custom_id ?? null,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.subjects = mapped;
        this.subjectService.setCachedSubjects(mapped);
      },
      error: (error) => {
        console.error('[Subjects] API error:', error);
        if (error?.status === 404) {
          this.subjects = [];
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load subjects';
      }
    });
  }

  getFilteredSubjects(): Subject[] {
    if (!this.searchQuery) return this.subjects;
    const q = this.searchQuery.toLowerCase();
    return this.subjects.filter(subject =>
      [
        subject.id,
        subject.code,
        subject.subject_code ?? '',
        subject.name,
        subject.units,
        subject.program_id ?? '',
        subject.type ?? '',
        subject.status ?? '',
        subject.external_id ?? '',
        subject.custom_id ?? ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  trackBySubjectId(_: number, subject: Subject): number {
    return subject.id;
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
