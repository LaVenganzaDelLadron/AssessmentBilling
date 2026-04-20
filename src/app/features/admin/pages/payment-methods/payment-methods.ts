import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethod } from '../../models/payment-method.model';
import { PaymentMethodsService } from '../../services/payment-methods.service';
import { AddPaymentMethodsModalComponent } from '../../modals/payment-methods/add-payment-methods/add-payment-methods.modal';
import { UpdatePaymentMethodsModalComponent } from '../../modals/payment-methods/update-payment-methods/update-payment-methods.modal';
import { DeletePaymentMethodsModalComponent } from '../../modals/payment-methods/delete-payment-methods/delete-payment-methods.modal';

@Component({
  selector: 'app-payment-methods',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddPaymentMethodsModalComponent,
    UpdatePaymentMethodsModalComponent,
    DeletePaymentMethodsModalComponent
  ],
  templateUrl: './payment-methods.html',
  styleUrl: './payment-methods.css'
})
export class PaymentMethods implements OnInit {
  @ViewChild(AddPaymentMethodsModalComponent) addModal!: AddPaymentMethodsModalComponent;
  @ViewChild(UpdatePaymentMethodsModalComponent) updateModal!: UpdatePaymentMethodsModalComponent;
  @ViewChild(DeletePaymentMethodsModalComponent) deleteModal!: DeletePaymentMethodsModalComponent;

  methods: PaymentMethod[] = [];
  isLoading = false;
  errorMessage = '';
  searchQuery = '';

  constructor(private methodsService: PaymentMethodsService) {}

  ngOnInit(): void {
    this.loadMethods();
  }

  loadMethods(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.methodsService.list().subscribe({
      next: (response) => {
        this.methods = Array.isArray(response) ? response : response.data ?? [];
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;

        if (error?.status === 404) {
          this.methods = [];
          return;
        }

        this.errorMessage =
          this.getErrorMessage(error) || 'Failed to load payment methods';
        console.error('Error:', error);
      }
    });
  }

  getFilteredMethods(): PaymentMethod[] {
    if (!this.searchQuery) {
      return this.methods;
    }

    const query = this.searchQuery.toLowerCase();

    return this.methods.filter(method => method.name.toLowerCase().includes(query));
  }

  openAddModal(): void {
    this.addModal.open();
  }

  openUpdateModal(method: PaymentMethod): void {
    this.updateModal.open(method);
  }

  openDeleteModal(method: PaymentMethod): void {
    this.deleteModal.open(method);
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
