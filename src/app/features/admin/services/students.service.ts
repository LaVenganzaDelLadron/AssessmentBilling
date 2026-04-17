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
  constructor() {
    super('students');
  }
}
