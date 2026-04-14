export interface SubjectProgramPivot {
  year_level: number | string;
  semester: string;
  school_year: string;
}

export interface SubjectProgram {
  id: number | string;
  code: string;
  name: string;
  department?: string | null;
  pivot?: SubjectProgramPivot | null;
}

export interface Subject {
  id: number | string;
  code?: string;
  name?: string;
  subject_code: string;
  subject_name: string;
  units?: number;
  programs?: SubjectProgram[] | null;
}

export interface SubjectListResponse {
  message?: string;
  data: Subject[];
}
