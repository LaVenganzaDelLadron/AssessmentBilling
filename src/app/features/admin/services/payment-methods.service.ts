import { Injectable } from '@angular/core';
import {
  CreatePaymentMethodPayload,
  PaymentMethod,
  UpdatePaymentMethodPayload
} from '../models/payment-method.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class PaymentMethodsService extends AdminCrudService<
  PaymentMethod,
  CreatePaymentMethodPayload,
  UpdatePaymentMethodPayload
> {
  constructor() {
    super('payment-methods');
  }
}
