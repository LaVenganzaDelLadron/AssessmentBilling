import { BaseAdminModel } from './admin-api.model';

export type TeacherStatus = 'active' | 'inactive';

export interface Teacher extends BaseAdminModel {
  user_id: number;
  teacher_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  department: string | null;
  status: TeacherStatus;
  user?: {
    id: number;
    name?: string | null;
    email?: string | null;
  } | null;
}

export interface CreateTeacherPayload {
  user_id: number;
  teacher_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  department: string | null;
  status: TeacherStatus;
}

export type UpdateTeacherPayload = Partial<CreateTeacherPayload>;
