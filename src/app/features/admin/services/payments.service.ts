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
}
