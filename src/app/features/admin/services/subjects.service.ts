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
}
