import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceLine } from '../../models/invoice-line.model';

@Component({
  selector: 'app-invoice-line-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-line-card.html',
  styleUrl: './invoice-line-card.css',
})
export class InvoiceLineCard {
  @Input() line!: InvoiceLine;
  @Output() editRequested = new EventEmitter<InvoiceLine>();
  @Output() deleteRequested = new EventEmitter<InvoiceLine>();

  requestEdit(): void {
    this.editRequested.emit(this.line);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.line);
  }
}
