import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import {
  Assessment,
  AssessmentBreakdownItem,
  CollectionResponse,
  ItemResponse
} from '../models/assessment.model';

@Injectable({
  providedIn: 'root'
})
export class AssessmentService {
  private readonly apiUrl = `${environment.apiUrl}/assessment`;

  constructor(private readonly http: HttpClient) {}

  getAssessments(): Observable<Assessment[]> {
    return this.http.get<CollectionResponse<Assessment> | Assessment[]>(this.apiUrl).pipe(
      timeout(15000),
      map((response) => this.unwrapArray(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to load assessments.'))
    );
  }

  getAssessmentByStudentId(studentId: string): Observable<Assessment> {
    return this.http.get<ItemResponse<Assessment> | Assessment>(`${this.apiUrl}/${studentId}`).pipe(
      timeout(15000),
      map((response) => this.unwrapItem(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to load assessment details.'))
    );
  }

  createAssessment(studentId: string): Observable<Assessment> {
    return this.http.post<ItemResponse<Assessment> | Assessment>(`${this.apiUrl}/${studentId}`, {}).pipe(
      timeout(15000),
      map((response) => this.unwrapItem(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to generate assessment.'))
    );
  }

  applyScholarship(studentId: string, payload: Record<string, unknown>): Observable<Assessment> {
    return this.http.post<ItemResponse<Assessment> | Assessment>(`${this.apiUrl}/${studentId}/apply-scholarship`, payload).pipe(
      timeout(15000),
      map((response) => this.unwrapItem(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to apply scholarship.'))
    );
  }

  getBreakdown(studentId: string): Observable<AssessmentBreakdownItem[]> {
    return this.http.get<CollectionResponse<AssessmentBreakdownItem> | AssessmentBreakdownItem[] | { data?: AssessmentBreakdownItem[]; breakdown?: AssessmentBreakdownItem[] }>(`${this.apiUrl}/${studentId}/breakdown`).pipe(
      timeout(15000),
      map((response) => this.unwrapBreakdown(response)),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to load assessment breakdown.'))
    );
  }

  private unwrapArray(response: CollectionResponse<Assessment> | Assessment[]): Assessment[] {
    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  private unwrapItem(response: ItemResponse<Assessment> | Assessment): Assessment {
    if (this.isAssessment(response)) {
      return response;
    }

    return response.data;
  }

  private unwrapBreakdown(
    response: CollectionResponse<AssessmentBreakdownItem> | AssessmentBreakdownItem[] | { data?: AssessmentBreakdownItem[]; breakdown?: AssessmentBreakdownItem[] }
  ): AssessmentBreakdownItem[] {
    if (Array.isArray(response)) {
      return response;
    }

    if ('breakdown' in response && Array.isArray(response.breakdown)) {
      return response.breakdown;
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  private isAssessment(value: unknown): value is Assessment {
    return !!value && typeof value === 'object' && 'student_id' in value && 'total_amount' in value;
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    const message =
      error.status === 0
        ? 'Request blocked by CORS or network. Verify API availability.'
        : error.error?.message || error.message || fallback;

    return throwError(() => new Error(message));
  }
}
