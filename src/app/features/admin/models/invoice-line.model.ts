import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export type InvoiceLineType =
  | 'tuition'
  | 'lab_fee'
  | 'misc_fee'
  | 'discount'
  | 'other';

export interface InvoiceLine extends BaseAdminModel {
  invoice_id: number;
  line_type: InvoiceLineType;
  subject_id: number | null;
  description: string;
  quantity: AdminNumericValue | null;
  unit_price: AdminNumericValue;
  amount: AdminNumericValue;
}

export type CreateInvoiceLinePayload = Omit<
  InvoiceLine,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateInvoiceLinePayload = Partial<CreateInvoiceLinePayload>;
