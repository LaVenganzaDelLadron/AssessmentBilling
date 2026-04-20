import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficialReceipt } from '../../models/official-receipt.model';
import { OfficialReceiptsService } from '../../services/official-receipts.service';
import { AddOfficialReceiptsModalComponent } from '../../modals/official-receipts/add-official-receipts/add-official-receipts.modal';
import { UpdateOfficialReceiptsModalComponent } from '../../modals/official-receipts/update-official-receipts/update-official-receipts.modal';
import { DeleteOfficialReceiptsModalComponent } from '../../modals/official-receipts/delete-official-receipts/delete-official-receipts.modal';
import { ReceiptCard } from '../../cards/receipt-card/receipt-card';

@Component({
  selector: 'app-official-receipts',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddOfficialReceiptsModalComponent,
    UpdateOfficialReceiptsModalComponent,
    DeleteOfficialReceiptsModalComponent,
    ReceiptCard
  ],
  templateUrl: './official-receipts.html',
  styleUrl: './official-receipts.css'
})
export class OfficialReceipts implements OnInit {
  @ViewChild(AddOfficialReceiptsModalComponent) addModal!: AddOfficialReceiptsModalComponent;
  @ViewChild(UpdateOfficialReceiptsModalComponent) updateModal!: UpdateOfficialReceiptsModalComponent;
  @ViewChild(DeleteOfficialReceiptsModalComponent) deleteModal!: DeleteOfficialReceiptsModalComponent;

  receipts: OfficialReceipt[] = [];
  // isLoading removed
  errorMessage = '';
  searchQuery = '';

  constructor(private receiptService: OfficialReceiptsService) {}

  ngOnInit(): void {
    this.loadReceipts();
  }

  loadReceipts(): void {
    this.errorMessage = '';
    this.receiptService.list().subscribe({
      next: (response) => {
        this.receipts = Array.isArray(response) ? response : response.data ?? [];
      },
      error: (error) => {
        if (error?.status === 404) {
          this.receipts = [];
          return;
        }
        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to load official receipts';
        console.error('Error:', error);
      }
    });
  }

  getFilteredReceipts(): OfficialReceipt[] {
    if (!this.searchQuery) {
      return this.receipts;
    }

    const query = this.searchQuery.toLowerCase();

    return this.receipts.filter(receipt =>
      receipt.or_number.toLowerCase().includes(query) ||
      receipt.payment_id.toString().includes(query) ||
      receipt.issued_by.toLowerCase().includes(query) ||
      receipt.issued_at.toLowerCase().includes(query)
    );
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(receipt: OfficialReceipt): void {
    this.updateModal.open(receipt);
  }

  openDeleteModal(receipt: OfficialReceipt): void {
    this.deleteModal.open(receipt);
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
