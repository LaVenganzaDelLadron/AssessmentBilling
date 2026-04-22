import { TeacherBaseModel, TeacherDateString } from './teacher-api.model';

export interface TeacherAcademicTerm extends TeacherBaseModel {
  school_year: string;
  semester: string;
  start_date: TeacherDateString;
  end_date: TeacherDateString;
  is_active: boolean;
}
