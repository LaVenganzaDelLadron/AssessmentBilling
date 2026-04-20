import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export type AssessmentBreakdownSourceType = 'subject' | 'fee' | 'discount';

export interface AssessmentBreakdown extends BaseAdminModel {
  assessment_id: number;
  source_type: AssessmentBreakdownSourceType;
  source_id: string | null;
  description: string;
  units: AdminNumericValue | null;
  rate: AdminNumericValue | null;
  amount: AdminNumericValue;
}

export type CreateAssessmentBreakdownPayload = Omit<
  AssessmentBreakdown,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateAssessmentBreakdownPayload =
  Partial<CreateAssessmentBreakdownPayload>;
