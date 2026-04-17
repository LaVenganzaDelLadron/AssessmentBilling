import { BaseAdminModel } from './admin-api.model';

export type StudentStatus = 'active' | 'inactive';

export interface Student extends BaseAdminModel {
  student_no: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  program_id: number;
  year_level: number;
  status: StudentStatus;
  user_id: number | null;
}

export type CreateStudentPayload = Omit<
  Student,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateStudentPayload = Partial<CreateStudentPayload>;
