import { Injectable } from '@angular/core';
import { AuditLog } from '../models/audit-log.model';
import { AdminReadService } from './admin-resource.service';

@Injectable({ providedIn: 'root' })
export class AuditLogsService extends AdminReadService<AuditLog> {
  constructor() {
    super('audit-logs');
  }

  setCachedLogs(logs: AuditLog[]): void {
    this.setCachedValue('mapped-list', logs);
  }

  getCachedLogs(): AuditLog[] | null {
    return this.getCachedValue<AuditLog[]>('mapped-list');
  }
}
