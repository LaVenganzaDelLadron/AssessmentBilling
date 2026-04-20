import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InvoiceLinesService, InvoiceLine } from '../../../../../shared/services/invoice-lines.service';

@Component({
  selector: 'app-add-invoice-lines-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-invoice-lines.modal.html',
  styleUrl: './add-invoice-lines.modal.css'
})
export class AddInvoiceLinesModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  invoice_id: number | null = null;
  description = '';
  quantity: number | null = null;
  unit_price: number | null = null;

  constructor(private invoiceLinesService: InvoiceLinesService) {}

  ngOnInit(): void {}

  open(): void {
    this.isOpen = true;
    this.resetForm();
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (
      !this.invoice_id ||
      !this.description ||
      !this.quantity ||
      !this.unit_price
    ) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const data: InvoiceLine = {
      invoice_id: this.invoice_id || 0,
      description: this.description,
      quantity: this.quantity || 0,
      unit_price: this.unit_price || 0,
      line_total: (this.quantity || 0) * (this.unit_price || 0)
    };

    this.invoiceLinesService.create(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to create invoice line';
      }
    });
  }

  private resetForm(): void {
    this.invoice_id = 0;
    this.description = '';
    this.quantity = 0;
    this.unit_price = 0;
    this.errorMessage = '';
  }
}
