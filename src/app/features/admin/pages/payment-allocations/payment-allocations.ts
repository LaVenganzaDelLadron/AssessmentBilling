import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentAllocationsService, PaymentAllocation } from '../../../../shared/services/payment-allocations.service';
import { AddPaymentAllocationsModalComponent } from '../../modals/payment-allocations/add-payment-allocations/add-payment-allocations.modal';
import { UpdatePaymentAllocationsModalComponent } from '../../modals/payment-allocations/update-payment-allocations/update-payment-allocations.modal';
import { DeletePaymentAllocationsModalComponent } from '../../modals/payment-allocations/delete-payment-allocations/delete-payment-allocations.modal';

@Component({
  selector: 'app-payment-allocations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddPaymentAllocationsModalComponent,
    UpdatePaymentAllocationsModalComponent,
    DeletePaymentAllocationsModalComponent
  ],
  templateUrl: './payment-allocations.html',
  styleUrl: './payment-allocations.css',
})
export class PaymentAllocations implements OnInit {
  @ViewChild(AddPaymentAllocationsModalComponent) addModal!: AddPaymentAllocationsModalComponent;
  @ViewChild(UpdatePaymentAllocationsModalComponent) updateModal!: UpdatePaymentAllocationsModalComponent;
  @ViewChild(DeletePaymentAllocationsModalComponent) deleteModal!: DeletePaymentAllocationsModalComponent;

  allocations: PaymentAllocation[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private allocationsService: PaymentAllocationsService) {}

  ngOnInit() {
    this.loadAllocations();
  }

  loadAllocations() {
    this.isLoading = true;
    this.allocationsService.list().subscribe({
      next: (data: any) => {
        this.allocations = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load payment allocations';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  getFilteredAllocations() {
    if (!this.searchQuery) return this.allocations;
    const query = this.searchQuery.toLowerCase();
    return this.allocations.filter(a => JSON.stringify(a).toLowerCase().includes(query));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(allocation: PaymentAllocation) {
    this.updateModal.open(allocation);
  }

  openDeleteModal(allocation: PaymentAllocation) {
    this.deleteModal.open(allocation);
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  }
}
