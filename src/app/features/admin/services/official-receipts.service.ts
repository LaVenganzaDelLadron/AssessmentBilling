import { Injectable } from '@angular/core';
import {
  CreateOfficialReceiptPayload,
  OfficialReceipt,
  UpdateOfficialReceiptPayload
} from '../models/official-receipt.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class OfficialReceiptsService extends AdminCrudService<
  OfficialReceipt,
  CreateOfficialReceiptPayload,
  UpdateOfficialReceiptPayload
> {
  private _cachedReceipts: OfficialReceipt[] | null = null;

  constructor() {
    super('official-receipts');
  }

  setCachedReceipts(receipts: OfficialReceipt[]): void {
    this._cachedReceipts = receipts;
  }

  getCachedReceipts(): OfficialReceipt[] | null {
    return this._cachedReceipts;
  }
}
