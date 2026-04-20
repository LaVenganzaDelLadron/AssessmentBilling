import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AssessmentBreakdownService, AssessmentBreakdown as AssessmentBreakdownModel } from '../../../../shared/services/assessment-breakdown.service';
import { AddAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/add-assessment-breakdown/add-assessment-breakdown.modal';
import { UpdateAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/update-assessment-breakdown/update-assessment-breakdown.modal';
import { DeleteAssessmentBreakdownModalComponent } from '../../modals/assessment-breakdown/delete-assessment-breakdown/delete-assessment-breakdown.modal';

@Component({
  selector: 'app-assessment-breakdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddAssessmentBreakdownModalComponent,
    UpdateAssessmentBreakdownModalComponent,
    DeleteAssessmentBreakdownModalComponent
  ],
  templateUrl: './assessment-breakdown.html',
  styleUrl: './assessment-breakdown.css',
})
export class AssessmentBreakdownPage implements OnInit {
  @ViewChild(AddAssessmentBreakdownModalComponent) addModal!: AddAssessmentBreakdownModalComponent;
  @ViewChild(UpdateAssessmentBreakdownModalComponent) updateModal!: UpdateAssessmentBreakdownModalComponent;
  @ViewChild(DeleteAssessmentBreakdownModalComponent) deleteModal!: DeleteAssessmentBreakdownModalComponent;

  breakdowns: AssessmentBreakdownModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private breakdownService: AssessmentBreakdownService) {}

  ngOnInit() {
    this.loadBreakdowns();
  }

  loadBreakdowns() {
    this.isLoading = true;
    this.breakdownService.list().subscribe({
      next: (data: any) => {
        this.breakdowns = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load assessment breakdowns';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  getFilteredBreakdowns() {
    if (!this.searchQuery) return this.breakdowns;
    const query = this.searchQuery.toLowerCase();
    return this.breakdowns.filter(b => JSON.stringify(b).toLowerCase().includes(query));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(breakdown: AssessmentBreakdownModel) {
    this.updateModal.open(breakdown);
  }

  openDeleteModal(breakdown: AssessmentBreakdownModel) {
    this.deleteModal.open(breakdown);
  }
}
