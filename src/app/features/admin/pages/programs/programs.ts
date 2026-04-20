import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Program } from '../../models/program.model';
import { ProgramsService } from '../../services/programs.service';
import { ProgramCard } from '../../cards/program-card/program-card';

@Component({
  selector: 'app-programs',
  standalone: true,
  imports: [CommonModule, FormsModule, ProgramCard],
  templateUrl: './programs.html',
  styleUrl: './programs.css',
})
export class Programs implements OnInit {
  programs: Program[] = [];
  // isLoading removed
  errorMessage = '';
  searchQuery: string = '';

  constructor(private programService: ProgramsService) {}

  ngOnInit() {
    const cached = this.programService.getCachedPrograms();
    if (cached && cached.length > 0) {
      this.programs = cached;
    } else {
      this.loadPrograms();
    }
  }

  loadPrograms() {
    this.errorMessage = '';
    this.programService.list().subscribe({
      next: (response: any) => {
        let mapped: Program[] = [];
        if (response && response.data && Array.isArray(response.data)) {
          mapped = response.data.map((item: any) => ({
            id: item.id ?? item.program_id ?? null,
            name: item.name ?? item.program_name ?? 'N/A',
            department: item.department ?? item.dept ?? 'N/A',
            code: item.code ?? null,
            status: item.status ?? null,
            external_id: item.external_id ?? null,
            custom_id: item.custom_id ?? null,
            updated_at: item.updated_at ?? null,
            created_at: item.created_at ?? null,
            tuition_per_unit: item.tuition_per_unit ?? null
          }));
        } else if (Array.isArray(response)) {
          mapped = response.map((item: any) => ({
            id: item.id ?? item.program_id ?? null,
            name: item.name ?? item.program_name ?? 'N/A',
            department: item.department ?? item.dept ?? 'N/A',
            code: item.code ?? null,
            status: item.status ?? null,
            external_id: item.external_id ?? null,
            custom_id: item.custom_id ?? null,
            updated_at: item.updated_at ?? null,
            created_at: item.created_at ?? null,
            tuition_per_unit: item.tuition_per_unit ?? null
          }));
        }
        this.programs = mapped;
        this.programService.setCachedPrograms(mapped);
        console.log('Mapped Programs:', this.programs);
      },
      error: (error) => {
        console.error('[Programs] API error:', error);
        if (error?.status === 404) {
          this.programs = [];
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load programs';
      }
    });
  }

  getFilteredPrograms(): Program[] {
    if (!this.searchQuery) return this.programs;
    const q = this.searchQuery.toLowerCase();
    return this.programs.filter(program =>
      [
        program.id,
        program.name,
        program.department,
        program.code ?? '',
        program.status ?? '',
        program.external_id ?? '',
        program.custom_id ?? ''
      ]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  trackByProgramId(_: number, program: Program): number {
    return program.id;
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
