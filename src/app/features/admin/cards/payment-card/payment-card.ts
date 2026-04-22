import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment } from '../../models/payment.model';

@Component({
  selector: 'app-payment-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-card.html',
  styleUrl: './payment-card.css',
})
export class PaymentCard {
  @Input() payment!: Payment;
  @Output() editRequested = new EventEmitter<Payment>();
  @Output() deleteRequested = new EventEmitter<Payment>();

  getInvoiceDisplay(): string {
    return this.payment.invoice_id ? `Invoice #${this.payment.invoice_id}` : 'Invoice unavailable';
  }

  getReferenceDisplay(): string {
    return this.payment.reference_number?.trim() || 'No reference number';
  }

  getPaymentMethodDisplay(): string {
    return this.payment.payment_method?.trim() || 'Unspecified';
  }

  getAmountDisplay(): string {
    const amount = Number(this.payment.amount_paid);
    if (Number.isNaN(amount)) {
      return String(this.payment.amount_paid);
    }

    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  getPaidAtDisplay(): string {
    if (!this.payment.paid_at) {
      return 'No payment date';
    }

    const date = new Date(this.payment.paid_at);
    if (Number.isNaN(date.getTime())) {
      return this.payment.paid_at;
    }

    return new Intl.DateTimeFormat('en-PH', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  }

  requestEdit(): void {
    this.editRequested.emit(this.payment);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.payment);
  }
}
