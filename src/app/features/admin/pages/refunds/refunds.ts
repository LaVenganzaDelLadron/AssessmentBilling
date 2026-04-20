import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Refund } from '../../models/refund.model';
import { RefundsService } from '../../services/refunds.service';
import { AddRefundModalComponent } from '../../modals/refunds/add-refund/add-refund.modal';
import { UpdateRefundModalComponent } from '../../modals/refunds/update-refund/update-refund.modal';
import { DeleteRefundModalComponent } from '../../modals/refunds/delete-refund/delete-refund.modal';
import { RefundCard } from '../../cards/refund-card/refund-card';

@Component({
  selector: 'app-refunds',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddRefundModalComponent,
    UpdateRefundModalComponent,
    DeleteRefundModalComponent,
    RefundCard
  ],
  templateUrl: './refunds.html',
  styleUrl: './refunds.css',
})
export class Refunds implements OnInit {
  @ViewChild(AddRefundModalComponent) addModal!: AddRefundModalComponent;
  @ViewChild(UpdateRefundModalComponent) updateModal!: UpdateRefundModalComponent;
  @ViewChild(DeleteRefundModalComponent) deleteModal!: DeleteRefundModalComponent;

  refunds: Refund[] = [];
  // isLoading removed
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  constructor(private refundsService: RefundsService) {}

  ngOnInit() {
    const cached = this.refundsService.getCachedRefunds?.();
    if (cached && cached.length > 0) {
      this.refunds = cached;
    } else {
      this.loadRefunds();
    }
  }

  loadRefunds() {
    this.errorMessage = '';
    this.refundsService.list().subscribe({
      next: (response: any) => {
        let mapped: Refund[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.refund_id ?? null,
            payment_id: item.payment_id ?? null,
            amount: item.amount ?? 0,
            reason: item.reason ?? '',
            status: item.status ?? 'pending',
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.refunds = mapped;
        this.refundsService.setCachedRefunds?.(mapped);
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load refunds';
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(refund: Refund) {
    // Map Refund to expected type with amount as number
    const mapped = {
      ...refund,
      amount: typeof refund.amount === 'string' ? Number(refund.amount) : refund.amount
    };
    this.updateModal.open(mapped as any);
  }

  openDeleteModal(refund: Refund) {
    const mapped = {
      ...refund,
      amount: typeof refund.amount === 'string' ? Number(refund.amount) : refund.amount
    };
    this.deleteModal.open(mapped as any);
  }

  getFilteredRefunds() {
    let filtered = this.refunds;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(refund =>
        [
          refund.id ?? '',
          refund.payment_id,
          refund.amount,
          refund.reason,
          refund.status
        ]
          .join(' ')
          .toLowerCase()
          .includes(query)
      );
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

  formatAmount(value: number | string | null | undefined): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value ?? '0.00');
    }

    return numericValue.toFixed(2);
  }
}
