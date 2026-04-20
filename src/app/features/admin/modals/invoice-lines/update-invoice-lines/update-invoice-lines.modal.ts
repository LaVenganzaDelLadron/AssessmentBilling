import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InvoiceLinesService, InvoiceLine } from '../../../../../shared/services/invoice-lines.service';

@Component({
  selector: 'app-update-invoice-lines-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-invoice-lines.modal.html',
  styleUrl: './update-invoice-lines.modal.css'
})
export class UpdateInvoiceLinesModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  invoice_id: number = 0;
  description = '';
  quantity: number = 0;
  unit_price: number = 0;

  constructor(private invoiceLinesService: InvoiceLinesService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.invoice_id = entity.invoice_id;
    this.description = entity.description;
    this.quantity = entity.quantity;
    this.unit_price = entity.unit_price;
    this.isOpen = true;
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

    this.invoiceLinesService.update(this.currentEntity.id, data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to update invoice line';
      }
    });
  }

  private resetForm(): void {
    this.invoice_id = 0;
    this.description = '';
    this.quantity = 0;
    this.unit_price = 0;
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
