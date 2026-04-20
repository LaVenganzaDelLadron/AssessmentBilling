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
  constructor() {
    super('programs');
  }

  setCachedPrograms(programs: Program[]): void {
    this.setCachedValue('mapped-list', programs);
  }

  getCachedPrograms(): Program[] | null {
    return this.getCachedValue<Program[]>('mapped-list');
  }
}
