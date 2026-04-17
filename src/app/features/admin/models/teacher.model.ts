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
}

export type CreateTeacherPayload = Omit<
  Teacher,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateTeacherPayload = Partial<CreateTeacherPayload>;
