import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Refund } from '../../models/refund.model';

@Component({
  selector: 'app-refund-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refund-card.html',
  styleUrl: './refund-card.css',
})
export class RefundCard {
  @Input() refund!: Refund;
  @Output() editRequested = new EventEmitter<Refund>();
  @Output() deleteRequested = new EventEmitter<Refund>();

  requestEdit(): void {
    this.editRequested.emit(this.refund);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.refund);
  }
}
