import { TeacherBaseModel, TeacherNumericValue } from './teacher-api.model';

export type TeacherAssessmentBreakdownSourceType = 'subject' | 'fee' | 'discount';

export interface TeacherAssessmentBreakdown extends TeacherBaseModel {
  assessment_id: number | null;
  source_type: TeacherAssessmentBreakdownSourceType;
  source_id: number | string | null;
  description: string;
  units: TeacherNumericValue | null;
  rate: TeacherNumericValue | null;
  amount: TeacherNumericValue;
}

export interface TeacherAssessmentBreakdownPayload {
  assessment_id: number | null;
  source_type: TeacherAssessmentBreakdownSourceType;
  source_id: number | string | null;
  description: string;
  units: number | null;
  rate: number | null;
  amount: number | null;
}
