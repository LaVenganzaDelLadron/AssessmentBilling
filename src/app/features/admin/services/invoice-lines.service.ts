import { Injectable } from '@angular/core';
import {
  CreateInvoiceLinePayload,
  InvoiceLine,
  UpdateInvoiceLinePayload
} from '../models/invoice-line.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class InvoiceLinesService extends AdminCrudService<
  InvoiceLine,
  CreateInvoiceLinePayload,
  UpdateInvoiceLinePayload
> {
  constructor() {
    super('invoice-lines');
  }
}
