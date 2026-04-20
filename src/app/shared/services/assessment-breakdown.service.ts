import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface AssessmentBreakdown {
  id?: number;
  assessment_id: number;
  breakdown_name: string;
  percentage: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AssessmentBreakdownService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<AssessmentBreakdown[]> {
    return this.http.get<AssessmentBreakdown[]>(`${this.apiUrl}/admin/assessment-breakdowns`);
  }

  get(id: number): Observable<AssessmentBreakdown> {
    return this.http.get<AssessmentBreakdown>(`${this.apiUrl}/admin/assessment-breakdowns/${id}`);
  }

  create(data: AssessmentBreakdown): Observable<AssessmentBreakdown> {
    return this.http.post<AssessmentBreakdown>(`${this.apiUrl}/admin/assessment-breakdowns`, data);
  }

  update(id: number, data: AssessmentBreakdown): Observable<AssessmentBreakdown> {
    return this.http.put<AssessmentBreakdown>(`${this.apiUrl}/admin/assessment-breakdowns/${id}`, data);
  }

  delete(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/admin/assessment-breakdowns/${id}`);
  }
}
