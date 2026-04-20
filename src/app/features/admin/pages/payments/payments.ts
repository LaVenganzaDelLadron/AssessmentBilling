import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Payment } from '../../models/payment.model';
import { PaymentsService } from '../../services/payments.service';
import { PaymentCard } from '../../cards/payment-card/payment-card';

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [CommonModule, FormsModule, PaymentCard],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class PaymentsPage implements OnInit {
  payments: Payment[] = [];
  errorMessage = '';
  searchQuery = '';

  constructor(private paymentsService: PaymentsService) {}

  ngOnInit() {
    const cached = this.paymentsService.getCachedPayments();
    if (cached && cached.length > 0) {
      this.payments = cached;
    } else {
      this.loadPayments();
    }
  }

  loadPayments() {
    this.errorMessage = '';
    this.paymentsService.list().subscribe({
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
      },
      error: (error) => {
        if (error?.status === 404) {
          this.payments = [];
          return;
        }
        this.errorMessage = 'Failed to load payments';
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
}
