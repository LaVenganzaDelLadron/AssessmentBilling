import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OfficialReceiptsService, OfficialReceipt } from '../../../../shared/services/official-receipts.service';
import { AddOfficialReceiptsModalComponent } from '../../modals/official-receipts/add-official-receipts/add-official-receipts.modal';
import { UpdateOfficialReceiptsModalComponent } from '../../modals/official-receipts/update-official-receipts/update-official-receipts.modal';
import { DeleteOfficialReceiptsModalComponent } from '../../modals/official-receipts/delete-official-receipts/delete-official-receipts.modal';

@Component({
  selector: 'app-official-receipts',
  standalone: true,
  imports: [CommonModule, FormsModule, AddOfficialReceiptsModalComponent, UpdateOfficialReceiptsModalComponent, DeleteOfficialReceiptsModalComponent],
  templateUrl: './official-receipts.html',
  styleUrl: './official-receipts.css',
})
export class OfficialReceipts implements OnInit {
  @ViewChild(AddOfficialReceiptsModalComponent) addModal!: AddOfficialReceiptsModalComponent;
  @ViewChild(UpdateOfficialReceiptsModalComponent) updateModal!: UpdateOfficialReceiptsModalComponent;
  @ViewChild(DeleteOfficialReceiptsModalComponent) deleteModal!: DeleteOfficialReceiptsModalComponent;

  receipts: OfficialReceipt[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private receiptService: OfficialReceiptsService) {}

  ngOnInit() {
    this.loadReceipts();
  }

  loadReceipts() {
    this.isLoading = true;
    this.receiptService.list().subscribe({
      next: (data: any) => {
        this.receipts = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load official receipts';
        this.isLoading = false;
      }
    });
  }

  getFilteredReceipts() {
    if (!this.searchQuery) return this.receipts;
    const q = this.searchQuery.toLowerCase();
    return this.receipts.filter(r => JSON.stringify(r).toLowerCase().includes(q));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(receipt: OfficialReceipt) {
    this.updateModal.open(receipt);
  }

  openDeleteModal(receipt: OfficialReceipt) {
    this.deleteModal.open(receipt);
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  }
}
