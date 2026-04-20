import { Injectable } from '@angular/core';
import {
  CreatePaymentPayload,
  Payment,
  UpdatePaymentPayload
} from '../models/payment.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class PaymentsService extends AdminCrudService<
  Payment,
  CreatePaymentPayload,
  UpdatePaymentPayload
> {
  constructor() {
    super('payments');
  }

  setCachedPayments(payments: Payment[]): void {
    this.setCachedValue('mapped-list', payments);
  }

  getCachedPayments(): Payment[] | null {
    return this.getCachedValue<Payment[]>('mapped-list');
  }
}
