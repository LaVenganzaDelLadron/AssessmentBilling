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
  constructor() {
    super('academic-terms');
  }

  setCachedTerms(terms: AcademicTerm[]): void {
    this.setCachedValue('mapped-list', terms);
  }

  getCachedTerms(): AcademicTerm[] | null {
    return this.getCachedValue<AcademicTerm[]>('mapped-list');
  }
}
