import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicTerm } from '../../models/academic-term.model';
import { AcademicTermsService } from '../../services/academic-terms.service';
import { AddAcademicTermsModalComponent } from '../../modals/academic-terms/add-academic-terms/add-academic-terms.modal';
import { UpdateAcademicTermsModalComponent } from '../../modals/academic-terms/update-academic-terms/update-academic-terms.modal';
import { DeleteAcademicTermsModalComponent } from '../../modals/academic-terms/delete-academic-terms/delete-academic-terms.modal';

@Component({
  selector: 'app-academic-terms',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAcademicTermsModalComponent,
    UpdateAcademicTermsModalComponent,
    DeleteAcademicTermsModalComponent
  ],
  templateUrl: './academic-terms.html',
  styleUrl: './academic-terms.css',
})
export class AcademicTerms implements OnInit {
  @ViewChild(AddAcademicTermsModalComponent) addModal!: AddAcademicTermsModalComponent;
  @ViewChild(UpdateAcademicTermsModalComponent) updateModal!: UpdateAcademicTermsModalComponent;
  @ViewChild(DeleteAcademicTermsModalComponent) deleteModal!: DeleteAcademicTermsModalComponent;

  terms: AcademicTerm[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private academicTermsService: AcademicTermsService) {}

  ngOnInit() {
    this.loadTerms();
  }

  loadTerms() {
    this.isLoading = true;
    this.errorMessage = '';

    this.academicTermsService.list().subscribe({
      next: (response) => {
        this.terms = Array.isArray(response) ? response : response.data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 404) {
          this.terms = [];
          return;
        }

        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to load academic terms';
        console.error('Error loading terms:', error);
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(term: AcademicTerm) {
    this.updateModal.open(term);
  }

  openDeleteModal(term: AcademicTerm) {
    this.deleteModal.open(term);
  }

  getFilteredTerms(): AcademicTerm[] {
    if (!this.searchQuery) return this.terms;

    const query = this.searchQuery.toLowerCase();

    return this.terms.filter(term =>
      term.school_year.toLowerCase().includes(query) ||
      term.semester.toLowerCase().includes(query)
    );
  }

  getStatusBadge(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  getStatusColor(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }

  getDurationLabel(term: AcademicTerm): string {
    const start = new Date(term.start_date);
    const end = new Date(term.end_date);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
      return 'Duration unavailable';
    }

    const dayDifference = Math.round(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeks = Math.max(1, Math.ceil((dayDifference + 1) / 7));

    return `${weeks} Week${weeks === 1 ? '' : 's'} Duration`;
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
