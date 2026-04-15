import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError, timeout } from 'rxjs';
import { environment } from '../../environments/assessment/environment';
import {
  Assignment,
  AssignmentPayload,
  CollectionResponse,
  ItemResponse
} from '../models/assignment.model';

@Injectable({
  providedIn: 'root'
})
export class AssignmentService {
  private readonly apiUrl = `${environment.apiUrl}/assignment`;

  constructor(private readonly http: HttpClient) {}

  getAssignments(): Observable<Assignment[]> {
    return this.http.get<CollectionResponse<Assignment> | Assignment[]>(this.apiUrl).pipe(
      timeout(15000),
      map((response) => this.unwrapArray(response).map((row) => this.normalizeAssignment(row))),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to load assignments. Please try again.'))
    );
  }

  getAssignmentById(id: string): Observable<Assignment> {
    return this.http.get<ItemResponse<Assignment> | Assignment>(`${this.apiUrl}/${id}`).pipe(
      timeout(15000),
      map((response) => this.normalizeAssignment(this.unwrapItem(response))),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to load assignment details.'))
    );
  }

  createAssignment(payload: AssignmentPayload): Observable<Assignment> {
    return this.http.post<ItemResponse<Assignment> | Assignment>(this.apiUrl, payload).pipe(
      timeout(15000),
      map((response) => this.normalizeAssignment(this.unwrapItem(response))),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to create assignment.'))
    );
  }

  updateAssignment(id: string, payload: Partial<AssignmentPayload>): Observable<Assignment> {
    return this.http.put<ItemResponse<Assignment> | Assignment>(`${this.apiUrl}/${id}`, payload).pipe(
      timeout(15000),
      map((response) => this.normalizeAssignment(this.unwrapItem(response))),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to update assignment.'))
    );
  }

  deleteAssignment(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      timeout(15000),
      catchError((error: HttpErrorResponse) => this.handleError(error, 'Unable to delete assignment.'))
    );
  }

  private unwrapArray(response: CollectionResponse<Assignment> | Assignment[]): Assignment[] {
    if (Array.isArray(response)) {
      return response;
    }

    return Array.isArray(response.data) ? response.data : [];
  }

  private unwrapItem(response: ItemResponse<Assignment> | Assignment): Assignment {
    if (this.isAssignment(response)) {
      return response;
    }

    return response.data;
  }

  private normalizeAssignment(raw: Assignment): Assignment {
    const record = raw as Assignment & Record<string, unknown>;
    const normalizedId = this.resolveId(record);

    return {
      ...raw,
      id: normalizedId,
      subject_id: String(record.subject_id ?? ''),
      name: String(record.name ?? ''),
      description: record.description == null ? '' : String(record.description),
      due_date: String(record.due_date ?? '')
    };
  }

  private resolveId(record: Record<string, unknown>): string {
    const idValue = record['id'];
    if (typeof idValue === 'string' && idValue.trim()) {
      return idValue.trim();
    }

    if (typeof idValue === 'number' && idValue > 0) {
      return String(idValue);
    }

    const fallback =
      record['assignment_id'] ??
      record['assignmentId'] ??
      record['code'] ??
      record['uuid'];

    if (typeof fallback === 'string' && fallback.trim()) {
      return fallback.trim();
    }

    if (typeof fallback === 'number' && fallback > 0) {
      return String(fallback);
    }

    return String(idValue ?? '');
  }

  private isAssignment(value: unknown): value is Assignment {
    return !!value && typeof value === 'object' && 'id' in value;
  }

  private handleError(error: HttpErrorResponse, fallback: string): Observable<never> {
    const message =
      error.status === 0
        ? 'Request blocked by CORS or network. Verify API availability.'
        : error.error?.message || error.message || fallback;

    return throwError(() => new Error(message));
  }
}
