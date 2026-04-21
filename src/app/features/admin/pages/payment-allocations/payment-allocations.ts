import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminNumericValue } from '../../models/admin-api.model';
import { PaymentAllocation } from '../../models/payment-allocation.model';
import { PaymentAllocationsService } from '../../services/payment-allocations.service';
import { AddPaymentAllocationsModalComponent } from '../../modals/payment-allocations/add-payment-allocations/add-payment-allocations.modal';
import { UpdatePaymentAllocationsModalComponent } from '../../modals/payment-allocations/update-payment-allocations/update-payment-allocations.modal';
import { DeletePaymentAllocationsModalComponent } from '../../modals/payment-allocations/delete-payment-allocations/delete-payment-allocations.modal';
import { PaymentAllocationCard } from '../../cards/payment-allocation-card/payment-allocation-card';

@Component({
  selector: 'app-payment-allocations',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddPaymentAllocationsModalComponent,
    UpdatePaymentAllocationsModalComponent,
    DeletePaymentAllocationsModalComponent,
    PaymentAllocationCard
  ],
  templateUrl: './payment-allocations.html',
  styleUrl: './payment-allocations.css'
})
export class PaymentAllocations implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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
    this.errorMessage = '';
    this.isLoading = true;
    this.allocationsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        let mapped: PaymentAllocation[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.payment_allocation_id ?? null,
            payment_id: item.payment_id ?? null,
            invoice_id: item.invoice_id ?? null,
            amount_applied: item.amount_applied ?? 0,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.allocations = mapped;
        this.allocationsService.setCachedAllocations(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('[PaymentAllocations] API error:', error);
        if (error?.status === 404) {
          this.allocations = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = this.getErrorMessage(error) || 'Failed to load payment allocations';
        this.isLoading = false;
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
