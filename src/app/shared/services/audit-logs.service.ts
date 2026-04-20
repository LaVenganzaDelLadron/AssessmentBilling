import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/assessment/environment';

export interface AuditLog {
  id?: number;
  user_id: number;
  action: string;
  model: string;
  model_id: number;
  old_values?: string;
  new_values?: string;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditLogsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<AuditLog[]> {
    return this.http.get<AuditLog[]>(`${this.apiUrl}/admin/audit-logs`);
  }

  get(id: number): Observable<AuditLog> {
    return this.http.get<AuditLog>(`${this.apiUrl}/admin/audit-logs/${id}`);
  }
}
