import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import { Program, ProgramListResponse } from '../models/program.model';

@Injectable({
  providedIn: 'root'
})
export class ProgramService {
  private readonly apiUrl = `${environment.apiUrl}/program`;

  constructor(private readonly http: HttpClient) {}

  getPrograms(): Observable<Program[]> {
    return this.http.get<ProgramListResponse | Program[]>(this.apiUrl).pipe(
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
            ? 'Request blocked by CORS or network. Verify Laravel CORS settings and API availability.'
            : error.error?.message ||
              error.message ||
              'Unable to load programs. Please try again.';
        return throwError(() => new Error(message));
      })
    );
  }
}
