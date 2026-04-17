import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export interface Subject extends BaseAdminModel {
  code: string;
  name: string;
  units: AdminNumericValue;
  program_id: number | null;
  subject_code: string | null;
  type: string | null;
  status: string;
  external_id: number | null;
  custom_id: string | null;
}

export type CreateSubjectPayload = Omit<
  Subject,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateSubjectPayload = Partial<CreateSubjectPayload>;
