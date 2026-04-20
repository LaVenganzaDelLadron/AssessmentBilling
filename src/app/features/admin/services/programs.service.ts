import { Injectable } from '@angular/core';
import {
  CreateProgramPayload,
  Program,
  UpdateProgramPayload
} from '../models/program.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class ProgramsService extends AdminCrudService<
  Program,
  CreateProgramPayload,
  UpdateProgramPayload
> {
  private _cachedPrograms: Program[] | null = null;

  constructor() {
    super('programs');
  }

  setCachedPrograms(programs: Program[]): void {
    this._cachedPrograms = programs;
  }

  getCachedPrograms(): Program[] | null {
    return this._cachedPrograms;
  }
}
