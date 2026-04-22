import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export type InvoiceLineType =
  | 'tuition'
  | 'lab_fee'
  | 'misc_fee'
  | 'discount'
  | 'other';

export interface InvoiceLineInvoiceRelation {
  id: number;
  invoice_number?: string | null;
}

export interface InvoiceLineSubjectRelation {
  id: number;
  subject_code?: string | null;
  code?: string | null;
  name?: string | null;
}

export interface InvoiceLine extends BaseAdminModel {
  invoice_id: number;
  line_type: InvoiceLineType;
  subject_id: number | null;
  description: string;
  quantity: AdminNumericValue | null;
  unit_price: AdminNumericValue;
  amount: AdminNumericValue;
  invoice?: InvoiceLineInvoiceRelation | null;
  subject?: InvoiceLineSubjectRelation | null;
}

export interface InvoiceLineGroupView {
  invoice_id: number;
  invoice_label: string;
  lines: InvoiceLine[];
  line_count: number;
  subject_labels: string[];
  totals: {
    overall: number;
    tuition: number;
    lab_fee: number;
    misc_fee: number;
    discount: number;
    other: number;
  };
}

export interface CreateInvoiceLinePayload {
  invoice_id: number;
  line_type: InvoiceLineType;
  subject_id: number | null;
  description: string;
  quantity: AdminNumericValue;
  unit_price: AdminNumericValue;
  amount: AdminNumericValue;
}

export type UpdateInvoiceLinePayload = Partial<CreateInvoiceLinePayload>;
