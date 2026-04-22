import { TeacherAcademicTerm } from './academic-term.model';
import { TeacherBaseModel } from './teacher-api.model';
import { TeacherSubject } from './subject.model';

export interface TeacherEnrollmentStudent {
  id: number | null;
  student_no?: string | null;
  first_name?: string | null;
  middle_name?: string | null;
  last_name?: string | null;
  name?: string | null;
}

export interface TeacherEnrollment extends TeacherBaseModel {
  student_id: number | null;
  subject_id: number | null;
  academic_term_id: number | null;
  semester: string;
  school_year: string;
  status: string;
  student?: TeacherEnrollmentStudent | null;
  subject?: TeacherSubject | null;
  subjects?: TeacherSubject[];
  academic_term?: TeacherAcademicTerm | null;
  subject_name?: string | null;
}
