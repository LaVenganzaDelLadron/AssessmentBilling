import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface AssessmentModel {
  id?: number;
  subject_id: number;
  academic_term_id: number;
  assessment_name: string;
  assessment_date: string;
  total_marks: number;
  status: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<AssessmentModel[]> {
    return this.http.get<AssessmentModel[]>(`${this.apiUrl}/admin/assessments`);
  }

  get(id: number): Observable<AssessmentModel> {
    return this.http.get<AssessmentModel>(`${this.apiUrl}/admin/assessments/${id}`);
  }

  create(data: AssessmentModel): Observable<AssessmentModel> {
    return this.http.post<AssessmentModel>(`${this.apiUrl}/admin/assessments`, data);
  }

  update(id: number, data: AssessmentModel): Observable<AssessmentModel> {
    return this.http.put<AssessmentModel>(`${this.apiUrl}/admin/assessments/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/assessments/${id}`);
  }
}
