import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentAllocationsService, PaymentAllocation } from '../../../../../shared/services/payment-allocations.service';

@Component({
  selector: 'app-add-payment-allocations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payment-allocations.modal.html',
  styleUrl: './add-payment-allocations.modal.css'
})
export class AddPaymentAllocationsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  payment_id: number | null = null;
  invoice_id: number | null = null;
  allocated_amount: number | null = null;

  constructor(private paymentAllocationsService: PaymentAllocationsService) {}

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
      !this.payment_id ||
      !this.invoice_id ||
      !this.allocated_amount
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

    const data: PaymentAllocation = {
      payment_id: this.payment_id || 0,
      invoice_id: this.invoice_id || 0,
      allocated_amount: this.allocated_amount || 0
    };

    this.paymentAllocationsService.create(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to create payment allocation';
      }
    });
  }

  private resetForm(): void {
    this.payment_id = null;
    this.invoice_id = null;
    this.allocated_amount = null;
    this.errorMessage = '';
  }
}
