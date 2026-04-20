import { Component, Input } from '@angular/core';
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
}
