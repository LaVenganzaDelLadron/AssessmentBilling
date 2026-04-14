import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import { Billing, BillingPayload, CollectionResponse } from '../models/billing.model';

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  private readonly apiUrl = `${environment.apiUrl}/billing`;

  constructor(private readonly http: HttpClient) {}

  getBillings(): Observable<Billing[]> {
    return this.http.get<CollectionResponse<Billing> | Billing[]>(this.apiUrl).pipe(
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
              'Unable to load billing records. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }

  createBilling(payload: BillingPayload): Observable<Billing> {
    return this.http.post<Billing>(this.apiUrl, payload).pipe(
      timeout(15000),
      catchError((error: HttpErrorResponse) => {
        const message =
          error.error?.message ||
          error.message ||
          'Unable to create billing record. Please try again.';

        return throwError(() => new Error(message));
      })
    );
  }
}
