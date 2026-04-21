import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficialReceipt } from '../../models/official-receipt.model';
import { OfficialReceiptsService } from '../../services/official-receipts.service';
import { ReceiptCard } from '../../cards/receipt-card/receipt-card';
import { UpdateOfficialReceiptsModalComponent } from '../../modals/official-receipts/update-official-receipts/update-official-receipts.modal';
import { DeleteOfficialReceiptsModalComponent } from '../../modals/official-receipts/delete-official-receipts/delete-official-receipts.modal';

@Component({
  selector: 'app-receipts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReceiptCard,
    UpdateOfficialReceiptsModalComponent,
    DeleteOfficialReceiptsModalComponent
  ],
  templateUrl: './receipts.html',
  styleUrl: './receipts.css',
})
export class ReceiptsPage implements OnInit {
  @ViewChild(UpdateOfficialReceiptsModalComponent) updateModal!: UpdateOfficialReceiptsModalComponent;
  @ViewChild(DeleteOfficialReceiptsModalComponent) deleteModal!: DeleteOfficialReceiptsModalComponent;

  receipts: OfficialReceipt[] = [];
  errorMessage = '';
  searchQuery = '';

  constructor(private receiptsService: OfficialReceiptsService) {}

  ngOnInit() {
    const cached = this.receiptsService.getCachedReceipts?.();
    if (cached && cached.length > 0) {
      this.receipts = cached;
    } else {
      this.loadReceipts();
    }
  }

  loadReceipts() {
    this.errorMessage = '';
    this.receiptsService.list().subscribe({
      next: (response: any) => {
        let mapped: OfficialReceipt[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.official_receipt_id ?? null,
            payment_id: item.payment_id ?? null,
            or_number: item.or_number ?? '',
            issued_by: item.issued_by ?? '',
            issued_at: item.issued_at ?? null,
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.receipts = mapped;
        this.receiptsService.setCachedReceipts?.(mapped);
      },
      error: (error) => {
        if (error?.status === 404) {
          this.receipts = [];
          return;
        }
        this.errorMessage = 'Failed to load receipts';
      }
    });
  }

  getFilteredReceipts(): OfficialReceipt[] {
    if (!this.searchQuery) return this.receipts;
    const query = this.searchQuery.toLowerCase();
    return this.receipts.filter(receipt =>
      String(receipt.payment_id).includes(query) ||
      (receipt.or_number ?? '').toLowerCase().includes(query) ||
      (receipt.issued_by ?? '').toLowerCase().includes(query)
    );
  }

  openUpdateModal(receipt: OfficialReceipt): void {
    this.updateModal.open(receipt);
  }

  openDeleteModal(receipt: OfficialReceipt): void {
    this.deleteModal.open(receipt);
  }
}
