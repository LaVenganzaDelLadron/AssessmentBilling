export interface Program {
  id: string;
  code: string;
  name: string;
  department: string;
  status: ProgramStatus;
  created_at?: string;
  updated_at?: string;
}

export type ProgramStatus = 'active' | 'inactive';

export interface ProgramListResponse {
  message?: string;
  data: Program[];
}
