import { AdminDateTimeString, BaseAdminModel } from './admin-api.model';

export type ScholarshipDiscountType = 'percent' | 'amount';

export interface StudentScholarshipSummary {
  id: number | null;
  student_id: number | null;
  scholarship_id: number | null;
  discount_type: ScholarshipDiscountType;
  discount_value: number | string;
  original_amount?: number | string | null;
  discount_amount?: number | string | null;
  final_amount?: number | string | null;
  applied_at?: AdminDateTimeString | null;
  student?: {
    id: number | null;
    student_no?: string | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    email?: string | null;
  } | null;
  scholarship?: {
    id: number | null;
    name?: string | null;
    description?: string | null;
  } | null;
}

export interface Scholarship extends BaseAdminModel {
  name: string;
  description?: string | null;
  discount_type: ScholarshipDiscountType;
  discount_value: number | string;
  is_active: boolean;
  student_scholarships?: StudentScholarshipSummary[];
}

export interface CreateScholarshipPayload {
  name: string;
  description?: string | null;
  discount_type: ScholarshipDiscountType;
  discount_value: number | string;
  is_active?: boolean;
}

export type UpdateScholarshipPayload = Partial<CreateScholarshipPayload>;

export interface StudentScholarship extends BaseAdminModel {
  student_id: number | null;
  scholarship_id: number | null;
  discount_type: ScholarshipDiscountType;
  discount_value: number | string;
  original_amount: number | string | null;
  discount_amount: number | string | null;
  final_amount: number | string | null;
  applied_at?: AdminDateTimeString | null;
  student?: StudentScholarshipSummary['student'];
  scholarship?: StudentScholarshipSummary['scholarship'];
}

export interface CreateStudentScholarshipPayload {
  student_id: number | null;
  scholarship_id: number | null;
  discount_type: ScholarshipDiscountType;
  discount_value: number | string;
  original_amount: number | string | null;
  discount_amount: number | string | null;
  final_amount: number | string | null;
  applied_at?: AdminDateTimeString | null;
}

export type UpdateStudentScholarshipPayload = Partial<CreateStudentScholarshipPayload>;
