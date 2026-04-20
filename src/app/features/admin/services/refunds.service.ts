import { Injectable } from '@angular/core';
import {
  CreateRefundPayload,
  Refund,
  UpdateRefundPayload
} from '../models/refund.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class RefundsService extends AdminCrudService<
  Refund,
  CreateRefundPayload,
  UpdateRefundPayload
> {
  constructor() {
    super('refunds');
  }

  setCachedRefunds(refunds: Refund[]): void {
    this.setCachedValue('mapped-list', refunds);
  }

  getCachedRefunds(): Refund[] | null {
    return this.getCachedValue<Refund[]>('mapped-list');
  }
}
