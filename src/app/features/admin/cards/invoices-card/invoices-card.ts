import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../models/invoice.model';

@Component({
  selector: 'app-invoices-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoices-card.html',
  styleUrl: './invoices-card.css',
})
export class InvoicesCard {
  @Input() invoice!: Invoice;
  @Output() editRequested = new EventEmitter<Invoice>();
  @Output() deleteRequested = new EventEmitter<Invoice>();

  requestEdit(): void {
    this.editRequested.emit(this.invoice);
  }

  requestDelete(): void {
    this.deleteRequested.emit(this.invoice);
  }
}
