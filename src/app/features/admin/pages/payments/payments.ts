import { Component, OnInit, ViewChild, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Payment } from '../../models/payment.model';
import { PaymentsService } from '../../services/payments.service';
import { PaymentCard } from '../../cards/payment-card/payment-card';
import { Payment as LegacyPayment } from '../../../../shared/services/admin-data.service';
import { UpdatePaymentModalComponent } from '../../modals/payments/update-payment/update-payment.modal';
import { DeletePaymentModalComponent } from '../../modals/payments/delete-payment/delete-payment.modal';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaymentCard,
    UpdatePaymentModalComponent,
    DeletePaymentModalComponent
  ],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class PaymentsPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild(UpdatePaymentModalComponent) updateModal!: UpdatePaymentModalComponent;
  @ViewChild(DeletePaymentModalComponent) deleteModal!: DeletePaymentModalComponent;

  payments: Payment[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private paymentsService: PaymentsService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.errorMessage = '';
    this.isLoading = true;
    this.paymentsService.list().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (response: any) => {
        let mapped: Payment[] = [];
        let data = Array.isArray(response) ? response : response.data ?? [];
        if (Array.isArray(data)) {
          mapped = data.map((item: any) => ({
            id: item.id ?? item.payment_id ?? null,
            invoice_id: item.invoice_id ?? null,
            amount_paid: item.amount_paid ?? 0,
            reference_number: item.reference_number ?? null,
            paid_at: item.paid_at ?? null,
            payment_method: item.payment_method ?? '',
            created_at: item.created_at ?? null,
            updated_at: item.updated_at ?? null
          }));
        }
        this.payments = mapped;
        this.paymentsService.setCachedPayments(mapped);
        this.isLoading = false;
      },
      error: (error) => {
        if (error?.status === 404) {
          this.payments = [];
          this.isLoading = false;
          return;
        }
        this.errorMessage = 'Failed to load payments';
        this.isLoading = false;
      }
    });
  }

  getFilteredPayments(): Payment[] {
    if (!this.searchQuery) return this.payments;
    const query = this.searchQuery.toLowerCase();
    return this.payments.filter(payment =>
      String(payment.invoice_id).includes(query) ||
      String(payment.amount_paid).includes(query) ||
      (payment.reference_number ?? '').toLowerCase().includes(query) ||
      (payment.payment_method ?? '').toLowerCase().includes(query)
    );
  }

  openUpdateModal(payment: Payment): void {
    this.updateModal.open(this.toLegacyPayment(payment));
  }

  openDeleteModal(payment: Payment): void {
    this.deleteModal.open(this.toLegacyPayment(payment));
  }

  private toLegacyPayment(payment: Payment): LegacyPayment {
    return {
      id: payment.id,
      invoice_id: payment.invoice_id,
      amount_paid: Number(payment.amount_paid),
      reference_number: payment.reference_number ?? '',
      paid_at: payment.paid_at ?? new Date().toISOString(),
      payment_method_id: this.getPaymentMethodId(payment.payment_method)
    };
  }

  private getPaymentMethodId(paymentMethod: string | undefined): number {
    switch (paymentMethod?.trim().toLowerCase()) {
      case 'cash':
        return 1;
      case 'credit/debit card':
      case 'credit card':
      case 'debit card':
        return 2;
      case 'check':
        return 3;
      case 'bank transfer':
        return 4;
      case 'online payment':
        return 5;
      default:
        return 6;
    }
  }
}
