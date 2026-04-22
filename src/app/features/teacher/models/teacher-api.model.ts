export type TeacherNumericValue = number | string;
export type TeacherDateString = string | null;

export interface TeacherBaseModel {
  id: number | null;
  created_at?: TeacherDateString;
  updated_at?: TeacherDateString;
}

export interface TeacherListResponse<T> {
  data?: T[];
  message?: string;
  status?: string;
}

export interface TeacherItemResponse<T> {
  data?: T;
  message?: string;
  status?: string;
}
