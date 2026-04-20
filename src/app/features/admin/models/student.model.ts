import { BaseAdminModel } from './admin-api.model';

export type StudentStatus = 'active' | 'inactive';

export interface Student extends BaseAdminModel {
  student_no: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email?: string | null;
  program_id: number;
  year_level: number;
  status: StudentStatus;
  user_id: number | null;
  program?: {
    id: number;
    name?: string | null;
    code?: string | null;
  } | null;
}

export interface CreateStudentPayload {
  student_no: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  email?: string | null;
  program_id: number;
  year_level: number;
  status: StudentStatus;
  user_id: number | null;
}

export type UpdateStudentPayload = Partial<CreateStudentPayload>;
