import { Injectable } from '@angular/core';
import { AuditLog } from '../models/audit-log.model';
import { AdminReadService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class AuditLogsService extends AdminReadService<AuditLog> {
  private _cachedLogs: AuditLog[] | null = null;

  constructor() {
    super('audit-logs');
  }

  setCachedLogs(logs: AuditLog[]): void {
    this._cachedLogs = logs;
  }

  getCachedLogs(): AuditLog[] | null {
    return this._cachedLogs;
  }
}
