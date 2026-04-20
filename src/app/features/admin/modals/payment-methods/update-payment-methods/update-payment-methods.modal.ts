import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentMethodsService } from '../../../../../shared/services/payment-methods.service';

@Component({
  selector: 'app-update-payment-methods-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './update-payment-methods.modal.html',
  styleUrl: './update-payment-methods.modal.css'
})
export class UpdatePaymentMethodsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  currentEntity: any = null;

  method_name = '';
  description = '';
  is_active = true;

  constructor(private paymentMethodsService: PaymentMethodsService) {}

  ngOnInit(): void {}

  open(entity: any): void {
    this.currentEntity = entity;
    this.method_name = entity.method_name;
    this.description = entity.description;
    this.is_active = entity.is_active;
    this.isOpen = true;
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (!this.method_name || !this.description) {
      this.errorMessage = 'All fields are required';
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const data = {
      method_name: this.method_name,
      description: this.description,
      is_active: this.is_active
    };

    this.paymentMethodsService.update(this.currentEntity.id, data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to update payment method';
      }
    });
  }

  private resetForm(): void {
    this.method_name = '';
    this.description = '';
    this.is_active = true;
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
