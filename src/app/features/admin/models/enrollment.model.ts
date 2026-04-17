import { BaseAdminModel } from './admin-api.model';

export type EnrollmentStatus = 'enrolled' | 'dropped';

export interface Enrollment extends BaseAdminModel {
  student_id: number;
  subject_id: number;
  academic_term_id: number;
  status: EnrollmentStatus;
}

export type CreateEnrollmentPayload = Omit<
  Enrollment,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateEnrollmentPayload = Partial<CreateEnrollmentPayload>;
