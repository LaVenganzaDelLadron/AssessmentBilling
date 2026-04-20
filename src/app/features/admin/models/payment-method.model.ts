import { BaseAdminModel } from './admin-api.model';

export interface PaymentMethod extends BaseAdminModel {
  name: string;
}

export interface CreatePaymentMethodPayload {
  name: string;
}

export type UpdatePaymentMethodPayload = Partial<CreatePaymentMethodPayload>;
