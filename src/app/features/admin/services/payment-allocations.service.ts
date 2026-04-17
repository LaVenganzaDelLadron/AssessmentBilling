import { Injectable } from '@angular/core';
import {
  CreatePaymentAllocationPayload,
  PaymentAllocation,
  UpdatePaymentAllocationPayload
} from '../models/payment-allocation.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class PaymentAllocationsService extends AdminCrudService<
  PaymentAllocation,
  CreatePaymentAllocationPayload,
  UpdatePaymentAllocationPayload
> {
  constructor() {
    super('payment-allocation');
  }
}
