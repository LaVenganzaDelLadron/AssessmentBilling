import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import { CollectionResponse, Fee, FeePayload } from '../models/fees.mode';

@Injectable({
  providedIn: 'root'
})
export class FeesService {
  private readonly apiUrl = `${environment.apiUrl}/fees`;

  constructor(private readonly http: HttpClient) {}

  getFees(): Observable<Fee[]> {
    return this.http.get<CollectionResponse<Fee> | Fee[]>(this.apiUrl).pipe(
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
              'Unable to load fees. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }

  createFee(payload: FeePayload): Observable<Fee> {
    return this.http.post<Fee>(this.apiUrl, payload).pipe(
      timeout(15000),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.error?.message ||
          error.message ||
          'Unable to create fee. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }
}
