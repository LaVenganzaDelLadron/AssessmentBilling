import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Refund } from '../../../../shared/services/admin-data.service';
import { AddRefundModalComponent } from '../../modals/refunds/add-refund/add-refund.modal';
import { UpdateRefundModalComponent } from '../../modals/refunds/update-refund/update-refund.modal';
import { DeleteRefundModalComponent } from '../../modals/refunds/delete-refund/delete-refund.modal';

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddRefundModalComponent,
    UpdateRefundModalComponent,
    DeleteRefundModalComponent
  ],
  templateUrl: './refunds.html',
  styleUrl: './refunds.css',
})
export class Refunds implements OnInit {
  @ViewChild(AddRefundModalComponent) addModal!: AddRefundModalComponent;
  @ViewChild(UpdateRefundModalComponent) updateModal!: UpdateRefundModalComponent;
  @ViewChild(DeleteRefundModalComponent) deleteModal!: DeleteRefundModalComponent;

  refunds: Refund[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit() {
    this.loadRefunds();
  }

  loadRefunds() {
    this.isLoading = true;
    this.adminDataService.getRefunds().subscribe({
      next: (data) => {
        this.refunds = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load refunds';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(refund: Refund) {
    this.updateModal.open(refund);
  }

  openDeleteModal(refund: Refund) {
    this.deleteModal.open(refund);
  }

  getFilteredRefunds() {
    let filtered = this.refunds;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(r => r.reason.toLowerCase().includes(query));
    }
    if (this.statusFilter) {
      filtered = filtered.filter(r => r.status === this.statusFilter);
    }
    return filtered;
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'processed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
