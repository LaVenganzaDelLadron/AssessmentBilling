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
  private _cachedBreakdowns: AssessmentBreakdown[] | null = null;

  constructor() {
    super('assessment-breakdown');
  }

  setCachedBreakdowns(breakdowns: AssessmentBreakdown[]): void {
    this._cachedBreakdowns = breakdowns;
  }

  getCachedBreakdowns(): AssessmentBreakdown[] | null {
    return this._cachedBreakdowns;
  }
}
