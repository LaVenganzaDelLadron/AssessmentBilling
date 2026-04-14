export interface StudentProgram {
  id: string;
  code: string;
  name: string;
  department?: string | null;
}

export interface Student {
  id: string;
  name: string;
  program_id?: string | null;
  program?: StudentProgram | null;
}

export interface StudentListResponse {
  message?: string;
  data: Student[];
}
