import { Injectable } from '@angular/core';
import {
  AssessmentBreakdown,
  CreateAssessmentBreakdownPayload,
  UpdateAssessmentBreakdownPayload
} from '../models/assessment-breakdown.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class AssessmentBreakdownService extends AdminCrudService<
  AssessmentBreakdown,
  CreateAssessmentBreakdownPayload,
  UpdateAssessmentBreakdownPayload
> {
  constructor() {
    super('assessment-breakdown');
  }
}
