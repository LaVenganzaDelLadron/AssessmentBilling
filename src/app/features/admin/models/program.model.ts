import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export interface Program extends BaseAdminModel {
  name: string;
  department: string;
  tuition_per_unit: AdminNumericValue;
  code?: string | null;
  status?: string | null;
  external_id?: number | null;
  custom_id?: string | null;
}

export interface CreateProgramPayload {
  name: string;
  department: string;
  tuition_per_unit: AdminNumericValue;
}

export type UpdateProgramPayload = Partial<CreateProgramPayload>;
