import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Output() editRequested = new EventEmitter<PaymentAllocation>();
  @Output() deleteRequested = new EventEmitter<PaymentAllocation>();

  requestEdit(): void {
    this.editRequested.emit(this.allocation);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.allocation);
  }
}
