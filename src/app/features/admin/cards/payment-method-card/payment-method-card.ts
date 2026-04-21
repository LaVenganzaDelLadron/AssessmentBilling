import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../models/payment-method.model';

@Component({
  selector: 'app-payment-method-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-method-card.html',
  styleUrl: './payment-method-card.css',
})
export class PaymentMethodCard {
  @Input() method!: PaymentMethod;
  @Output() editRequested = new EventEmitter<PaymentMethod>();
  @Output() deleteRequested = new EventEmitter<PaymentMethod>();

  requestEdit(): void {
    this.editRequested.emit(this.method);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.method);
  }
}
