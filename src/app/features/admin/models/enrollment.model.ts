import { TimestampedAdminModel } from './admin-api.model';

export type EnrollmentStatus = 'enrolled' | 'dropped';

export interface EnrollmentStudent {
  id: number | null;
  student_no?: string | null;
  name?: string | null;
}

export interface EnrollmentSubject {
  id: number | null;
  code?: string | null;
  name?: string | null;
  status?: EnrollmentStatus | string | null;
}

export interface EnrollmentAcademicTerm {
  id: number | null;
  school_year?: string | null;
  semester?: string | null;
}

export interface Enrollment extends TimestampedAdminModel {
  id: number | null;
  student_id: number | null;
  subject_id: number | null;
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  status: EnrollmentStatus | string;
  student?: EnrollmentStudent | null;
  subjects?: EnrollmentSubject[];
  academic_term?: EnrollmentAcademicTerm | null;
  subject_name?: string;
}

export type CreateEnrollmentPayload = Omit<
  Enrollment,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateEnrollmentPayload = Partial<CreateEnrollmentPayload>;
