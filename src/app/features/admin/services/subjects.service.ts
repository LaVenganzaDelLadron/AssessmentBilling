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
  private _cachedSubjects: Subject[] | null = null;

  constructor() {
    super('subjects');
  }

  setCachedSubjects(subjects: Subject[]): void {
    this._cachedSubjects = subjects;
  }

  getCachedSubjects(): Subject[] | null {
    return this._cachedSubjects;
  }
}
