import { BaseAdminModel } from './admin-api.model';

export interface PaymentMethod extends BaseAdminModel {
  name: string;
  code: string;
  is_active: boolean;
}

export type CreatePaymentMethodPayload = Omit<
  PaymentMethod,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>;
