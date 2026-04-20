import { BaseAdminModel } from './admin-api.model';

export interface PaymentMethod extends BaseAdminModel {
  name: string;
  code?: string | null;
  is_active?: boolean | null;
}

export interface CreatePaymentMethodPayload {
  name: string;
  code?: string | null;
  is_active?: boolean | null;
}

export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>;
