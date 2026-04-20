import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicTermService, AcademicTerm } from '../../../../shared/services/academic-term.service';
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

  constructor(private academicTermService: AcademicTermService) {}

  ngOnInit() {
    this.loadTerms();
  }

  loadTerms() {
    this.isLoading = true;
    this.academicTermService.getAcademicTerms().subscribe({
      next: (data) => {
        this.terms = data;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'Failed to load academic terms';
        this.isLoading = false;
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

  getFilteredTerms() {
    if (!this.searchQuery) return this.terms;
    const query = this.searchQuery.toLowerCase();
    return this.terms.filter(term =>
      term.school_year.toLowerCase().includes(query) ||
      term.semester.toLowerCase().includes(query)
    );
  }

  getStatusBadge(isActive: boolean) {
    return isActive ? 'Active' : 'Inactive';
  }

  getStatusColor(isActive: boolean) {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  }
}
