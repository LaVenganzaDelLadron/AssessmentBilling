export type BillingStatus = 'paid' | 'partial' | 'unpaid' | string;

export interface Billing {
  id: string;
  student_id: string;
  fee_id: string;
  total_amount: number;
  status: BillingStatus;
  billing_date: string;
  due_date: string;
  created_at?: string;
  updated_at?: string;
  student?: {
    id: string;
    name?: string;
    email?: string;
  } | null;
  fee?: {
    id: string;
    name?: string;
    amount?: number;
  } | null;
}

export interface BillingPayload {
  id?: string;
  student_id: string;
  fee_id: string;
  total_amount: number;
  status: BillingStatus;
  billing_date: string;
  due_date: string;
}

export interface CollectionResponse<T> {
  message?: string;
  data: T[];
}
