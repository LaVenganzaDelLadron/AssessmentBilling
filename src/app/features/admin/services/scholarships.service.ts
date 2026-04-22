import { Injectable } from '@angular/core';
import {
  CreateScholarshipPayload,
  Scholarship,
  UpdateScholarshipPayload
} from '../models/scholarship.model';
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
}
