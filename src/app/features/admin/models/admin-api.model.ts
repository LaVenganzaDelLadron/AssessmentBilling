export type AdminResourceId = number | string;
export type AdminDateString = string;
export type AdminDateTimeString = string;
export type AdminNumericValue = number | string;
export type AdminQueryParamValue = string | number | boolean;
export type AdminQueryParams = Record<
  string,
  AdminQueryParamValue | readonly AdminQueryParamValue[] | null | undefined
>;

export interface TimestampedAdminModel {
  created_at: AdminDateTimeString | null;
  updated_at: AdminDateTimeString | null;
}

export interface BaseAdminModel extends TimestampedAdminModel {
  id: number;
}

export interface AdminResourceEnvelope<T> {
  data: T;
  message?: string;
}

export interface AdminPaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface AdminPaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  path: string;
  per_page: number;
  to: number | null;
  total: number;
}

export interface AdminPaginatedEnvelope<T> {
  data: T[];
  links?: AdminPaginationLink[];
  meta?: AdminPaginationMeta;
  message?: string;
}

export type AdminListResponse<T> =
  | T[]
  | AdminResourceEnvelope<T[]>
  | AdminPaginatedEnvelope<T>;

export type AdminItemResponse<T> = T | AdminResourceEnvelope<T>;

export interface AdminMessageResponse {
  message?: string;
}
