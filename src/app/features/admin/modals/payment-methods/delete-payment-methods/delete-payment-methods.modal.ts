import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentMethod } from '../../../models/payment-method.model';
import { PaymentMethodsService } from '../../../services/payment-methods.service';

@Component({
  selector: 'app-delete-payment-methods-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-payment-methods.modal.html',
  styleUrl: './delete-payment-methods.modal.css'
})
export class DeletePaymentMethodsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: PaymentMethod | null = null;

  constructor(private paymentMethodsService: PaymentMethodsService) {}

  ngOnInit(): void {}

  open(entity: PaymentMethod): void {
    this.currentEntity = entity;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  submit(): void {
    const currentEntity = this.currentEntity;

    if (!currentEntity) {
      this.errorMessage = 'No payment method selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentMethodsService.delete(currentEntity.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to delete payment method';
      }
    });
  }

  private resetForm(): void {
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
