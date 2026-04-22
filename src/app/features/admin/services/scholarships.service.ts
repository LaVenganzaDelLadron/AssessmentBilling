import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateStudentScholarshipPayload,
  CreateScholarshipPayload,
  Scholarship,
  StudentScholarship,
  UpdateStudentScholarshipPayload,
  UpdateScholarshipPayload
} from '../models/scholarship.model';
import {
  AdminItemResponse,
  AdminListResponse,
  AdminMessageResponse,
  AdminResourceId
} from '../models/admin-api.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class ScholarshipsService extends AdminCrudService<
  Scholarship,
  CreateScholarshipPayload,
  UpdateScholarshipPayload
> {
  constructor() {
    super('scholarships');
  }

  setCachedScholarships(scholarships: Scholarship[]): void {
    this.setCachedValue('mapped-list', scholarships);
  }

  getCachedScholarships(): Scholarship[] | null {
    return this.getCachedValue<Scholarship[]>('mapped-list');
  }

  listStudentScholarships(): Observable<AdminListResponse<StudentScholarship>> {
    return this.http.get<AdminListResponse<StudentScholarship>>(this.buildActionUrl('/students'));
  }

  applyScholarship(
    payload: CreateStudentScholarshipPayload
  ): Observable<AdminItemResponse<StudentScholarship>> {
    return this.http.post<AdminItemResponse<StudentScholarship>>(this.buildActionUrl('/apply'), payload);
  }

  updateAppliedScholarship(
    id: AdminResourceId,
    payload: UpdateStudentScholarshipPayload
  ): Observable<AdminItemResponse<StudentScholarship>> {
    return this.http.put<AdminItemResponse<StudentScholarship>>(
      this.buildActionUrl(`/apply/${id}`),
      payload
    );
  }

  deleteAppliedScholarship(id: AdminResourceId): Observable<AdminMessageResponse> {
    return this.http.delete<AdminMessageResponse>(this.buildActionUrl(`/apply/${id}`));
  }

  setCachedAppliedScholarships(records: StudentScholarship[]): void {
    this.setCachedValue('applied-list', records);
  }

  getCachedAppliedScholarships(): StudentScholarship[] | null {
    return this.getCachedValue<StudentScholarship[]>('applied-list');
  }

  private buildActionUrl(suffix: string): string {
    return `${super.collectionUrl()}${suffix}`;
  }
}
