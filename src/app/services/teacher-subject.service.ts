import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import {
  CollectionResponse,
  TeacherSubject,
  TeacherSubjectPayload
} from '../models/teacher-subject.model';

@Injectable({
  providedIn: 'root'
})
export class TeacherSubjectService {
  private readonly apiUrl = `${environment.apiUrl}/teacher-subject`;

  constructor(private readonly http: HttpClient) {}

  getTeacherSubjects(): Observable<TeacherSubject[]> {
    return this.http.get<CollectionResponse<TeacherSubject> | TeacherSubject[]>(this.apiUrl).pipe(
      timeout(15000),
      map((response) => {
        if (Array.isArray(response)) {
          return response;
        }

        return Array.isArray(response.data) ? response.data : [];
      }),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.status === 0
            ? 'Request blocked by CORS or network. Verify API availability.'
            : error.error?.message ||
              error.message ||
              'Unable to load teacher-subject records.';

        return throwError(() => new Error(message));
      })
    );
  }

  assignSubject(payload: TeacherSubjectPayload): Observable<TeacherSubject> {
    return this.http.post<TeacherSubject>(this.apiUrl, payload).pipe(
      timeout(15000),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.error?.message ||
          error.message ||
          'Unable to assign subject. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }

  deleteAssignment(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      timeout(15000),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.error?.message ||
          error.message ||
          'Unable to remove assignment. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }
}
