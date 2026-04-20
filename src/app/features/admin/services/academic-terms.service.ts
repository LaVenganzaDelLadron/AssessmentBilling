import { Injectable } from '@angular/core';
import {
  AcademicTerm,
  CreateAcademicTermPayload,
  UpdateAcademicTermPayload
} from '../models/academic-term.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class AcademicTermsService extends AdminCrudService<
  AcademicTerm,
  CreateAcademicTermPayload,
  UpdateAcademicTermPayload
> {
  private _cachedTerms: AcademicTerm[] | null = null;

  constructor() {
    super('academic-terms');
  }

  setCachedTerms(terms: AcademicTerm[]): void {
    this._cachedTerms = terms;
  }

  getCachedTerms(): AcademicTerm[] | null {
    return this._cachedTerms;
  }
}
