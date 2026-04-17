export interface AdminSyncPayload {
  [key: string]: unknown;
}

export interface AdminSyncStatus {
  status?: string;
  message?: string;
  started_at?: string | null;
  finished_at?: string | null;
  last_synced_at?: string | null;
  [key: string]: unknown;
}
