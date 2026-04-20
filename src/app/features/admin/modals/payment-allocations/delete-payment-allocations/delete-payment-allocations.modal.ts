import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentAllocationsService } from '../../../../../shared/services/payment-allocations.service';

@Component({
  selector: 'app-delete-payment-allocations-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-payment-allocations.modal.html',
  styleUrl: './delete-payment-allocations.modal.css'
})
export class DeletePaymentAllocationsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  constructor(private paymentAllocationsService: PaymentAllocationsService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentAllocationsService.delete(this.currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to delete payment allocation';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
