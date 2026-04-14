import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import { Student, StudentListResponse } from '../models/student.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private readonly apiUrl = `${environment.apiUrl}/student`;

  constructor(private readonly http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<StudentListResponse | Student[]>(this.apiUrl).pipe(
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
              'Unable to load students. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }
}
