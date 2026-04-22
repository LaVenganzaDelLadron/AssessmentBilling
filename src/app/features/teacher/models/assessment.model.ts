import { TeacherBaseModel, TeacherNumericValue } from './teacher-api.model';

export type TeacherAssessmentStatus = 'draft' | 'finalized';

export interface TeacherAssessment extends TeacherBaseModel {
  student_id: number | null;
  student_name?: string | null;
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  total_units: TeacherNumericValue;
  tuition_fee: TeacherNumericValue;
  misc_fee: TeacherNumericValue;
  lab_fee: TeacherNumericValue;
  other_fees: TeacherNumericValue;
  total_amount: TeacherNumericValue;
  discount: TeacherNumericValue;
  net_amount: TeacherNumericValue;
  status: TeacherAssessmentStatus | string;
}

export interface TeacherAssessmentPayload {
  student_id: number | null;
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  total_units: number | null;
  tuition_fee: number | null;
  misc_fee: number | null;
  lab_fee: number | null;
  other_fees: number | null;
  discount: number | null;
  status: TeacherAssessmentStatus;
}
