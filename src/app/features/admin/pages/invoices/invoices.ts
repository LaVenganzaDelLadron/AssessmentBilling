import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Invoice } from '../../../../shared/services/admin-data.service';
import { AddInvoiceModalComponent } from '../../modals/invoices/add-invoice/add-invoice.modal';
import { UpdateInvoiceModalComponent } from '../../modals/invoices/update-invoice/update-invoice.modal';
import { DeleteInvoiceModalComponent } from '../../modals/invoices/delete-invoice/delete-invoice.modal';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddInvoiceModalComponent,
    UpdateInvoiceModalComponent,
    DeleteInvoiceModalComponent
  ],
  templateUrl: './invoices.html',
  styleUrl: './invoices.css',
})
export class Invoices implements OnInit {
  @ViewChild(AddInvoiceModalComponent) addModal!: AddInvoiceModalComponent;
  @ViewChild(UpdateInvoiceModalComponent) updateModal!: UpdateInvoiceModalComponent;
  @ViewChild(DeleteInvoiceModalComponent) deleteModal!: DeleteInvoiceModalComponent;

  invoices: Invoice[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';
  statusFilter = '';

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit() {
    this.loadInvoices();
  }

  loadInvoices() {
    this.isLoading = true;
    this.adminDataService.getInvoices().subscribe({
      next: (data) => {
        this.invoices = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load invoices';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(invoice: Invoice) {
    this.updateModal.open(invoice);
  }

  openDeleteModal(invoice: Invoice) {
    this.deleteModal.open(invoice);
  }

  getFilteredInvoices() {
    let filtered = this.invoices;
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(i => i.invoice_number.toLowerCase().includes(query));
    }
    if (this.statusFilter) {
      filtered = filtered.filter(i => i.status === this.statusFilter);
    }
    return filtered;
  }

  getStatusColor(status: string) {
    switch(status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
