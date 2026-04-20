import { Injectable } from '@angular/core';
import {
  CreateFeeStructurePayload,
  FeeStructure,
  UpdateFeeStructurePayload
} from '../models/fee-structure.model';
import { AdminCrudService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class FeeStructuresService extends AdminCrudService<
  FeeStructure,
  CreateFeeStructurePayload,
  UpdateFeeStructurePayload
> {
  constructor() {
    super('fee-structures');
  }

  setCachedFees(fees: FeeStructure[]): void {
    this.setCachedValue('mapped-list', fees);
  }

  getCachedFees(): FeeStructure[] | null {
    return this.getCachedValue<FeeStructure[]>('mapped-list');
  }
}
