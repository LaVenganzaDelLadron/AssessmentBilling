import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateInvoiceLinePayload,
  InvoiceLineType
} from '../../../models/invoice-line.model';
import { InvoiceLinesService } from '../../../services/invoice-lines.service';

@Component({
  selector: 'app-add-invoice-lines-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice-lines.modal.html'
})
export class AddInvoiceLinesModalComponent {
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  form: CreateInvoiceLinePayload = this.createEmptyForm();
  readonly lineTypes: InvoiceLineType[] = [
    'tuition',
    'lab_fee',
    'misc_fee',
    'discount',
    'other'
  ];

  constructor(private invoiceLinesService: InvoiceLinesService) {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  get computedAmount(): number {
    return this.calculateAmount(this.form.quantity, this.form.unit_price);
  }

  getLineTypeLabel(type: InvoiceLineType): string {
    return type
      .split('_')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }

  validate(): boolean {
    if (!this.form.invoice_id) {
      this.errorMessage = 'Invoice is required';
      return false;
    }
    if (!this.form.line_type) {
      this.errorMessage = 'Line type is required';
      return false;
    }
    if (!this.form.description.trim()) {
      this.errorMessage = 'Description is required';
      return false;
    }
    if (this.form.description.trim().length > 255) {
      this.errorMessage = 'Description may not be greater than 255 characters';
      return false;
    }
    if (Number(this.form.quantity) < 0.01) {
      this.errorMessage = 'Quantity must be at least 0.01';
      return false;
    }
    if (Number(this.form.unit_price) < 0) {
      this.errorMessage = 'Unit price must be 0 or more';
      return false;
    }
    const normalizedSubjectId = this.normalizeOptionalNumber(this.form.subject_id);
    if (normalizedSubjectId !== null && normalizedSubjectId <= 0) {
      this.errorMessage = 'Subject ID must be a valid number';
      return false;
    }

    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const payload = this.buildPayload();

    this.invoiceLinesService.create(payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = this.getErrorMessage(error) || 'Failed to create invoice line';
        console.error('Error:', error);
      }
    });
  }

  private resetForm(): void {
    this.form = this.createEmptyForm();
    this.errorMessage = '';
    this.successMessage = '';
  }

  private createEmptyForm(): CreateInvoiceLinePayload {
    return {
      invoice_id: 0,
      line_type: 'tuition',
      subject_id: null,
      description: '',
      quantity: 1,
      unit_price: 0,
      amount: 0
    };
  }

  private buildPayload(): CreateInvoiceLinePayload {
    return {
      invoice_id: Number(this.form.invoice_id),
      line_type: this.form.line_type,
      subject_id: this.normalizeOptionalNumber(this.form.subject_id),
      description: this.form.description.trim(),
      quantity: Number(this.form.quantity),
      unit_price: Number(this.form.unit_price),
      amount: this.computedAmount
    };
  }

  private calculateAmount(quantity: number | string | null, unitPrice: number | string | null): number {
    const numericQuantity = Number(quantity);
    const numericUnitPrice = Number(unitPrice);

    if (Number.isNaN(numericQuantity) || Number.isNaN(numericUnitPrice)) {
      return 0;
    }

    return Number((numericQuantity * numericUnitPrice).toFixed(2));
  }

  private normalizeOptionalNumber(value: unknown): number | null {
    if (value === null || value === undefined || String(value).trim() === '') {
      return null;
    }

    return Number(value);
  }

  private getErrorMessage(error: unknown): string | null {
    const apiError = error as {
      error?: {
        message?: string;
        errors?: Record<string, string[]>;
      };
    };

    const validationErrors = apiError?.error?.errors;

    if (validationErrors) {
      for (const messages of Object.values(validationErrors)) {
        if (Array.isArray(messages) && typeof messages[0] === 'string') {
          return messages[0];
        }
      }
    }

    return apiError?.error?.message ?? null;
  }
}
