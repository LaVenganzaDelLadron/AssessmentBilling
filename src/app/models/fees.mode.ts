export interface Fee {
  id: string;
  name: string;
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface FeePayload {
  id?: string;
  name: string;
  amount: number;
}

export interface CollectionResponse<T> {
  message?: string;
  data: T[];
}
