import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InvoiceLinesService, InvoiceLine } from '../../../../shared/services/invoice-lines.service';
import { AddInvoiceLinesModalComponent } from '../../modals/invoice-lines/add-invoice-lines/add-invoice-lines.modal';
import { UpdateInvoiceLinesModalComponent } from '../../modals/invoice-lines/update-invoice-lines/update-invoice-lines.modal';
import { DeleteInvoiceLinesModalComponent } from '../../modals/invoice-lines/delete-invoice-lines/delete-invoice-lines.modal';

@Component({
  selector: 'app-invoice-lines',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddInvoiceLinesModalComponent,
    UpdateInvoiceLinesModalComponent,
    DeleteInvoiceLinesModalComponent
  ],
  templateUrl: './invoice-lines.html',
  styleUrl: './invoice-lines.css',
})
export class InvoiceLines implements OnInit {
  @ViewChild(AddInvoiceLinesModalComponent) addModal!: AddInvoiceLinesModalComponent;
  @ViewChild(UpdateInvoiceLinesModalComponent) updateModal!: UpdateInvoiceLinesModalComponent;
  @ViewChild(DeleteInvoiceLinesModalComponent) deleteModal!: DeleteInvoiceLinesModalComponent;

  lines: InvoiceLine[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private invoiceLinesService: InvoiceLinesService) {}

  ngOnInit() {
    this.loadLines();
  }

  loadLines() {
    this.isLoading = true;
    this.invoiceLinesService.list().subscribe({
      next: (data: any) => {
        this.lines = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load invoice lines';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  getFilteredLines() {
    if (!this.searchQuery) return this.lines;
    const query = this.searchQuery.toLowerCase();
    return this.lines.filter(l => JSON.stringify(l).toLowerCase().includes(query));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(line: InvoiceLine) {
    this.updateModal.open(line);
  }

  openDeleteModal(line: InvoiceLine) {
    this.deleteModal.open(line);
  }

  formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  }
}
