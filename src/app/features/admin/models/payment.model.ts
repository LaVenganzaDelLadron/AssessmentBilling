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
  payment_method_id: number;
}

export type CreatePaymentPayload = Omit<
  Payment,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdatePaymentPayload = Partial<CreatePaymentPayload>;
