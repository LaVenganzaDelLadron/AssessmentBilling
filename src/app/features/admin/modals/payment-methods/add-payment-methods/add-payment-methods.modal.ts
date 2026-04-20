import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PaymentMethodsService } from '../../../../../shared/services/payment-methods.service';

@Component({
  selector: 'app-add-payment-methods-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-payment-methods.modal.html',
  styleUrl: './add-payment-methods.modal.css'
})
export class AddPaymentMethodsModalComponent implements OnInit {
  @ViewChild('modal') modal: any;
  @Output() refresh = new EventEmitter<void>();

  isOpen = false;
  isLoading = false;
  errorMessage = '';

  method_name = '';
  description = '';
  is_active = true;

  constructor(private paymentMethodsService: PaymentMethodsService) {}

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

    this.paymentMethodsService.create(data).subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.refresh.emit();
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error?.message || 'Failed to create payment method';
      }
    });
  }

  private resetForm(): void {
    this.method_name = '';
    this.description = '';
    this.is_active = true;
    this.errorMessage = '';
  }
}
