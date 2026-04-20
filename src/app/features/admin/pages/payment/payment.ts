import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Payment as PaymentModel } from '../../../../shared/services/admin-data.service';
import { AddPaymentModalComponent } from '../../modals/payments/add-payment/add-payment.modal';
import { UpdatePaymentModalComponent } from '../../modals/payments/update-payment/update-payment.modal';
import { DeletePaymentModalComponent } from '../../modals/payments/delete-payment/delete-payment.modal';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddPaymentModalComponent,
    UpdatePaymentModalComponent,
    DeletePaymentModalComponent
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit {
  @ViewChild(AddPaymentModalComponent) addModal!: AddPaymentModalComponent;
  @ViewChild(UpdatePaymentModalComponent) updateModal!: UpdatePaymentModalComponent;
  @ViewChild(DeletePaymentModalComponent) deleteModal!: DeletePaymentModalComponent;

  payments: PaymentModel[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  paymentMethods: { [key: number]: string } = {
    1: 'Cash',
    2: 'Credit/Debit Card',
    3: 'Check',
    4: 'Bank Transfer',
    5: 'Online Payment',
    6: 'Other'
  };

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.adminDataService.getPayments().subscribe({
      next: (data) => {
        this.payments = data;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load payments';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(payment: PaymentModel) {
    this.updateModal.open(payment);
  }

  openDeleteModal(payment: PaymentModel) {
    this.deleteModal.open(payment);
  }

  getFilteredPayments() {
    if (!this.searchQuery) return this.payments;
    const query = this.searchQuery.toLowerCase();
    return this.payments.filter(p =>
      p.reference_number.toLowerCase().includes(query)
    );
  }

  getPaymentMethod(id: number) {
    return this.paymentMethods[id] || 'Unknown';
  }
}
