import { Injectable } from '@angular/core';
import {
  CreateEnrollmentPayload,
  Enrollment,
  UpdateEnrollmentPayload
} from '../models/enrollment.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class EnrollmentsService extends AdminCrudService<
  Enrollment,
  CreateEnrollmentPayload,
  UpdateEnrollmentPayload
> {
  private _cachedEnrollments: Enrollment[] | null = null;

  constructor() {
    super('enrollments');
  }

  setCachedEnrollments(enrollments: Enrollment[]): void {
    this._cachedEnrollments = enrollments;
  }

  getCachedEnrollments(): Enrollment[] | null {
    return this._cachedEnrollments;
  }
}
