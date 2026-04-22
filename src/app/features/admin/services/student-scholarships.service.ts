import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateStudentScholarshipPayload,
  StudentScholarship,
  UpdateStudentScholarshipPayload
} from '../models/scholarship.model';
import {
  AdminItemResponse,
  AdminListResponse,
  AdminMessageResponse,
  AdminResourceId
} from '../models/admin-api.model';
import { AdminCrudService } from './admin-resource.service';
import { ScholarshipsService } from './scholarships.service';

@Injectable({ providedIn: 'root' })
export class StudentScholarshipsService extends AdminCrudService<
  StudentScholarship,
  CreateStudentScholarshipPayload,
  UpdateStudentScholarshipPayload
> {
  constructor(private scholarshipsService: ScholarshipsService) {
    super('student-scholarships');
  }

  override list(): Observable<AdminListResponse<StudentScholarship>> {
    return this.scholarshipsService.listStudentScholarships();
  }

  override create(
    payload: CreateStudentScholarshipPayload
  ): Observable<AdminItemResponse<StudentScholarship>> {
    return this.scholarshipsService.applyScholarship(payload);
  }

  override update(
    id: AdminResourceId,
    payload: UpdateStudentScholarshipPayload
  ): Observable<AdminItemResponse<StudentScholarship>> {
    return this.scholarshipsService.updateAppliedScholarship(id, payload);
  }

  override delete(id: AdminResourceId): Observable<AdminMessageResponse> {
    return this.scholarshipsService.deleteAppliedScholarship(id);
  }

  setCachedStudentScholarships(records: StudentScholarship[]): void {
    this.setCachedValue('mapped-list', records);
    this.scholarshipsService.setCachedAppliedScholarships(records);
  }

  getCachedStudentScholarships(): StudentScholarship[] | null {
    return this.getCachedValue<StudentScholarship[]>('mapped-list');
  }
}
