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
  constructor() {
    super('official-receipts');
  }
}
