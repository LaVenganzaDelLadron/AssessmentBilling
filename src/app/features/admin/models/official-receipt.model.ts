import { AdminDateTimeString, BaseAdminModel } from './admin-api.model';

export interface OfficialReceipt extends BaseAdminModel {
  payment_id: number;
  or_number: string;
  issued_by: string;
  issued_at: AdminDateTimeString;
}

export type CreateOfficialReceiptPayload = Omit<
  OfficialReceipt,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateOfficialReceiptPayload = Partial<CreateOfficialReceiptPayload>;
