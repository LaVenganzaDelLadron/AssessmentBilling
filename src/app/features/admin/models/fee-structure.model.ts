import { AdminNumericValue, BaseAdminModel } from './admin-api.model';

export interface FeeStructure extends BaseAdminModel {
  program_id: number;
  fee_type: string;
  amount: AdminNumericValue;
  per_unit: boolean;
}

export type CreateFeeStructurePayload = Omit<
  FeeStructure,
  'id' | 'created_at' | 'updated_at'
>;

export type UpdateFeeStructurePayload = Partial<CreateFeeStructurePayload>;
