export interface TeacherSubject {
  id: string;
  teacher_id: string;
  subject_id: string;
  created_at?: string;
  updated_at?: string;
  teacher?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  subject?: {
    id: string;
    code?: string;
    name?: string;
    subject_code?: string;
    subject_name?: string;
  } | null;
}

export interface TeacherSubjectPayload {
  teacher_id: string;
  subject_id: string;
}

export interface CollectionResponse<T> {
  message?: string;
  data: T[];
}
