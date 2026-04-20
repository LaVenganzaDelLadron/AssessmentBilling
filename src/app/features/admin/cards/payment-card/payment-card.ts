import { Component, Input } from '@angular/core';
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
}
