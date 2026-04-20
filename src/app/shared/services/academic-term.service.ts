import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface AcademicTerm {
  id?: number;
  school_year: string;
  semester: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AcademicTermService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAcademicTerms(): Observable<AcademicTerm[]> {
    return this.http.get<AcademicTerm[]>(`${this.apiUrl}/admin/academic-terms`);
  }

  getAcademicTerm(id: number): Observable<AcademicTerm> {
    return this.http.get<AcademicTerm>(`${this.apiUrl}/admin/academic-terms/${id}`);
  }

  createAcademicTerm(data: AcademicTerm): Observable<AcademicTerm> {
    return this.http.post<AcademicTerm>(`${this.apiUrl}/admin/academic-terms`, data);
  }

  updateAcademicTerm(id: number, data: AcademicTerm): Observable<AcademicTerm> {
    return this.http.put<AcademicTerm>(`${this.apiUrl}/admin/academic-terms/${id}`, data);
  }

  deleteAcademicTerm(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/academic-terms/${id}`);
  }
}
