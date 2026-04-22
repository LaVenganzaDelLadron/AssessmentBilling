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
