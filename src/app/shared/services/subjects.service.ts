import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface Subject {
  id?: number;
  program_id: number;
  subject_name: string;
  subject_code: string;
  credits?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubjectsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Subject[]> {
    return this.http.get<Subject[]>(`${this.apiUrl}/admin/subjects`);
  }

  get(id: number): Observable<Subject> {
    return this.http.get<Subject>(`${this.apiUrl}/admin/subjects/${id}`);
  }

  create(data: Subject): Observable<Subject> {
    return this.http.post<Subject>(`${this.apiUrl}/admin/subjects`, data);
  }

  update(id: number, data: Subject): Observable<Subject> {
    return this.http.put<Subject>(`${this.apiUrl}/admin/subjects/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/subjects/${id}`);
  }
}
