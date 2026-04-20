import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface Program {
  id?: number;
  program_name: string;
  program_code: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProgramsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Program[]> {
    return this.http.get<Program[]>(`${this.apiUrl}/admin/programs`);
  }

  get(id: number): Observable<Program> {
    return this.http.get<Program>(`${this.apiUrl}/admin/programs/${id}`);
  }

  create(data: Program): Observable<Program> {
    return this.http.post<Program>(`${this.apiUrl}/admin/programs`, data);
  }

  update(id: number, data: Program): Observable<Program> {
    return this.http.put<Program>(`${this.apiUrl}/admin/programs/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/programs/${id}`);
  }
}
