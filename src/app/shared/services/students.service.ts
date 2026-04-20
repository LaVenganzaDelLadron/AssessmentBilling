import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface Student {
  id?: number;
  user_id: number;
  student_id_number: string;
  program_id: number;
  date_of_birth?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StudentsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/admin/students`);
  }

  get(id: number): Observable<Student> {
    return this.http.get<Student>(`${this.apiUrl}/admin/students/${id}`);
  }

  create(data: Student): Observable<Student> {
    return this.http.post<Student>(`${this.apiUrl}/admin/students`, data);
  }

  update(id: number, data: Student): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/admin/students/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/students/${id}`);
  }
}
