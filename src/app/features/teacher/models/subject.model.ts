import { TeacherBaseModel, TeacherNumericValue } from './teacher-api.model';

export interface TeacherProgramSummary {
  id: number | null;
  name?: string | null;
  code?: string | null;
}

export interface TeacherSubject extends TeacherBaseModel {
  code: string;
  name: string;
  units: TeacherNumericValue;
  program_id: number | null;
  program_name?: string | null;
  type?: string | null;
  status?: string | null;
  custom_id?: string | null;
  program?: TeacherProgramSummary | null;
}
