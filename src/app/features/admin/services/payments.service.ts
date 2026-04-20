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
  private _cachedPayments: Payment[] | null = null;

  constructor() {
    super('payments');
  }

  setCachedPayments(payments: Payment[]): void {
    this._cachedPayments = payments;
  }

  getCachedPayments(): Payment[] | null {
    return this._cachedPayments;
  }
}
