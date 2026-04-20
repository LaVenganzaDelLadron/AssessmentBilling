import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { PaymentAllocation } from '../../models/payment-allocation.model';
import { PaymentAllocationsService } from '../../services/payment-allocations.service';
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
  styleUrl: './payment-allocations.css'
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

  ngOnInit(): void {
    this.loadAllocations();
  }

  loadAllocations(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.allocationsService.list().subscribe({
      next: (response) => {
        this.allocations = Array.isArray(response) ? response : response.data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 404) {
          this.allocations = [];
          return;
        }

        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to load payment allocations';
        console.error('Error:', error);
      }
    });
  }

  getFilteredAllocations(): PaymentAllocation[] {
    if (!this.searchQuery) {
      return this.allocations;
    }

    const query = this.searchQuery.toLowerCase();

    return this.allocations.filter(allocation =>
      allocation.payment_id.toString().includes(query) ||
      allocation.invoice_id.toString().includes(query) ||
      String(allocation.amount_applied).toLowerCase().includes(query)
    );
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(allocation: PaymentAllocation): void {
    this.updateModal.open(allocation);
  }

  openDeleteModal(allocation: PaymentAllocation): void {
    this.deleteModal.open(allocation);
  }

  formatAmount(value: AdminNumericValue): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value);
    }

    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
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
