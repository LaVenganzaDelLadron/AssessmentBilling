import { Injectable } from '@angular/core';
import {
  CreateTeacherPayload,
  Teacher,
  UpdateTeacherPayload
} from '../models/teacher.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class TeachersService extends AdminCrudService<
  Teacher,
  CreateTeacherPayload,
  UpdateTeacherPayload
> {
  constructor() {
    super('teachers');
  }
}
