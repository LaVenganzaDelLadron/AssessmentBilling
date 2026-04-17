import { BaseAdminModel } from './admin-api.model';

export interface Program extends BaseAdminModel {
  name: string;
  department: string;
  code: string | null;
  status: string;
  external_id: number | null;
  custom_id: string | null;
}

export type CreateProgramPayload = Omit<
  Program,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateProgramPayload = Partial<CreateProgramPayload>;
