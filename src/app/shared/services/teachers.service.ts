import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface Teacher {
  id?: number;
  user_id: number;
  employee_id: string;
  department?: string;
  phone_number?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TeachersService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(`${this.apiUrl}/admin/teachers`);
  }

  get(id: number): Observable<Teacher> {
    return this.http.get<Teacher>(`${this.apiUrl}/admin/teachers/${id}`);
  }

  create(data: Teacher): Observable<Teacher> {
    return this.http.post<Teacher>(`${this.apiUrl}/admin/teachers`, data);
  }

  update(id: number, data: Teacher): Observable<Teacher> {
    return this.http.put<Teacher>(`${this.apiUrl}/admin/teachers/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/teachers/${id}`);
  }
}
