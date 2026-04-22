import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminDataService, Payment as PaymentModel } from '../../../../shared/services/admin-data.service';
import { AddPaymentModalComponent } from '../../modals/payments/add-payment/add-payment.modal';
import { UpdatePaymentModalComponent } from '../../modals/payments/update-payment/update-payment.modal';
import { DeletePaymentModalComponent } from '../../modals/payments/delete-payment/delete-payment.modal';
import { PaymentCard } from '../../cards/payment-card/payment-card';
import { Payment as PaymentCardModel } from '../../models/payment.model';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaymentCard,
    AddPaymentModalComponent,
    UpdatePaymentModalComponent,
    DeletePaymentModalComponent
  ],
  templateUrl: './payment.html',
  styleUrl: './payment.css',
})
export class Payment implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

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

  mockPayments: PaymentModel[] = [
    {
      id: 1,
      reference_number: 'PAY-2024-001',
      invoice_id: 1001,
      amount_paid: 150.50,
      payment_method_id: 1,
      paid_at: '2024-10-01T14:30:00Z',
      updated_at: '2024-10-01T14:35:00Z'
    },
    {
      id: 2,
      reference_number: 'PAY-2024-002',
      invoice_id: 1002,
      amount_paid: 250.00,
      payment_method_id: 2,
      paid_at: '2024-10-02T09:15:00Z',
      updated_at: '2024-10-02T09:20:00Z'
    },
    {
      id: 3,
      reference_number: 'PAY-2024-003',
      invoice_id: 1001,
      amount_paid: 99.99,
      payment_method_id: 5,
      paid_at: '2024-10-03T16:45:00Z',
      updated_at: '2024-10-03T16:50:00Z'
    }
  ];

  constructor(private adminDataService: AdminDataService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.isLoading = true;
    this.errorMessage = '';

    this.adminDataService.getPayments().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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

  getTotalCollected(): number {
    return this.getFilteredPayments().reduce((sum, payment) => {
      const amount = Number(payment.amount_paid ?? 0);
      return sum + (Number.isNaN(amount) ? 0 : amount);
    }, 0);
  }

  getUniqueMethodCount(): number {
    return new Set(
      this.getFilteredPayments()
        .map((payment) => this.getPaymentMethod(payment.payment_method_id))
        .filter((method) => method && method !== 'Unknown')
    ).size;
  }

  getRecentPaymentCount(): number {
    const now = new Date();
    return this.getFilteredPayments().filter((payment) => {
      if (!payment.paid_at) {
        return false;
      }

      const paidAt = new Date(payment.paid_at);
      if (Number.isNaN(paidAt.getTime())) {
        return false;
      }

      const diff = now.getTime() - paidAt.getTime();
      return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;
  }

  getPaymentMethod(method: string | number) {
    if (typeof method === 'string') {
      return method;
    }
    return this.paymentMethods[method as number] || 'Unknown';
  }

  formatAmount(value: number | string | null | undefined): string {
    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return String(value ?? '0.00');
    }

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numericValue);
  }

  refreshPayments() {
    this.loadPayments();
  }

  generateSamplePayments() {
    this.payments = [...this.mockPayments];
    this.errorMessage = '';
  }

  toCardPayment(payment: PaymentModel): PaymentCardModel {
    return {
      id: Number(payment.id ?? 0),
      invoice_id: Number(payment.invoice_id ?? 0),
      amount_paid: payment.amount_paid,
      reference_number: payment.reference_number ?? null,
      paid_at: payment.paid_at ?? new Date().toISOString(),
      payment_method: this.getPaymentMethod(payment.payment_method_id),
      created_at: payment.updated_at ?? null,
      updated_at: payment.updated_at ?? null
    };
  }
}
