import {
  AdminDateString,
  AdminNumericValue,
  BaseAdminModel
} from './admin-api.model';

export type InvoiceStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface Invoice extends BaseAdminModel {
  student_id: number;
  student_name?: string | null;
  assessment_id: number;
  invoice_number: string;
  total_amount: AdminNumericValue;
  balance: AdminNumericValue;
  due_date: AdminDateString;
  status: InvoiceStatus;
}

export type CreateInvoicePayload = Omit<
  Invoice,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateInvoicePayload = Partial<CreateInvoicePayload>;
