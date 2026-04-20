import { AdminDateTimeString, BaseAdminModel } from './admin-api.model';

export interface OfficialReceipt extends BaseAdminModel {
  payment_id: number;
  or_number: string;
  issued_by: string;
  issued_at: AdminDateTimeString;
}

export interface CreateOfficialReceiptPayload {
  payment_id: number;
  or_number: string;
  issued_by: string;
  issued_at: string;
}

export type UpdateOfficialReceiptPayload = Partial<CreateOfficialReceiptPayload>;
