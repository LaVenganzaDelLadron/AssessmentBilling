import { Injectable } from '@angular/core';
import {
  CreateSubjectPayload,
  Subject,
  UpdateSubjectPayload
} from '../models/subject.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class SubjectsService extends AdminCrudService<
  Subject,
  CreateSubjectPayload,
  UpdateSubjectPayload
> {
  constructor() {
    super('subjects');
  }

  setCachedSubjects(subjects: Subject[]): void {
    this.setCachedValue('mapped-list', subjects);
  }

  getCachedSubjects(): Subject[] | null {
    return this.getCachedValue<Subject[]>('mapped-list');
  }
}
