import {
  AdminDateTimeString,
  AdminNumericValue,
  BaseAdminModel
} from './admin-api.model';

export interface Payment extends BaseAdminModel {
  invoice_id: number;
  amount_paid: AdminNumericValue;
  reference_number: string | null;
  paid_at: AdminDateTimeString;
  payment_method: string;
}

export interface CreatePaymentPayload {
  invoice_id: number;
  amount_paid: AdminNumericValue;
  payment_method: string;
  reference_number: string | null;
  paid_at: string;
}

export type UpdatePaymentPayload = Partial<CreatePaymentPayload>;
