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
    this.errorMessage = '';

    this.adminDataService.getPayments().subscribe({
      next: (response: any) => {
        console.log('[Payments] API response:', response);
        this.payments = Array.isArray(response) ? response : response?.data ?? [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('[Payments] API error:', error);
        this.errorMessage = 'Failed to load payments';
        this.isLoading = false;
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
      [
        p.id ?? '',
        p.reference_number ?? '',
        p.invoice_id,
        p.amount_paid,
        this.getPaymentMethod(p.payment_method_id),
        p.paid_at
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }

  getPaymentMethod(id: number) {
    return this.paymentMethods[id] || 'Unknown';
  }

  formatAmount(value: number | string | null | undefined): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value ?? '0.00');
    }

    return numericValue.toFixed(2);
  }
}
