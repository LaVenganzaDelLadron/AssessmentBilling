import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceLine, InvoiceLineGroupView } from '../../models/invoice-line.model';

@Component({
  selector: 'app-invoice-line-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './invoice-line-card.html',
  styleUrl: './invoice-line-card.css',
})
export class InvoiceLineCard {
  @Input() line: InvoiceLine | null = null;
  @Input() group: InvoiceLineGroupView | null = null;
  @Output() editRequested = new EventEmitter<InvoiceLine>();
  @Output() deleteRequested = new EventEmitter<InvoiceLine>();

  getInvoiceDisplay(): string {
    if (this.group) {
      return this.group.invoice_label;
    }
    if (this.line) {
      return this.line.invoice?.invoice_number?.trim() || `#${this.line.invoice_id}`;
    }
    return 'N/A';
  }

  getSubjectsPreview(): string {
    if (!this.group || this.group.subject_labels.length === 0) {
      return 'No subjects';
    }

    if (this.group.subject_labels.length <= 3) {
      return this.group.subject_labels.join(', ');
    }

    const preview = this.group.subject_labels.slice(0, 3).join(', ');
    return `${preview} +${this.group.subject_labels.length - 3} more`;
  }

  getDisplayLines(): InvoiceLine[] {
    if (this.group?.lines?.length) {
      return this.group.lines;
    }

    return this.line ? [this.line] : [];
  }

  getLineSubjectDisplay(line: InvoiceLine): string {
    if (!line.subject_id) {
      return 'No subject';
    }

    return (
      line.subject?.name?.trim() ||
      line.subject?.subject_code?.trim() ||
      line.subject?.code?.trim() ||
      `#${line.subject_id}`
    );
  }

  getLineTypeDisplay(line: InvoiceLine): string {
    return line.line_type
      .split('_')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  requestEdit(line: InvoiceLine): void {
    this.editRequested.emit(line);
  }

  requestDelete(line: InvoiceLine): void {
    this.deleteRequested.emit(line);
  }

  trackByLineId(_: number, line: InvoiceLine): number {
    return line.id;
  }
}
