import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PaymentMethodsService, PaymentMethod } from '../../../../shared/services/payment-methods.service';
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
  styleUrl: './payment-methods.css',
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

  ngOnInit() {
    this.loadMethods();
  }

  loadMethods() {
    this.isLoading = true;
    this.methodsService.list().subscribe({
      next: (data: any) => {
        this.methods = Array.isArray(data) ? data : data.data || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        this.errorMessage = 'Failed to load payment methods';
        this.isLoading = false;
        console.error('Error:', error);
      }
    });
  }

  getFilteredMethods() {
    if (!this.searchQuery) return this.methods;
    const query = this.searchQuery.toLowerCase();
    return this.methods.filter(m => JSON.stringify(m).toLowerCase().includes(query));
  }

  openAddModal() {
    this.addModal.open();
  }

  openUpdateModal(method: PaymentMethod) {
    this.updateModal.open(method);
  }

  openDeleteModal(method: PaymentMethod) {
    this.deleteModal.open(method);
  }

  getStatusBadge(status: boolean) {
    return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  }
}
