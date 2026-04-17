import { Injectable } from '@angular/core';
import {
  CreateInvoicePayload,
  Invoice,
  UpdateInvoicePayload
} from '../models/invoice.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class InvoicesService extends AdminCrudService<
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload
> {
  constructor() {
    super('invoices');
  }
}
