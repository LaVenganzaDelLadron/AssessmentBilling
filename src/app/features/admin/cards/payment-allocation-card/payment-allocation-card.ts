import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentAllocation } from '../../models/payment-allocation.model';

@Component({
  selector: 'app-payment-allocation-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-allocation-card.html',
  styleUrl: './payment-allocation-card.css',
})
export class PaymentAllocationCard {
  @Input() allocation!: PaymentAllocation;
}
