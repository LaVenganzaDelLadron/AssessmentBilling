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
  private _cachedRefunds: Refund[] | null = null;

  constructor() {
    super('refunds');
  }

  setCachedRefunds(refunds: Refund[]): void {
    this._cachedRefunds = refunds;
  }

  getCachedRefunds(): Refund[] | null {
    return this._cachedRefunds;
  }
}
