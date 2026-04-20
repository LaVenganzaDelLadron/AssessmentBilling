import { Component, ViewChild, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  PaymentMethod,
  UpdatePaymentMethodPayload
} from '../../../models/payment-method.model';
import { PaymentMethodsService } from '../../../services/payment-methods.service';

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

  currentEntity: PaymentMethod | null = null;

  form: UpdatePaymentMethodPayload = {
    name: '',
    code: '',
    is_active: true
  };

  constructor(private paymentMethodsService: PaymentMethodsService) {}

  ngOnInit(): void {}

  open(entity: PaymentMethod): void {
    this.currentEntity = entity;
    this.form = {
      name: entity.name,
      code: entity.code ?? '',
      is_active: entity.is_active ?? true
    };
    this.isOpen = true;
    this.errorMessage = '';
  }

  close(): void {
    this.isOpen = false;
    this.resetForm();
  }

  validate(): boolean {
    if (!this.form.name?.trim()) {
      this.errorMessage = 'Name is required';
      return false;
    }
    return true;
  }

  submit(): void {
    if (!this.validate()) return;

    const currentEntity = this.currentEntity;

    if (!currentEntity) {
      this.errorMessage = 'No payment method selected';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.paymentMethodsService.update(currentEntity.id, {
      name: this.form.name?.trim(),
      code: this.form.code?.trim() || null,
      is_active: this.form.is_active ?? true
    }).subscribe({
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
    this.form = {
      name: '',
      code: '',
      is_active: true
    };
    this.errorMessage = '';
    this.currentEntity = null;
  }
}
