import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentsService, AssessmentModel } from '../../../../shared/services/assessments.service';
import { UpdateAssessmentsModalComponent } from '../../modals/assessments/update-assessments/update-assessments.modal';
import { DeleteAssessmentsModalComponent } from '../../modals/assessments/delete-assessments/delete-assessments.modal';
import { AddAssessmentsModalComponent } from '../../modals/assessments/add-assessments/add-assessments.modal';

@Component({
  selector: 'app-assessment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAssessmentsModalComponent,
    UpdateAssessmentsModalComponent,
    DeleteAssessmentsModalComponent
  ],
  templateUrl: './assessment.html',
  styleUrl: './assessment.css',
})
export class Assessment implements OnInit {
  @ViewChild(AddAssessmentsModalComponent) addModal!: AddAssessmentsModalComponent;
  @ViewChild(UpdateAssessmentsModalComponent) updateModal!: UpdateAssessmentsModalComponent;
  @ViewChild(DeleteAssessmentsModalComponent) deleteModal!: DeleteAssessmentsModalComponent;

  assessments: AssessmentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  constructor(private assessmentService: AssessmentsService) {}

  ngOnInit() {
    this.loadAssessments();
  }

  loadAssessments() {
    this.isLoading = true;
    this.assessmentService.list().subscribe({
      next: (data: any) => {
        this.assessments = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load assessments';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  getFilteredAssessments() {
    let filtered = this.assessments;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(a => JSON.stringify(a).toLowerCase().includes(query));
    }
    if (this.statusFilter) {
      filtered = filtered.filter(a => a.status === this.statusFilter);
    }
    return filtered;
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(assessment: AssessmentModel) {
    this.updateModal.open(assessment);
  }

  openDeleteModal(assessment: AssessmentModel) {
    this.deleteModal.open(assessment);
  }

  getStatusBadge(status: string) {
    const baseClass = 'px-3 py-1 rounded-full text-xs font-bold';
    switch(status) {
      case 'published': return `${baseClass} bg-green-100 text-green-800`;
      case 'draft': return `${baseClass} bg-slate-100 text-slate-800`;
      case 'closed': return `${baseClass} bg-gray-100 text-gray-800`;
      default: return `${baseClass} bg-blue-100 text-blue-800`;
    }
  }
}
