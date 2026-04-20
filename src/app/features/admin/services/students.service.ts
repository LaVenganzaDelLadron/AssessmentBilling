import { Injectable } from '@angular/core';
import {
  CreateStudentPayload,
  Student,
  UpdateStudentPayload
} from '../models/student.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class StudentsService extends AdminCrudService<
  Student,
  CreateStudentPayload,
  UpdateStudentPayload
> {
  private _cachedStudents: Student[] | null = null;

  constructor() {
    super('students');
  }

  setCachedStudents(students: Student[]): void {
    this._cachedStudents = students;
  }

  getCachedStudents(): Student[] | null {
    return this._cachedStudents;
  }
}
