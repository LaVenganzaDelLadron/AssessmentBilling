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
  constructor() {
    super('enrollments');
  }

  setCachedEnrollments(enrollments: Enrollment[]): void {
    this.setCachedValue('mapped-list', enrollments);
  }

  getCachedEnrollments(): Enrollment[] | null {
    return this.getCachedValue<Enrollment[]>('mapped-list');
  }
}
