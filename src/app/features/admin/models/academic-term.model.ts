import { AdminDateString, BaseAdminModel } from './admin-api.model';

export interface AcademicTerm extends BaseAdminModel {
  school_year: string;
  semester: string;
  start_date: AdminDateString;
  end_date: AdminDateString;
  is_active: boolean;
}

export type CreateAcademicTermPayload = Omit<
  AcademicTerm,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateAcademicTermPayload = Partial<CreateAcademicTermPayload>;
