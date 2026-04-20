import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Enrollment as EnrollmentModel } from '../../../../shared/services/admin-data.service';
import { AddEnrollmentModalComponent } from '../../modals/enrollments/add-enrollment/add-enrollment.modal';
import { UpdateEnrollmentModalComponent } from '../../modals/enrollments/update-enrollment/update-enrollment.modal';
import { DeleteEnrollmentModalComponent } from '../../modals/enrollments/delete-enrollment/delete-enrollment.modal';

@Component({
  selector: 'app-enrollment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddEnrollmentModalComponent,
    UpdateEnrollmentModalComponent,
    DeleteEnrollmentModalComponent
  ],
  templateUrl: './enrollment.html',
  styleUrl: './enrollment.css',
})
export class Enrollment implements OnInit {
  @ViewChild(AddEnrollmentModalComponent) addModal!: AddEnrollmentModalComponent;
  @ViewChild(UpdateEnrollmentModalComponent) updateModal!: UpdateEnrollmentModalComponent;
  @ViewChild(DeleteEnrollmentModalComponent) deleteModal!: DeleteEnrollmentModalComponent;

  enrollments: EnrollmentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit() {
    this.loadEnrollments();
  }

  loadEnrollments() {
    this.isLoading = true;
    this.adminDataService.getEnrollments().subscribe({
      next: (data) => {
        this.enrollments = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load enrollments';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(enrollment: EnrollmentModel) {
    this.updateModal.open(enrollment);
  }

  openDeleteModal(enrollment: EnrollmentModel) {
    this.deleteModal.open(enrollment);
  }

  getFilteredEnrollments() {
    let filtered = this.enrollments;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.student_id.toString().includes(query) ||
        e.subject_id.toString().includes(query)
      );
    }
    if (this.statusFilter) {
      filtered = filtered.filter(e => e.status === this.statusFilter);
    }
    return filtered;
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'enrolled': return 'bg-green-100 text-green-800';
      case 'dropped': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
