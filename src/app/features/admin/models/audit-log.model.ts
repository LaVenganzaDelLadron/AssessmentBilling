import { BaseAdminModel } from './admin-api.model';

export interface AuditLog extends BaseAdminModel {
  user_id: number | null;
  action: string;
  entity_type: string;
  entity_id: number;
  ip_address: string | null;
}
