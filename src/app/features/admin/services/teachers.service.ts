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
  private _cachedTeachers: Teacher[] | null = null;

  constructor() {
    super('teachers');
  }

  setCachedTeachers(teachers: Teacher[]): void {
    this._cachedTeachers = teachers;
  }

  getCachedTeachers(): Teacher[] | null {
    return this._cachedTeachers;
  }
}
