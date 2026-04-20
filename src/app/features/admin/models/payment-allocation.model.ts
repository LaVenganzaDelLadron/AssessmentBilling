import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export interface PaymentAllocation extends BaseAdminModel {
  payment_id: number;
  invoice_id: number;
  amount_applied: AdminNumericValue;
}

export interface CreatePaymentAllocationPayload {
  payment_id: number;
  invoice_id: number;
  amount_applied: AdminNumericValue;
}

export type UpdatePaymentAllocationPayload =
  Partial<CreatePaymentAllocationPayload>;
