import { Injectable } from '@angular/core';
import {
  Assessment,
  CreateAssessmentPayload,
  UpdateAssessmentPayload
} from '../models/assessment.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class AssessmentsService extends AdminCrudService<
  Assessment,
  CreateAssessmentPayload,
  UpdateAssessmentPayload
> {
  constructor() {
    super('assessments');
  }
}
