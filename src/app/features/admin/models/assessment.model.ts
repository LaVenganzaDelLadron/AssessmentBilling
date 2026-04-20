import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export type AssessmentStatus = 'draft' | 'finalized';

export interface Assessment extends BaseAdminModel {
  student_id: number;
  academic_term_id: number;
  semester: string;
  school_year: string;
  total_units: AdminNumericValue;
  tuition_fee: AdminNumericValue;
  misc_fee: AdminNumericValue;
  lab_fee: AdminNumericValue;
  other_fees: AdminNumericValue;
  total_amount: AdminNumericValue;
  discount: AdminNumericValue;
  net_amount: AdminNumericValue;
  status: AssessmentStatus;
}

export type CreateAssessmentPayload = Omit<
  Assessment,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateAssessmentPayload = Partial<CreateAssessmentPayload>;
