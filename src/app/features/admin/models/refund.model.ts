import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export type RefundStatus = 'pending' | 'approved' | 'rejected';

export interface Refund extends BaseAdminModel {
  payment_id: number;
  amount: AdminNumericValue;
  reason: string;
  status: RefundStatus;
}

export type CreateRefundPayload = Omit<
  Refund,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateRefundPayload = Partial<CreateRefundPayload>;
