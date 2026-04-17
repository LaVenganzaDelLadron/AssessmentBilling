import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export type AssessmentStatus = 'draft' | 'finalized';

export interface Assessment extends BaseAdminModel {
  student_id: number;
  academic_term_id: number;
  total_units: AdminNumericValue;
  status: AssessmentStatus;
}

export type CreateAssessmentPayload = Omit<
  Assessment,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateAssessmentPayload = Partial<CreateAssessmentPayload>;
