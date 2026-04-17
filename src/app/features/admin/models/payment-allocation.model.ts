import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export interface PaymentAllocation extends BaseAdminModel {
  payment_id: number;
  invoice_id: number;
  amount_allocated?: AdminNumericValue;
  amount?: AdminNumericValue;
  [key: string]: unknown;
}

export type CreatePaymentAllocationPayload = Omit<
  PaymentAllocation,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdatePaymentAllocationPayload =
  Partial<CreatePaymentAllocationPayload>;
