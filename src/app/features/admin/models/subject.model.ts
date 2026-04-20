import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export interface Subject extends BaseAdminModel {
  code: string;
  name: string;
  units: AdminNumericValue;
  program_id: number | null;
  subject_code?: string | null;
  type?: string | null;
  status?: string | null;
  external_id?: number | null;
  custom_id?: string | null;
}

export interface CreateSubjectPayload {
  code: string;
  name: string;
  units: AdminNumericValue;
  program_id: number;
}

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;
