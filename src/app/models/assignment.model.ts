export interface Assignment {
  id: string;
  subject_id: string;
  name: string;
  description?: string | null;
  due_date: string;
  created_at?: string;
  updated_at?: string;
}

export interface AssignmentPayload {
  subject_id: string;
  name: string;
  description?: string;
  due_date: string;
}

export interface CollectionResponse<T> {
  message?: string;
  data: T[];
}

export interface ItemResponse<T> {
  message?: string;
  data: T;
}
