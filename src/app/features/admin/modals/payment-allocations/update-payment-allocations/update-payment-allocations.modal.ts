import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentAllocationsService, PaymentAllocation } from '../../../../../shared/services/payment-allocations.service';

@Component({
  selector: 'app-update-payment-allocations-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-payment-allocations.modal.html',
  styleUrl: './update-payment-allocations.modal.css'
})
export class UpdatePaymentAllocationsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  payment_id: number = 0;
  invoice_id: number = 0;
  allocated_amount: number = 0;

  constructor(private paymentAllocationsService: PaymentAllocationsService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.payment_id = entity.payment_id;
    this.invoice_id = entity.invoice_id;
    this.allocated_amount = entity.allocated_amount;
    this.isOpen = true;
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

    this.paymentAllocationsService.update(this.currentEntity.id, data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to update payment allocation';
      }
    });
  }

  private resetForm(): void {
    this.payment_id = 0;
    this.invoice_id = 0;
    this.allocated_amount = 0;
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
